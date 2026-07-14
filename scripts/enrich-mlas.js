// scripts/enrich-mlas.js
require('dotenv').config({ path: '.env.local' }); 

// 🛠️ FIX FOR NODE 20: Provide WebSocket support for Supabase
global.WebSocket = require('ws').WebSocket;

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

// ... (keep the rest of your code exactly the same)

// 1. Initialize Clients
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const aiClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { 'X-Title': 'Parliament Pulse Link' }
});

async function getWikipediaText(name) {
  try {
    // Search Wikipedia for the MLA
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)} Uttarakhand politician&srlimit=1&format=json`;
    const searchRes = await axios.get(searchUrl);
    const results = searchRes.data.query.search;
    if (results.length === 0) return null;

    const pageTitle = results[0].title;
    
    // Fetch the actual text of the page
    const textUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json`;
    const textRes = await axios.get(textUrl);
    const pages = textRes.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    return pages[pageId].extract || null;
  } catch (e) {
    return null;
  }
}

async function extractWithAI(name, party, constituency, wikiText) {
  const prompt = `You are a strict data extraction engine for a Civic-Tech platform. 
  You DO NOT generate new information or hallucinate. You ONLY extract facts from the provided Wikipedia text.
  
  MLA Name: ${name}
  Party: ${party}
  Constituency: ${constituency}
  
  Wikipedia Text: """${wikiText.substring(0, 6000)}"""
  
  Return ONLY valid JSON with these exact keys: 'bio', 'education_profession', 'political_journey', 'key_issues'.
  - 'bio': 2 paragraphs summarizing early life and background.
  - 'education_profession': Exact degrees and professions mentioned.
  - 'political_journey': Chronological milestones (format as bullet points using "- ").
  - 'key_issues': Main legislative focus or controversies mentioned.
  
  CRITICAL: If a specific detail is NOT in the text, return an empty string "" for that key. Do not guess. Output MUST be valid JSON.`;

  const completion = await aiClient.chat.completions.create({
    model: process.env.QWEN_MODEL || "qwen/qwen-2.5-72b-instruct",
    messages: [
      { role: "system", content: "You are a strict data extractor. Output ONLY raw JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.0, // Zero temperature prevents hallucinations
  });

  let raw = completion.choices[0].message.content || "{}";
  raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Extract JSON object safely
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first !== -1 && last !== -1) raw = raw.substring(first, last + 1);
  
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function runPipeline() {
  console.log("🚀 Starting Automated MLA Enrichment Pipeline...\n");
  
  const { data: reps, error } = await supabaseAdmin.from('representatives').select('*');
  if (error || !reps) return console.error("Failed to fetch reps");

  for (let i = 0; i < reps.length; i++) {
    const rep = reps[i];
    
    // Skip if already enriched
    if (rep.bio && rep.bio.length > 50) {
      console.log(`[${i + 1}/${reps.length}] ⏭️  Skipping ${rep.name} (Already enriched)`);
      continue;
    }

    console.log(`[${i + 1}/${reps.length}] 🔍 Searching Wikipedia for: ${rep.name}...`);
    const wikiText = await getWikipediaText(rep.name);

    if (!wikiText) {
      console.log(`   ❌ No Wikipedia data found for ${rep.name}. Skipping.\n`);
      continue;
    }

    console.log(`   🧠 Extracting facts with Qwen AI...`);
    const aiData = await extractWithAI(rep.name, rep.party, rep.constituency, wikiText);

    if (aiData) {
      const { error: updateError } = await supabaseAdmin
        .from('representatives')
        .update({
          bio: aiData.bio || '',
          education_profession: aiData.education_profession || '',
          political_journey: aiData.political_journey || '',
          key_issues: aiData.key_issues || ''
        })
        .eq('id', rep.id);

      if (updateError) {
        console.log(`   ⚠️ Failed to save to DB: ${updateError.message}\n`);
      } else {
        console.log(`   ✅ Successfully enriched and saved ${rep.name}!\n`);
      }
    }
    
    // Sleep for 1 second to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("🎉 Pipeline complete! Your database is now populated with verified data.");
}

runPipeline();