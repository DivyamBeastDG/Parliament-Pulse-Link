import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { extractText } from 'unpdf'; 

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 'X-Title': 'Parliament Pulse Link' }
});

export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file || file.type !== 'application/pdf') return NextResponse.json({ error: 'Valid PDF required.' }, { status: 400 });

    // 1. Upload PDF to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const { error: storageError } = await supabase.storage.from('bill-pdfs').upload(fileName, buffer, { contentType: 'application/pdf' });
    if (storageError) throw new Error('Storage upload failed');
    
    const { data: urlData } = supabase.storage.from('bill-pdfs').getPublicUrl(fileName);
    const pdfUrl = urlData.publicUrl;

    // 2. Extract Text
    const uint8Array = new Uint8Array(arrayBuffer);
    const { text } = await extractText(uint8Array);
    const fullText = Array.isArray(text) ? text.join(' ') : text;
    const cleanText = fullText.substring(0, 8000); 

    if (!cleanText || cleanText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not read text from PDF.' }, { status: 400 });
    }

    // 3. The "Comprehensive" AI Prompt
    const prompt = `You are a Senior Legislative Analyst for the Uttarakhand Assembly. Analyze this bill text deeply.
    
    Text: """${cleanText}"""
    
    Return ONLY valid JSON with these exact keys: 'title', 'status', 'department', 'summary_objective', 'key_provisions', 'penalties', 'citizen_impact'.
    
    CRITICAL FORMATTING RULES:
    - 'title': Official name of the bill.
    - 'status': 'Introduced', 'Passed', 'Pending', or 'Rejected'.
    - 'department': The handling ministry/department.
    - 'summary_objective': A comprehensive 2-3 paragraph explanation of the bill's core purpose and legal intent.
    - 'key_provisions': A single string containing 5 to 10 highly detailed bullet points. Format EXACTLY like this: "- Provision 1\n- Provision 2\n- Provision 3". Do not use JSON arrays.
    - 'penalties': Detailed explanation of fines, jail terms, or enforcement mechanisms.
    - 'citizen_impact': Deep analysis of how this affects the daily life, businesses, or rights of Uttarakhand citizens.
    
    Output MUST be valid JSON. No markdown backticks.`;

    const completion = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || "qwen/qwen-2.5-72b-instruct",
      messages: [
        { role: "system", content: "You are an expert AI that outputs ONLY valid, raw JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    let rawContent = completion.choices[0].message.content || "{}";
    
    // Step 1: Strip markdown formatting
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Step 2: Extract only the JSON object (from first { to last })
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawContent = rawContent.substring(firstBrace, lastBrace + 1);
    }
    
    // Step 3: Try to parse. If it fails due to unescaped newlines inside strings, fix them.
    let aiData: any;
    try {
      aiData = JSON.parse(rawContent);
    } catch (firstError) {
      // The AI put raw newlines inside string values. Fix ONLY newlines inside quoted strings.
      let fixed = rawContent.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      });
      aiData = JSON.parse(fixed);
    }
    // 4. Save Comprehensive Data to Database
    const { data, error } = await supabase.from('bills').insert({
      title: aiData.title || file.name.replace('.pdf', ''),
      status: aiData.status || 'Pending',
      department: aiData.department || 'Unknown',
      date_introduced: new Date().toISOString().split('T')[0],
      summary_objective: aiData.summary_objective || '',
      key_provisions: aiData.key_provisions || '',
      penalties: aiData.penalties || '',
      citizen_impact: aiData.citizen_impact || '',
      pdf_url: pdfUrl,
      // Keep old columns for backward compatibility just in case
      ai_summary_what: aiData.summary_objective || '', 
      ai_summary_why: aiData.citizen_impact || '',
      ai_summary_impact: aiData.penalties || ''
    }).select();

    if (error) throw error;
    return NextResponse.json({ success: true, bill: data[0] });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process PDF' }, { status: 500 });
  }
}