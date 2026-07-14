import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Parliament Pulse Link',
      }
    });

    const { text, targetLang } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const langNames: Record<string, string> = { 'hi': 'Hindi', 'gar': 'Garhwali', 'kum': 'Kumaoni' };
    const targetLanguageName = langNames[targetLang] || 'Hindi';

    const completion = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || "qwen/qwen-2.5-72b-instruct",
      messages: [
        { role: 'system', content: `You are an expert Indian linguist and translator. Translate the following text into ${targetLanguageName}. Return ONLY the translated text, nothing else. Maintain a professional, citizen-friendly tone.` },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
    });

    const translatedText = completion.choices[0].message.content || text;
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}