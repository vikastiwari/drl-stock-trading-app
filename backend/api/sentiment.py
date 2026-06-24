import os
import random
from pydantic import BaseModel, Field
try:
    from google import genai
    from alpaca.data.historical.news import NewsClient
    from alpaca.data.requests import NewsRequest
    HAS_API_LIBS = True
except ImportError:
    HAS_API_LIBS = False

class SentimentAnalysisOutput(BaseModel):
    sentiment_score: float = Field(
        description="A precise float between -1.0 (highly negative/bearish) and 1.0 (highly positive/bullish)."
    )
    analysis_reasoning: str = Field(
        description="A concise, one-sentence justification explaining the generated score based on the headlines."
    )

class AlternativeSentimentEngine:
    def __init__(self):
        self.alpaca_key = os.environ.get("APCA_API_KEY_ID")
        self.alpaca_secret = os.environ.get("APCA_API_SECRET_KEY")
        self.gemini_key = os.environ.get("GEMINI_API_KEY")
        
        self.use_real_api = HAS_API_LIBS and self.alpaca_key and self.gemini_key
        
        # 15 RPM Rate Limiting Mitigation Cache
        self._cache = {}
        self._cache_ttl = 15.0 # 15 seconds = 4 RPM (well under Gemini Lite 15 RPM)
        
        if self.use_real_api:
            self.news_api = NewsClient(api_key=self.alpaca_key, secret_key=self.alpaca_secret)
            self.llm_client = genai.Client(api_key=self.gemini_key)
        else:
            print("WARNING: Missing APCA or GEMINI keys (or libs). Falling back to mock sentiment engine.")

    def compute_ticker_sentiment(self, target_ticker: str) -> dict:
        """
        Retrieves the absolute latest news for a ticker and evaluates the aggregated sentiment.
        Falls back to mock data if API keys are missing or rate limits hit.
        """
        import time
        current_time = time.time()
        
        if target_ticker in self._cache:
            last_time, cached_data = self._cache[target_ticker]
            if current_time - last_time < self._cache_ttl:
                return cached_data
                
        if not self.use_real_api:
            data = self._mock_sentiment(target_ticker)
            self._cache[target_ticker] = (current_time, data)
            return data
            
        try:
            # Fetch the 5 most recent articles related to the ticker
            request_parameters = NewsRequest(symbols=target_ticker, limit=5)
            news_payload = self.news_api.get_news(request_parameters)
            
            extracted_headlines = [article.headline for article in news_payload.news]
            
            if not extracted_headlines:
                return {
                    "score": 0.0, 
                    "reasoning": f"Insufficient recent news volume for {target_ticker}.",
                    "headlines": []
                }

            # Construct the context prompt
            inference_prompt = (
                f"You are a quantitative financial analyst. Assess the current market sentiment "
                f"for the asset '{target_ticker}' based exclusively on the following recent headlines:\n"
            )
            for index, headline in enumerate(extracted_headlines):
                inference_prompt += f"{index + 1}. {headline}\n"
                
            inference_prompt += "\nCalculate an aggregate sentiment score from -1.0 to +1.0."

            # Execute the LLM call with enforced structured output
            llm_response = self.llm_client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=inference_prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": SentimentAnalysisOutput,
                    "temperature": 0.0
                },
            )

            structured_result: SentimentAnalysisOutput = llm_response.parsed
            
            final_data = {
                "score": structured_result.sentiment_score,
                "reasoning": structured_result.analysis_reasoning,
                "headlines": extracted_headlines
            }
            self._cache[target_ticker] = (current_time, final_data)
            return final_data
            
        except Exception as e:
            print(f"Sentiment Engine Error or Rate Limit Hit: {e}")
            # If rate limited (429), fall back to mock
            data = self._mock_sentiment(target_ticker)
            self._cache[target_ticker] = (current_time, data)
            return data

    def _mock_sentiment(self, target_ticker: str) -> dict:
        news_pool = [
            f"{target_ticker} Unveils Revolutionary AI Features",
            f"Regulatory Scrutiny Increases on {target_ticker}",
            f"{target_ticker} Earnings Shatter Wall Street Expectations",
            f"Supply Chain Disruptions Ease for {target_ticker}"
        ]
        headlines = random.sample(news_pool, 2)
        score = round(random.uniform(-0.8, 0.8), 2)
        
        reasoning = "Strong positive catalyst due to AI adoption." if score > 0 else "Macroeconomic headwinds impacting growth."
        
        return {
            "score": score,
            "reasoning": f"[MOCK] {reasoning}",
            "headlines": headlines
        }
