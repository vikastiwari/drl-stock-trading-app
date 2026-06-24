from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client()

print("Available models:")
for m in client.models.list():
    if "flash" in m.name:
        print(m.name)
