import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { extractText } from 'unpdf'; 

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 
    'X-Title': 'Parliament Pulse Link',
  }
});

export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const { text } = await extractText(uint8Array);
    
    const fullText = Array.isArray(text) ? text.join(' ') : text;
    const cleanText = fullText.substring(0, 6000); 

    if (!cleanText || cleanText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not read text from this PDF. Ensure it is not a scanned image or password protected.' }, { status: 400 });
    }

    const prompt = `You are an expert legislative analyst for the Indian state of Uttarakhand. 
    Analyze the following text extracted from a legislative bill PDF.
    
    Text: """${cleanText}"""
    
    Return ONLY a valid JSON object with exactly these keys: 'title', 'status', 'department', 'what', 'why', 'impact'.
    - 'title': The official name of the bill. If not explicitly clear, infer a professional title from the text.
    - 'status': Must be exactly one of: 'Introduced', 'Passed', 'Pending', or 'Rejected'.
    - 'department': The government department handling this (e.g., Health, Forest, Law, Finance).
    - 'what': A 1-2 sentence explanation of what the bill does.
    - 'why': The stated or logical reason for its introduction.
    - 'impact': How it affects the common citizen of Uttarakhand.
    
    CRITICAL: Output MUST be valid JSON. Do not include markdown formatting or backticks.`;

    const completion = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || "qwen/qwen-2.5-72b-instruct",
      messages: [
        { role: "system", content: "You are an expert AI assistant that outputs ONLY valid, raw JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
    });

    let rawContent = completion.choices[0].message.content || "{}";
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(rawContent);

    const { data, error } = await supabase
      .from('bills')
      .insert({
        title: aiData.title || file.name.replace('.pdf', ''),
        status: aiData.status || 'Pending',
        department: aiData.department || 'Unknown',
        date_introduced: new Date().toISOString().split('T')[0],
        ai_summary_what: aiData.what || 'Summary not available.',
        ai_summary_why: aiData.why || 'Summary not available.',
        ai_summary_impact: aiData.impact || 'Summary not available.',
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, bill: data[0] });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process PDF' }, { status: 500 });
  }
}