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

class FundamentalAnalysis(BaseModel):
    fundamental_score: float = Field(description="Score between -1.0 and 1.0 based on P/E, growth, and news.")
    fundamental_reasoning: str = Field(description="Reasoning for fundamental score.")

class TechnicalAnalysis(BaseModel):
    technical_score: float = Field(description="Score between -1.0 and 1.0 based on trend strength, RSI, MACD, and BB.")
    technical_reasoning: str = Field(description="Reasoning for technical score.")

class MacroAnalysis(BaseModel):
    macro_score: float = Field(description="Score between -1.0 and 1.0 based on Fed data, Treasury yields, and systemic risk.")
    macro_reasoning: str = Field(description="Reasoning for macro score.")

class SentimentAnalysisOutput(BaseModel):
    sentiment_score: float = Field(description="Final consensus score between -1.0 and +1.0")
    analysis_reasoning: str = Field(description="Final concise justification")
    fundamental_breakdown: FundamentalAnalysis
    technical_breakdown: TechnicalAnalysis
    macro_breakdown: MacroAnalysis

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
            # 1. Fetch News for Fundamental Agent
            request_parameters = NewsRequest(symbols=target_ticker, limit=5)
            news_payload = self.news_api.get_news(request_parameters)
            
            # alpaca-py get_news returns a list-like object
            extracted_headlines = [article.headline for article in news_payload]
            
            if not extracted_headlines:
                return self._mock_sentiment(target_ticker)

            # 2. Mock or fetch Technicals / Macro locally
            # In production, these would be separate LLM calls. For speed and rate limits,
            # we will use a single LLM Consensus call that acts as the Committee Orchestrator
            # by providing it with the raw data for all three vectors.
            
            # Fetch real technicals from market_data (using a local fetcher instance to avoid circular imports)
            from backend.api.market_data import ResilientMarketDataFetcher
            fetcher = ResilientMarketDataFetcher([target_ticker])
            tech_data = fetcher.get_technical_indicators(target_ticker)
            
            # Construct Committee Prompt
            inference_prompt = f"""
You are the Consensus Agent for a Committee of AI Trading Analysts.
Assess the asset '{target_ticker}'.

FUNDAMENTAL DATA (Recent News):
{chr(10).join([f'- {h}' for h in extracted_headlines])}

TECHNICAL DATA:
RSI (14): {tech_data['rsi']}
MACD Hist: {tech_data['macd_histogram']}
Bollinger Band Pos: {tech_data['bollinger_band_position']} (0=Lower, 1=Upper)

MACRO DATA:
Treasury Yields: Stable
Fed Rate: Pause expected
Systemic Risk: Moderate

Provide a structured consensus analysis combining the Fundamental, Technical, and Macro perspectives.
"""

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
                "headlines": extracted_headlines,
                "committee": {
                    "fundamental": {
                        "score": structured_result.fundamental_breakdown.fundamental_score,
                        "reasoning": structured_result.fundamental_breakdown.fundamental_reasoning
                    },
                    "technical": {
                        "score": structured_result.technical_breakdown.technical_score,
                        "reasoning": structured_result.technical_breakdown.technical_reasoning
                    },
                    "macro": {
                        "score": structured_result.macro_breakdown.macro_score,
                        "reasoning": structured_result.macro_breakdown.macro_reasoning
                    }
                }
            }
            self._cache[target_ticker] = (current_time, final_data)
            return final_data
            
        except Exception as e:
            print(f"Sentiment Engine Error or Rate Limit Hit: {e}")
            # If rate limited (429) or error, fall back to mock
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
            "headlines": headlines,
            "committee": {
                "fundamental": {
                    "score": round(score + random.uniform(-0.2, 0.2), 2),
                    "reasoning": "[MOCK] Strong pipeline." if score > 0 else "[MOCK] Supply issues."
                },
                "technical": {
                    "score": round(score + random.uniform(-0.3, 0.3), 2),
                    "reasoning": "[MOCK] RSI indicates oversold." if score > 0 else "[MOCK] MACD bearish divergence."
                },
                "macro": {
                    "score": round(random.uniform(-0.5, 0.5), 2),
                    "reasoning": "[MOCK] Interest rates stabilizing."
                }
            }
        }
