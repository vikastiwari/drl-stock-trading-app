import pytest
import asyncio
from unittest.mock import MagicMock, patch
from backend.api.sentiment import AlternativeSentimentEngine

@pytest.mark.asyncio
async def test_sentiment_engine_initialization():
    engine = AlternativeSentimentEngine()
    assert hasattr(engine, "news_api")

@pytest.mark.asyncio
async def test_compute_ticker_sentiment(mock_gemini_client):
    engine = AlternativeSentimentEngine()
    
    # Mock news
    mock_news = MagicMock()
    mock_news.headline = "Tech stocks rally"
    mock_news.summary = "Great news for AAPL"
    
    with patch.object(engine.news_api, "get_news", return_value=[mock_news]):
        # Mock Gemini structured response
        mock_parsed = MagicMock()
        mock_parsed.sentiment_score = 0.85
        mock_parsed.analysis_reasoning = "Strong rally"
        
        mock_parsed.fundamental_breakdown = MagicMock()
        mock_parsed.fundamental_breakdown.fundamental_score = 0.80
        mock_parsed.fundamental_breakdown.fundamental_reasoning = "Solid"
        
        mock_parsed.technical_breakdown = MagicMock()
        mock_parsed.technical_breakdown.technical_score = 0.90
        mock_parsed.technical_breakdown.technical_reasoning = "Bullish"
        
        mock_parsed.macro_breakdown = MagicMock()
        mock_parsed.macro_breakdown.macro_score = 0.85
        mock_parsed.macro_breakdown.macro_reasoning = "Good"
        
        mock_response = MagicMock()
        mock_response.parsed = mock_parsed
        engine.llm_client.models.generate_content.return_value = mock_response
        
        result = engine.compute_ticker_sentiment("AAPL")
        
        assert result["score"] == 0.85
        assert "Strong rally" in result["reasoning"]
        assert len(result["headlines"]) == 1
        assert "Tech stocks rally" in result["headlines"][0]
