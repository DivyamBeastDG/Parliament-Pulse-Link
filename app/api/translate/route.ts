import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    // Map our frontend codes to natural language names for the AI prompt
    const langNames: Record<string, string> = { 
      'hi': 'Hindi', 
      'gar': 'Garhwali', 
      'kum': 'Kumaoni' 
    };
    const targetLanguageName = langNames[targetLang] || 'Hindi';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert Indian linguist and legislative translator. Translate the following English text into ${targetLanguageName}. Return ONLY the translated text, nothing else. Keep the tone professional, natural, and easy for a common citizen to understand.` 
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
      }),
    });

    const groqData = await groqRes.json();
    if (groqData.choices?.[0]?.message?.content) {
      return NextResponse.json({ translatedText: groqData.choices[0].message.content });
    }

    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error('Translation Route Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}