import pytest
import os
from unittest.mock import MagicMock, patch

@pytest.fixture(autouse=True)
def mock_env_vars():
    """Ensure tests run without needing actual API keys."""
    os.environ["APCA_API_KEY_ID"] = "test_key"
    os.environ["APCA_API_SECRET_KEY"] = "test_secret"
    os.environ["GEMINI_API_KEY"] = "test_gemini"
    yield

@pytest.fixture
def mock_alpaca_client():
    with patch("backend.api.execution.TradingClient") as mock_client:
        mock_instance = MagicMock()
        mock_client.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_gemini_client():
    with patch("google.genai.Client") as mock_client:
        mock_instance = MagicMock()
        mock_client.return_value = mock_instance
        yield mock_instance
