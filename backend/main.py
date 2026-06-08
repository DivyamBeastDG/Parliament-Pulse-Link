from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from embeddings import get_embedding
from database import supabase
from pydantic import BaseModel
import os

app = FastAPI(title="Parliament Pulse Link Backend")

# Allow localhost and future Vercel deployments
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str

@app.post("/ingest/real-data")
def ingest_real_data():
    try:
        import seed_data
        seed_data.seed_bills()
        seed_data.seed_representatives()
        return {"message": "Successfully seeded real Uttarakhand data.", "count": "25+"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_bills(req: SearchRequest):
    try:
        query_embedding = get_embedding(req.query)
        response = supabase.rpc('match_bills', {
            'query_embedding': query_embedding,
            'match_count': 10
        }).execute()
        return {"results": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "ai_model": "local-all-MiniLM-L6-v2"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)