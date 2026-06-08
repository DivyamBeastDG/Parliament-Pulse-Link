from sentence_transformers import SentenceTransformer

print("⏳ Loading free local AI embedding model (all-MiniLM-L6-v2)...")
print("   (This downloads ~80MB on the first run, then it's instant!)")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Local AI model loaded successfully!")

def get_embedding(text: str) -> list[float]:
    # Generates a 384-dimensional vector locally
    return model.encode(text).tolist()