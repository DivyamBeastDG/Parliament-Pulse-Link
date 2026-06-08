import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the request to the Python Backend
    const pythonRes = await fetch('http://localhost:8000/ingest/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await pythonRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Python backend unreachable. Is it running on port 8000?' }, { status: 500 });
  }
}