# Parliament Pulse Link - Uttarakhand Edition

AI-powered legislative intelligence platform.

## Setup
1. `npm install`
2. `cd backend && pip install -r requirements.txt && cd ..`
3. Fill in `.env.local` and `backend/.env` with your Supabase and OpenRouter keys.
4. Run Supabase schema in `supabase/schema.sql`.
5. Frontend: `npm run dev`
6. Backend: `cd backend && python main.py`
7. Scrape real data: `curl -X POST http://localhost:8000/ingest/bills`