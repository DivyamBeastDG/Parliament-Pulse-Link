import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Point the standard OpenAI client to Groq's free servers
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def generate_bill_summary(bill_title: str, bill_details: str = "") -> dict:
    prompt = f"""You are an expert legislative analyst for the Indian state of Uttarakhand. 
    Provide a concise, citizen-friendly summary of the following bill: '{bill_title}'.
    Context: {bill_details}
    
    Return ONLY a valid JSON object with exactly three keys: 'what', 'why', and 'impact'.
    - 'what': A 1-2 sentence explanation of what the bill does.
    - 'why': The stated or logical reason for its introduction.
    - 'impact': How it affects the common citizen of Uttarakhand (economic, social, or practical).
    Keep the language simple, neutral, and easy to understand. Do not include markdown formatting."""

    try:
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"⚠️ Error generating summary with Groq: {e}")
        return {
            "what": f"Summary for {bill_title} is currently being generated.",
            "why": "To improve legislative transparency.",
            "impact": "Will affect citizens of Uttarakhand."
        }