import os
from dotenv import load_dotenv
load_dotenv()
from litestar import post, Request
from litestar.exceptions import HTTPException
from pydantic import BaseModel

# Initialize Gemini Client if key exists
from google import genai
from google.genai import types

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

SYSTEM_INSTRUCTION = """You are the Retail AI Trading Assistant for the DRL Stock Trading App.
Answer business queries about trading, algorithms, portfolio management, and system metrics.
Keep your answers very concise (under 2 paragraphs).
If the user asks about unrelated topics (like recipes, general history, etc), politely decline and say you can only help with trading and app-related questions.
"""

@post("/api/chat")
async def chat_with_gemini(data: ChatRequest, request: Request) -> ChatResponse:
    # Get API key from custom header first, then fallback to environment variable
    api_key = request.headers.get("x-gemini-key") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return ChatResponse(reply="⚠️ GOOGLE_API_KEY is not set. Please provide your API key in the UI settings or environment variables.")
    
    try:
        # Run synchronous SDK call in thread
        import asyncio
        
        def call_gemini():
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=data.message,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.2,
                )
            )
            return response.text

        reply_text = await asyncio.to_thread(call_gemini)
        return ChatResponse(reply=reply_text)
    except Exception as e:
        return ChatResponse(reply=f"❌ Error communicating with Gemini: {str(e)}")
