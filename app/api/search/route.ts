import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

    // Use Supabase's built-in ILIKE (case-insensitive) search
    // This searches both the bill title and the AI summary for matching keywords
    const { data: bills, error } = await supabase
      .from('bills')
      .select('id, title, status, department, ai_summary_what')
      .or(`title.ilike.%${query}%,ai_summary_what.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    // Add a dummy similarity score so the frontend UI doesn't break
    const results = bills?.map(bill => ({ ...bill, similarity: 1.0 })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}