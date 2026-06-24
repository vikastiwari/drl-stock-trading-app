# **Technical Specification: Architecture and Implementation of an AI-Powered Financial Trading Terminal**

The evolution of retail and institutional trading platforms necessitates a fundamental departure from static, unidirectional data displays. Modern quantitative traders demand the high-density information architecture of legacy systems like the Bloomberg Terminal or ThinkOrSwim, combined with the modularity of modern web frameworks and the predictive capabilities of artificial intelligence. This specification outlines the architectural blueprint for upgrading a foundational React and Litestar application into a professional-grade, multi-screen trading terminal.  
The primary competitive differentiators of this system are the integration of a transparent Deep Reinforcement Learning (DRL) engine for live portfolio allocation and a deterministic Large Language Model (LLM) pipeline for real-time sentiment analysis. To achieve this, the system relies on an asynchronous Python backend, a resilient TLS-spoofing market data ingestion layer, and a highly reactive frontend grid layout. The following sections provide an exhaustive technical breakdown of the frontend architecture, backend dependency resolution, DRL integration, market data acquisition, and asynchronous orchestration required to deploy this platform.

## **Frontend Architecture and Multi-Screen Layout Persistence**

The visual presentation layer of a professional trading terminal must accommodate an immense density of rapidly updating data while granting the user absolute control over the spatial arrangement of that data. Users require the ability to drag, drop, and arbitrarily resize widgets—such as charting interfaces, streaming news feeds, and algorithmic decision matrices—across a flexible grid.  
To implement this in a modern React 18 environment, the react-grid-layout library serves as the optimal foundational framework1. Recent major updates to this library (specifically version 2.0.0 and above) have fundamentally modernized its internal architecture, introducing first-class TypeScript support and a composable Hooks API that supersedes legacy higher-order components (HOCs) like WidthProvider and Responsive2.

### **Modern Grid Architecture and the Hooks API**

The legacy implementation of react-grid-layout relied heavily on class-based components and React's older reconciliation lifecycle, which caused severe compatibility issues with React 18's concurrent rendering mode2. The introduction of the Version 2 API mitigates these issues by leveraging the useContainerWidth hook, which utilizes native browser ResizeObserver APIs to provide highly reactive, non-blocking width measurements3. This hooks-based approach produces a vastly simplified component tree, allows for explicit control over rendering states, and is significantly more performant in applications that process high-frequency WebSocket updates2.  
Furthermore, the layout algorithms themselves have been decoupled into a framework-agnostic core (react-grid-layout/core), allowing the grid to handle complex compaction and collision physics without triggering unnecessary DOM repaints3. The internal compactor.compact() function processes negative coordinates and overlapping boundaries dynamically, ensuring that when a trader rapidly resizes a chart widget, adjacent news or terminal widgets flow elegantly into the available negative space3.  
To initialize this architecture, the engineering team must install the core library and its resizing dependencies. The exact installation command is:

Bash  
npm install react-grid-layout react-resizable

### **Layout Serialization and Browser Persistence**

A critical requirement for a professional terminal is state persistence; a user's customized layout must survive browser refreshes and session terminations. The layout configuration in react-grid-layout is represented as an array of objects, where each object defines a widget's unique identifier (i), its spatial coordinates (x, y), its dimensional footprint in grid units (w, h), and specific constraints such as minimum or maximum allowable dimensions (minW, maxW)6.  
By binding a callback to the onLayoutChange event, the application can capture the entire spatial matrix every time a drag or resize operation concludes6. To achieve persistence across refreshes, this serialized matrix must be written to the browser's localStorage API. When the React component mounts, a useEffect hook intercepts the initialization cycle, retrieves the serialized string from localStorage, parses it back into a JavaScript array, and applies it to the grid state8.  
If the localStorage key is empty or corrupted, the system must gracefully fall back to a predefined default configuration. The following code scaffold provides a robust, minimal implementation of a responsive, three-panel layout utilizing the useContainerWidth hook and synchronized localStorage persistence.

JavaScript  
import React, { useState, useEffect } from "react";  
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";  
import "react-grid-layout/css/styles.css";  
import "react-resizable/css/styles.css";

// Define a unique namespace for the terminal's local storage  
const STORAGE\_KEY \= "professional\_terminal\_layout\_v1";

// Define the fallback layout if no user preference is found  
const DEFAULT\_LAYOUT \= \[  
  { i: "price\_chart", x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 3 },  
  { i: "news\_feed", x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 3 },  
  { i: "agent\_brain", x: 0, y: 6, w: 12, h: 3, minW: 6, minH: 2 }  
\];

export default function ProfessionalTradingTerminal() {  
  // Leverage the v2 Hook for reactive width measurement via ResizeObserver  
  const { width, containerRef, mounted } \= useContainerWidth();  
  const \[layout, setLayout\] \= useState(\[\]);

  useEffect(() \=\> {  
    // Attempt to hydrate layout state from browser storage on mount  
    const savedLayout \= localStorage.getItem(STORAGE\_KEY);  
    if (savedLayout) {  
      try {  
        setLayout(JSON.parse(savedLayout));  
      } catch (e) {  
        console.error("Layout deserialization failed, applying defaults.");  
        setLayout(DEFAULT\_LAYOUT);  
      }  
    } else {  
      setLayout(DEFAULT\_LAYOUT);  
    }  
  }, \[\]);

  const handleLayoutChange \= (newLayout) \=\> {  
    // Update local state and synchronize to persistent storage  
    setLayout(newLayout);  
    localStorage.setItem(STORAGE\_KEY, JSON.stringify(newLayout));  
  };

  return (  
    \<div   
      ref\={containerRef}   
      style\={{ width: "100%", minHeight: "100vh", backgroundColor: "\#0a0a0a", padding: "10px" }}  
    \>  
      {/\* Defer rendering until the container width is actively measured \*/}  
      {mounted && layout.length \> 0 && (  
        \<ReactGridLayout  
          width\={width}  
          layout\={layout}  
          onLayoutChange\={handleLayoutChange}  
          gridConfig\={{ cols: 12, rowHeight: 80, margin: \[15, 15\] }}  
          dragConfig\={{ enabled: true, handle: ".widget-header" }}  
          resizeConfig\={{ enabled: true }}  
        \>  
          {/\* Widget 1: Financial Charting Interface \*/}  
          \<div key\="price\_chart" style\={{ display: "flex", flexDirection: "column", background: "\#1e1e1e", border: "1px solid \#333", borderRadius: "4px" }}\>  
            \<div className\="widget-header" style\={{ padding: "8px", background: "\#2a2a2a", color: "\#e0e0e0", cursor: "move", userSelect: "none", borderBottom: "1px solid \#333" }}\>  
              Primary Charting Display  
            \</div\>  
            \<div style\={{ flex: 1, padding: "10px", color: "\#888" }}\>\[Interactive Chart Component Mount Point\]\</div\>  
          \</div\>  
            
          {/\* Widget 2: Streaming Sentiment and News \*/}  
          \<div key\="news\_feed" style\={{ display: "flex", flexDirection: "column", background: "\#1e1e1e", border: "1px solid \#333", borderRadius: "4px" }}\>  
            \<div className\="widget-header" style\={{ padding: "8px", background: "\#2a2a2a", color: "\#e0e0e0", cursor: "move", userSelect: "none", borderBottom: "1px solid \#333" }}\>  
              Real-Time Sentiment Overlays  
            \</div\>  
            \<div style\={{ flex: 1, padding: "10px", color: "\#888" }}\>\[News Stream Component Mount Point\]\</div\>  
          \</div\>  
            
          {/\* Widget 3: Deep Reinforcement Learning Agent Output \*/}  
          \<div key\="agent\_brain" style\={{ display: "flex", flexDirection: "column", background: "\#1e1e1e", border: "1px solid \#333", borderRadius: "4px" }}\>  
            \<div className\="widget-header" style\={{ padding: "8px", background: "\#2a2a2a", color: "\#e0e0e0", cursor: "move", userSelect: "none", borderBottom: "1px solid \#333" }}\>  
              Live DRL Portfolio Allocations  
            \</div\>  
            \<div style\={{ flex: 1, padding: "10px", color: "\#888" }}\>\[Agent Target Weights Matrix Mount Point\]\</div\>  
          \</div\>  
        \</ReactGridLayout\>  
      )}  
    \</div\>  
  );  
}

A crucial architectural detail in this implementation is the use of the dragConfig={{ handle: ".widget-header" }} property4. By restricting drag initialization strictly to the top header bar of each widget, the system prevents accidental drag events when a user attempts to pan a candlestick chart or scroll through a densely populated news feed within the widget's main body.

## **Advanced Deep Reinforcement Learning Integration**

The analytical core of the trading terminal is powered by Deep Reinforcement Learning (DRL), a branch of machine learning ideally suited for sequential decision-making in highly stochastic environments. While classical quantitative strategies often rely on mean-variance optimization (MPT) which can struggle with out-of-sample data, DRL agents can synthesize a vast array of technical, fundamental, and macroeconomic features directly into a unified trading policy10.  
For this terminal, the FinRL framework provides the foundational DRL infrastructure. FinRL is an open-source, full-stack library tailored for automated trading, offering pre-built market environments compatible with the OpenAI Gym (and Gymnasium) standards12. While the newer FinRL-X architecture provides a modular, production-focused pipeline tailored for live trading13, the core mathematical concepts and state-space definitions remain consistent across the FinRL ecosystem.

### **Resolving the Python Dependency Conflict Matrix**

Integrating a massive scientific computing ecosystem like FinRL into a lightweight, modern ASGI web framework like Litestar presents a formidable DevOps challenge. The Python data science stack relies heavily on compiled C and C++ extensions, and library versions are highly interconnected. Specifically, the FinRL environment utilizes stable-baselines3 for algorithm execution, which in turn strictly demands specific versions of gym or gymnasium, numpy, pandas, and scipy14.  
A notorious conflict arises when attempting to install these packages in a modern Python environment. For example, scipy version requirements often clash with numpy version constraints (e.g., packages requiring numpy \< 2.0 conflicting with modern environments defaulting to numpy 1.26 or 2.0+)15. Furthermore, older versions of scikit-learn and scipy do not provide pre-compiled wheels for certain architectures or older 32-bit environments in Python 3.10+, leading to catastrophic build failures during pip install16. Relying on the standard pip dependency resolver often results in indefinite backtracking loops or complete resolution failure18.  
To solve this, the engineering team must enforce a strict Python 3.10.x runtime19. Python 3.10 has proven to be the most stable target for the FinRL dependency tree, ensuring that pre-compiled wheels are available for the required versions of PyTorch and stable-baselines319.  
Secondly, the standard pip installer must be entirely discarded in favor of uv. Developed in Rust, uv is an incredibly fast package installer and resolver that handles complex dependency graphs drastically better than the legacy pip resolver, reducing dependency resolution times by up to 99% and providing precise conflict overrides18.  
The exact dependency resolution protocol for the backend container is as follows:

Bash  
\# Ensure the base image or environment is strictly Python 3.10  
python3.10 \-m venv .venv  
source .venv/bin/activate

\# Install the high-performance uv package manager  
pip install uv

\# Install the web server framework and the ASGI server  
uv pip install litestar uvicorn

\# Install stable-baselines3 with extra dependencies (includes plotting and tensorboard)  
uv pip install "stable-baselines3\[extra\]\>=2.0.0a1"

\# Install FinRL directly from the repository to secure the most recent patches  
\# and avoid outdated PyPI distributions  
uv pip install git+https://github.com/AI4Finance-Foundation/FinRL.git

### **The Portfolio Allocation Markov Decision Process**

Unlike single-asset trading algorithms that output discrete actions (e.g., \-1 for sell, 0 for hold, 1 for buy), the objective of this terminal is to provide dynamic, live portfolio allocation across a basket of equities17.  
To accomplish this, the trading problem is modeled as a continuous Markov Decision Process (MDP). The state space ![][image1] represents the agent's perception of the market at time ![][image2]. In the FinRL StockPortfolioEnv, this state matrix is typically highly dimensional. For a basket of ![][image3] stocks, the state vector often includes the current closing prices, a set of technical indicators (e.g., MACD, RSI, CCI, ADX) calculated for each stock, and crucially, the temporal covariance matrix11. The inclusion of the covariance matrix is vital, as it allows the policy network to internally assess and minimize cross-asset correlation risks11. The resulting state space tensor shape is typically (34, N), where 34 represents the feature depth11.  
The action space ![][image4] describes the capital allocation executed by the agent. For portfolio management, the output is a continuous vector ![][image5] where each element represents the target weight of an asset22. To ensure that short selling or margin constraints are respected, these raw logits are bounded and passed through a softmax activation function, guaranteeing that ![][image6] and ![][image7]11.  
The reward function ![][image8] provides the optimization signal. For continuous allocation, this is defined as the logarithmic rate of return between time steps: ![][image9], where ![][image10] is the total portfolio value24.

### **DRL Inference Implementation**

The following Python snippet demonstrates how to instantiate a pre-trained agent (e.g., a Proximal Policy Optimization or Deep Deterministic Policy Gradient model) using stable-baselines3, preprocess incoming live market data to match the training state space, and extract the deterministic target weights12.

Python  
import numpy as np  
import pandas as pd  
from stable\_baselines3 import PPO  
from finrl.meta.preprocessor.preprocessors import FeatureEngineer  
from finrl.config import INDICATORS

class DRLPortfolioEngine:  
    def \_\_init\_\_(self, model\_filepath: str, asset\_universe: list\[str\]):  
        """  
        Initializes the DRL inference engine, loading the policy network into memory.  
        """  
        self.asset\_universe \= asset\_universe  
          
        \# Load the pre-trained PPO agent  
        \# The model must have been trained on the StockPortfolioEnv environment  
        self.agent \= PPO.load(model\_filepath)  
          
        \# Initialize the FinRL feature engineer to ensure incoming live data   
        \# undergoes the exact same transformations as the historical training data  
        self.feature\_engineer \= FeatureEngineer(  
            use\_technical\_indicator=True,  
            tech\_indicator\_list=INDICATORS, \# e.g., \['macd', 'boll\_ub', 'boll\_lb', 'rsi\_30', 'cci\_30', 'dx\_30', 'close\_30', 'close\_60'\]  
            use\_turbulence=False,  
            user\_defined\_feature=False  
        )

    def compute\_optimal\_weights(self, live\_market\_data: pd.DataFrame) \-\> dict\[str, float\]:  
        """  
        Ingests a DataFrame of recent OHLCV data for the asset universe,  
        constructs the state observation, and queries the DRL policy for optimal weights.  
        """  
        \# 1\. Feature Engineering: Compute MACD, RSI, etc., across the live data window  
        processed\_df \= self.feature\_engineer.preprocess\_data(live\_market\_data)  
          
        \# 2\. State Construction:   
        \# In a production environment, the processed\_df must be pivoted and reshaped  
        \# to match the exact (34, N) tensor shape expected by the StockPortfolioEnv.  
        \# This involves extracting the latest row of indicators and computing the recent covariance matrix.  
        observation\_state \= self.\_build\_portfolio\_state\_matrix(processed\_df)  
          
        \# 3\. Model Inference:  
        \# Deterministic=True disables exploratory noise, providing the absolute optimal   
        \# policy output based on the current state weights.  
        raw\_actions, \_hidden\_states \= self.agent.predict(observation\_state, deterministic=True)  
          
        \# 4\. Action Normalization:  
        \# The raw output from the neural network must be passed through a softmax layer   
        \# to ensure the weights are non-negative and sum to exactly 1.0.  
        exp\_actions \= np.exp(raw\_actions)  
        normalized\_weights \= exp\_actions / np.sum(exp\_actions)  
          
        \# 5\. Serialization: Map the calculated float weights back to their respective tickers  
        allocation\_map \= {  
            ticker: round(float(weight), 4)   
            for ticker, weight in zip(self.asset\_universe, normalized\_weights)  
        }  
          
        return allocation\_map

    def \_build\_portfolio\_state\_matrix(self, df: pd.DataFrame) \-\> np.ndarray:  
        """  
        Transforms the tabular dataframe into the specific multidimensional array   
        required by the neural network's input layer.  
        """  
        num\_assets \= len(self.asset\_universe)  
        \# Placeholder for the complex array pivoting logic.  
        \# The resulting array incorporates closing prices, technical indicators, and the covariance matrix.  
        observation\_shape \= (34, num\_assets)   
        return np.zeros(observation\_shape) 

This inference engine serves as the absolute core of the application's "Agent Brain" widget. Whenever the backend receives a new tick of data, this service is invoked, and the resulting allocation\_map is broadcast to the frontend.

## **Data Ingestion and TLS Anti-Throttling Architecture**

An algorithmic decision engine is fundamentally useless without a highly reliable, low-latency stream of market data. For historical and delayed intraday data, the yfinance library is an industry standard27. However, the engineering team must address the aggressive rate-limiting mechanisms recently implemented by Yahoo Finance28.

### **The Mechanics of TLS Fingerprinting**

When a system attempts to poll yfinance continuously for a basket of 10 to 20 stocks, it frequently encounters 429 Too Many Requests or YFRateLimitError exceptions, even when the request volume is theoretically well within the free tier limits29. This phenomenon is not necessarily caused by volumetric limits, but by advanced bot detection algorithms analyzing the Transport Layer Security (TLS) and HTTP/2 handshake28.  
Standard Python HTTP clients, such as requests, httpx, or aiohttp, rely on the default OpenSSL configurations provided by the operating system. When these libraries negotiate a secure connection, they present a specific sequence of supported cipher suites, elliptic curves, and extensions31. This sequence generates a unique cryptographic signature known as a JA3 hash32. Anti-bot systems monitor incoming connections; if a JA3 hash corresponds to a known Python library rather than a legitimate web browser, the connection is instantly throttled or blocked31.

### **Implementing Browser Impersonation via curl\_cffi**

To reliably circumvent these restrictions, the backend must actively spoof its TLS fingerprint. The curl\_cffi library achieves this by providing Python bindings for curl-impersonate, a specially compiled version of libcurl that mimics the exact TLS and HTTP/2 handshakes of popular web browsers (e.g., Google Chrome, Safari, Firefox) byte-for-byte32. By utilizing curl\_cffi, the HTTP requests generated by yfinance appear virtually indistinguishable from a human user navigating the web via Chrome31.  
While the requests\_cache library is frequently used with yfinance to prevent redundant network calls, it is fundamentally incompatible with curl\_cffi due to internal structural differences in how session objects are handled34. Therefore, a custom caching layer must be implemented alongside the spoofed session.  
The following architectural pattern demonstrates how to inject a curl\_cffi session into yfinance to build an un-throttled polling mechanism29.

Python  
import time  
import pandas as pd  
import yfinance as yf  
from curl\_cffi import requests

class ResilientMarketDataFetcher:  
    def \_\_init\_\_(self, asset\_universe: list\[str\], cache\_ttl\_seconds: int \= 60):  
        self.asset\_universe \= asset\_universe  
        self.cache\_ttl \= cache\_ttl\_seconds  
        self.\_cache \= {}  
        self.\_last\_fetch\_time \= 0  
          
        \# Initialize a persistent session that mimics the TLS signature of Chrome 131\.  
        \# This fundamentally alters the JA3 hash presented to the Yahoo servers,  
        \# bypassing basic bot detection protocols.  
        self.session \= requests.Session(impersonate="chrome131")  
          
        \# Ensure standard browser headers are present  
        self.session.headers.update({  
            "Accept": "application/json, text/plain, \*/\*",  
            "Accept-Encoding": "gzip, deflate, br",  
            "Accept-Language": "en-US,en;q=0.9",  
        })

    def get\_latest\_market\_state(self) \-\> pd.DataFrame:  
        """  
        Polls Yahoo finance for the current intraday state of the asset basket.  
        Implements an in-memory TTL cache to prevent aggressive over-polling   
        across concurrent WebSocket connections.  
        """  
        current\_time \= time.time()  
          
        \# Serve from cache if the Time-To-Live has not expired  
        if current\_time \- self.\_last\_fetch\_time \< self.cache\_ttl and self.\_cache is not None:  
            return self.\_cache  
              
        try:  
            \# By passing the curl\_cffi session directly into yfinance,   
            \# all underlying HTTP requests inherit the spoofed TLS fingerprint.  
            market\_data \= yf.download(  
                tickers=" ".join(self.asset\_universe),  
                period="1d",  
                interval="1m",  
                group\_by="ticker",  
                auto\_adjust=True,  
                session=self.session,  
                progress=False  
            )  
              
            \# Update the cache state  
            self.\_cache \= market\_data  
            self.\_last\_fetch\_time \= current\_time  
              
            return market\_data  
              
        except Exception as e:  
            \# In a production system, log this failure and return the last known good cache state  
            print(f"Data ingestion failure: {str(e)}")  
            return self.\_cache

By decoupling the data request mechanism and applying a centralized TTL cache, the Litestar server can handle hundreds of concurrent WebSocket connections from frontend terminals without linearly scaling the number of requests sent to the external provider.

## **Alternative Data: Real-Time Sentiment Generation via LLMs**

While the DRL engine utilizes technical indicators (price, MACD, RSI) to model market momentum, a true competitive edge in modern quantitative finance relies on alternative data—specifically, the interpretation of natural language sentiment36. The terminal must feature a "Sentiment Overlay" that ingests real-time news headlines, determines their emotional and financial valence, and presents a quantitative score.

### **Financial News API Market Landscape (2026)**

To feed the sentiment engine, a robust and cost-effective news API is required. The landscape of financial data providers offers several options, but they differ significantly in latency, cost, and developer experience.

| Provider | Median Latency | News Sources / Curation | Ideal Use Case | Starter Pricing |
| :---- | :---- | :---- | :---- | :---- |
| **Bloomberg / QuoteMedia** | Ultra-Low (Sub 5ms) | Highly proprietary, institutional | Hedge funds, HFT | Custom Enterprise (\~$2,000+/mo)38 |
| **Benzinga (via Polygon)** | \~25 ms (WebSocket) | Trader-grade, curated tagging | Algorithmic event trading | Enterprise / Volume dependent39 |
| **Tiingo** | Near-realtime | 70M+ articles, nontraditional blogs | Quantitative academic research | $30/month (Individuals)40 |
| **Alpaca News API** | Real-time (WebSocket/REST) | Aggregated Benzinga feed | Developer-first prototypes | Free tier (Generous rate limits)42 |

For a terminal requiring high-quality, real-time news for specific tickers (e.g., AAPL) without immediate enterprise overhead, the **Alpaca News API** represents the optimal choice. Alpaca provides an exceptional developer-first SDK and grants access to high-quality Benzinga news streams, accessible via both WebSocket and REST, with highly permissive free-tier boundaries43.

### **Deterministic Sentiment Scoring with Gemini**

Raw news headlines are useless to an algorithmic terminal; they must be transformed into structured data. Historically, this involved complex Natural Language Processing (NLP) pipelines or rudimentary keyword-matching heuristics39. Today, Large Language Models (LLMs) can synthesize context and nuance instantaneously.  
However, standard LLM outputs are highly non-deterministic and difficult to parse programmatically. To guarantee that the terminal receives a strict numerical format, the system must utilize "Structured Outputs." The Gemini API, via the google-genai Python SDK, natively supports structured outputs driven by Pydantic models46. By defining a Pydantic schema, the Gemini LLM is mathematically constrained to output valid JSON matching the exact key-value pairs and data types requested46.  
The following Python architecture bridges the Alpaca News API and the Gemini LLM to create a resilient, deterministic sentiment generator.

Python  
import os  
from pydantic import BaseModel, Field  
from google import genai  
from alpaca.data.historical.news import NewsClient  
from alpaca.data.requests import NewsRequest

\# 1\. Define the strict output schema required from the LLM  
\# The google-genai SDK uses this to constrain the output generation.  
class SentimentAnalysisOutput(BaseModel):  
    sentiment\_score: float \= Field(  
        description="A precise float between \-1.0 (highly negative/bearish) and 1.0 (highly positive/bullish)."  
    )  
    analysis\_reasoning: str \= Field(  
        description="A concise, one-sentence justification explaining the generated score based on the headlines."  
    )

class AlternativeSentimentEngine:  
    def \_\_init\_\_(self):  
        \# Initialize Alpaca client for data ingestion  
        self.news\_api \= NewsClient(  
            api\_key=os.environ.get("APCA\_API\_KEY\_ID"),  
            secret\_key=os.environ.get("APCA\_API\_SECRET\_KEY")  
        )  
          
        \# Initialize Gemini client for NLP inference  
        self.llm\_client \= genai.Client(api\_key=os.environ.get("GEMINI\_API\_KEY"))

    def compute\_ticker\_sentiment(self, target\_ticker: str) \-\> dict:  
        """  
        Retrieves the absolute latest news for a ticker and evaluates the aggregated sentiment.  
        """  
        \# Fetch the 5 most recent articles related to the ticker  
        request\_parameters \= NewsRequest(symbols=target\_ticker, limit=5)  
        news\_payload \= self.news\_api.get\_news(request\_parameters)  
          
        extracted\_headlines \= \[article.headline for article in news\_payload.news\]  
          
        if not extracted\_headlines:  
            return {  
                "score": 0.0,   
                "reasoning": "Insufficient recent news volume for sentiment extraction.",  
                "headlines": \[\]  
            }

        \# Construct the context prompt  
        inference\_prompt \= (  
            f"You are a quantitative financial analyst. Assess the current market sentiment "  
            f"for the asset '{target\_ticker}' based exclusively on the following recent headlines:\\n"  
        )  
        for index, headline in enumerate(extracted\_headlines):  
            inference\_prompt \+= f"{index \+ 1}. {headline}\\n"  
              
        inference\_prompt \+= "\\nCalculate an aggregate sentiment score from \-1.0 to \+1.0."

        \# Execute the LLM call with enforced structured output  
        llm\_response \= self.llm\_client.models.generate\_content(  
            model="gemini-3.5-flash", \# Use a high-speed, lightweight model for lower latency  
            contents=inference\_prompt,  
            config={  
                "response\_mime\_type": "application/json",  
                "response\_schema": SentimentAnalysisOutput,  
                "temperature": 0.0 \# Absolute zero temperature ensures maximum determinism  
            },  
        )

        \# The SDK automatically parses the JSON response into the defined Pydantic object  
        structured\_result: SentimentAnalysisOutput \= llm\_response.parsed  
          
        return {  
            "score": structured\_result.sentiment\_score,  
            "reasoning": structured\_result.analysis\_reasoning,  
            "headlines": extracted\_headlines  
        }

This engine transforms unstructured, qualitative news data into a quantitative signal (the score) alongside a human-readable explanation (the reasoning). This payload can be directly routed to the terminal's frontend, providing traders with an immediate, easily digestible pulse on the market.

## **Backend Orchestration and Asynchronous Architecture**

The final architectural layer is the transport mechanism that connects the Litestar Python backend to the React frontend. Litestar is a modern, exceptionally fast ASGI framework designed around type safety and concurrency49.  
Because a trading terminal requires instantaneous data updates, traditional HTTP polling is entirely insufficient. The system must utilize WebSockets to maintain a persistent, bidirectional communication channel. Litestar provides two distinct approaches to handling WebSockets: @websocket\_listener (for reactive, event-driven communication) and @websocket\_stream (for proactive, continuous data streaming)51.  
Given that the terminal must react to user inputs (e.g., the user changing the active ticker on their UI) while continuously pushing data, the @websocket\_listener is the appropriate choice. It inherently handles JSON serialization and provides a type-safe abstraction over the raw ASGI socket implementation50.

### **Managing CPU-Bound Inference Tasks**

A critical danger in asynchronous Python programming is blocking the main event loop. The DRL inference (calculating tensor operations for portfolio allocation) and the external API calls (fetching news and LLM responses) are heavy operations. If these are executed directly within the WebSocket loop, the server will freeze, preventing other clients from connecting or receiving data50.  
To solve this, these operations should ideally be offloaded to a background worker queue, such as litestar-saq (built on Redis)54, or handled via non-blocking asynchronous execution threads.  
The following implementation demonstrates how to orchestrate the terminal's core loop within a Litestar WebSocket handler, ensuring that the React frontend is continuously fed with the latest data payloads.

Python  
import asyncio  
from typing import Dict, Any  
from litestar import Litestar, WebSocket  
from litestar.handlers.websocket\_handlers import websocket\_listener

\# Instantiate the core architecture services globally  
\# In a rigorous production application, these would be managed via Litestar's Dependency Injection system.  
active\_universe \= \["AAPL", "MSFT", "GOOGL", "AMZN", "META"\]  
market\_streamer \= ResilientMarketDataFetcher(asset\_universe=active\_universe)  
drl\_agent \= DRLPortfolioEngine(model\_filepath="models/ppo\_optimal\_portfolio.zip", asset\_universe=active\_universe)  
sentiment\_engine \= AlternativeSentimentEngine()

@websocket\_listener("/ws/terminal-feed")  
async def terminal\_feed\_handler(data: Dict\[str, Any\], socket: WebSocket) \-\> None:  
    """  
    Establishes a bidirectional WebSocket connection.  
    The client pushes configuration data (e.g., {"target\_asset": "AAPL"}).  
    The server continuously pushes a synthesized payload of DRL allocations and sentiment.  
    """  
    \# Extract the user's focus ticker from the incoming WebSocket message  
    focus\_asset \= data.get("target\_asset", "AAPL")  
      
    try:  
        \# Initiate an indefinite loop to continuously stream data to the terminal  
        while True:  
            \# 1\. Acquire the current market state  
            \# Note: I/O operations should be properly awaited or offloaded to thread pools   
            \# if the underlying libraries (like yfinance) are synchronous.  
            market\_state\_df \= await asyncio.to\_thread(market\_streamer.get\_latest\_market\_state)  
              
            \# 2\. Compute the optimal portfolio allocation via the DRL agent  
            \# Offloaded to a thread to prevent the CPU-bound matrix math from blocking the ASGI loop.  
            target\_allocations \= await asyncio.to\_thread(drl\_agent.compute\_optimal\_weights, market\_state\_df)  
              
            \# 3\. Assess the current sentiment for the user's focus asset  
            sentiment\_payload \= await asyncio.to\_thread(sentiment\_engine.compute\_ticker\_sentiment, focus\_asset)  
              
            \# 4\. Construct the comprehensive update payload  
            terminal\_update \= {  
                "event\_type": "TERMINAL\_STATE\_UPDATE",  
                "timestamp": asyncio.get\_event\_loop().time(),  
                "portfolio\_allocations": target\_allocations,  
                "asset\_sentiment": sentiment\_payload  
            }  
              
            \# Broadcast the serialized JSON payload back to the React grid UI  
            await socket.send\_json(terminal\_update)  
              
            \# Throttle the iteration to respect reasonable API limits and update frequencies  
            await asyncio.sleep(15)   
              
    except Exception as e:  
        print(f"WebSocket connection terminated unexpectedly: {str(e)}")  
        await socket.close()

\# Initialize the Litestar ASGI application  
app \= Litestar(route\_handlers=\[terminal\_feed\_handler\])

This orchestrated backend architecture effectively binds the various disparate components of the system. The Litestar application listens to the client, triggers the CPU-bound DRL agent on a separate thread, queries the LLM for sentiment, and streams the structured payload back to the React frontend.

## **Concluding Architectural Synthesis**

Transforming a basic trading application into a professional, institutional-grade terminal requires rigorous attention to architectural boundaries, dependency management, and asynchronous orchestration. By adopting the version 2 Hooks API of react-grid-layout, the frontend achieves high-performance rendering and seamless spatial persistence via browser storage.  
On the backend, navigating the fragile ecosystem of scientific Python requires enforcing a Python 3.10 runtime and utilizing the uv package manager to successfully deploy the FinRL Deep Reinforcement Learning pipeline. To ensure the DRL agents are continuously fed with accurate market conditions, TLS-spoofing via curl\_cffi must be employed to bypass aggressive rate-limiting protocols. Finally, the integration of Alpaca's news feeds with the deterministic structured output of Gemini LLMs provides a unique alternative data edge, synthesized and delivered to the client via Litestar's high-speed WebSocket implementation. This cohesive technical stack produces an AI-powered terminal capable of real-time, sophisticated algorithmic trading insights.

#### **Works cited**

1. React-Grid-Layout \- Showcase, [https://react-grid-layout.github.io/react-grid-layout/examples/00-showcase.html](https://react-grid-layout.github.io/react-grid-layout/examples/00-showcase.html)  
2. React-Grid-Layout \- GitHub, [https://github.com/react-grid-layout/react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)  
3. react-grid-layout \- Yarn Classic, [https://classic.yarnpkg.com/en/package/react-grid-layout](https://classic.yarnpkg.com/en/package/react-grid-layout)  
4. react-grid-layout/CHANGELOG.md at master \- GitHub, [https://github.com/react-grid-layout/react-grid-layout/blob/master/CHANGELOG.md](https://github.com/react-grid-layout/react-grid-layout/blob/master/CHANGELOG.md)  
5. React-Grid-Layout is not compatible with React 18 · Issue \#2117 \- GitHub, [https://github.com/react-grid-layout/react-grid-layout/issues/2117](https://github.com/react-grid-layout/react-grid-layout/issues/2117)  
6. Getting Started with React-Grid-Layout \- DEV Community, [https://dev.to/sheep\_/getting-started-with-react-grid-layout-3aic](https://dev.to/sheep_/getting-started-with-react-grid-layout-3aic)  
7. @eleung/react-grid-layout \- npm, [https://www.npmjs.com/package/@eleung/react-grid-layout](https://www.npmjs.com/package/@eleung/react-grid-layout)  
8. 8-localstorage-responsive.html \- React Grid Layout \- GitLab, [https://gitlab.benocs.com/analytics-dependencies/react-grid-layout/-/blob/0.12.2/examples/8-localstorage-responsive.html](https://gitlab.benocs.com/analytics-dependencies/react-grid-layout/-/blob/0.12.2/examples/8-localstorage-responsive.html)  
9. React Grid Layout Example \- StackBlitz, [https://stackblitz.com/edit/react-grid-layout-example](https://stackblitz.com/edit/react-grid-layout-example)  
10. FMARL: A Novel Hybrid Model Finite Machine Automata and Deep Reinforcement Learning Algorithm for Futures Market Forecasting and \- TechRxiv, [https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.175987727.73143592/v1](https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.175987727.73143592/v1)  
11. Portfolio Allocation — FinRL 0.3.1 documentation, [https://finrl.readthedocs.io/en/latest/tutorial/Introduction/PortfolioAllocation.html](https://finrl.readthedocs.io/en/latest/tutorial/Introduction/PortfolioAllocation.html)  
12. Reinforcement Learning for Portfolio Optimization \- UPCommons, [https://upcommons.upc.edu/server/api/core/bitstreams/df33ebe1-fe71-4974-9d35-bc3c2f8235a9/content](https://upcommons.upc.edu/server/api/core/bitstreams/df33ebe1-fe71-4974-9d35-bc3c2f8235a9/content)  
13. AI4Finance-Foundation/FinRL: FinRL®: Financial Reinforcement Learning. \- GitHub, [https://github.com/AI4Finance-Foundation/FinRL](https://github.com/AI4Finance-Foundation/FinRL)  
14. PDF \- Stable Baselines3 Documentation, [https://stable-baselines3.readthedocs.io/\_/downloads/en/master/pdf/](https://stable-baselines3.readthedocs.io/_/downloads/en/master/pdf/)  
15. Changelog — Stable Baselines3 2.9.0 documentation, [https://stable-baselines3.readthedocs.io/en/master/misc/changelog.html](https://stable-baselines3.readthedocs.io/en/master/misc/changelog.html)  
16. Not able to install on python 3.10 with pip · Issue \#24604 \- GitHub, [https://github.com/scikit-learn/scikit-learn/issues/24604](https://github.com/scikit-learn/scikit-learn/issues/24604)  
17. finrlensemble \- Kaggle, [https://www.kaggle.com/code/gsboom/finrlensemble](https://www.kaggle.com/code/gsboom/finrlensemble)  
18. dealing with pip install dependency conflicts \- python \- Stack Overflow, [https://stackoverflow.com/questions/75407687/dealing-with-pip-install-dependency-conflicts](https://stackoverflow.com/questions/75407687/dealing-with-pip-install-dependency-conflicts)  
19. Installation issues in installing finrl on Ubuntu 20.04 \#1032 \- GitHub, [https://github.com/AI4Finance-Foundation/FinRL/issues/1032](https://github.com/AI4Finance-Foundation/FinRL/issues/1032)  
20. Changelog — Python 3.10.20 documentation, [https://docs.python.org/3.10/whatsnew/changelog.html](https://docs.python.org/3.10/whatsnew/changelog.html)  
21. FinRL\_stock\_trading\_fundamental \- Colab \- Google, [https://colab.research.google.com/github/mariko-sawada/FinRL\_with\_fundamental\_data/blob/main/FinRL\_stock\_trading\_fundamental.ipynb](https://colab.research.google.com/github/mariko-sawada/FinRL_with_fundamental_data/blob/main/FinRL_stock_trading_fundamental.ipynb)  
22. FinRL-Tutorials/1-Introduction/FinRL\_PortfolioAllocation\_NeurIPS\_2020.ipynb at master \- GitHub, [https://github.com/AI4Finance-Foundation/FinRL-Tutorials/blob/master/1-Introduction/FinRL\_PortfolioAllocation\_NeurIPS\_2020.ipynb](https://github.com/AI4Finance-Foundation/FinRL-Tutorials/blob/master/1-Introduction/FinRL_PortfolioAllocation_NeurIPS_2020.ipynb)  
23. Deep Reinforcement Learning for Stock Trading \- 1 \- Kaggle, [https://www.kaggle.com/code/learnmore1/deep-reinforcement-learning-for-stock-trading-1](https://www.kaggle.com/code/learnmore1/deep-reinforcement-learning-for-stock-trading-1)  
24. FinRL-Tutorials/2-Advance/FinRL\_PortfolioAllocation\_Explainable\_DRL.ipynb at master \- GitHub, [https://github.com/AI4Finance-Foundation/FinRL-Tutorials/blob/master/2-Advance/FinRL\_PortfolioAllocation\_Explainable\_DRL.ipynb](https://github.com/AI4Finance-Foundation/FinRL-Tutorials/blob/master/2-Advance/FinRL_PortfolioAllocation_Explainable_DRL.ipynb)  
25. FinRL: explainable deep reinforcement learning for portfolio management: an empirical approach.ipynb \- Colab, [https://colab.research.google.com/github/AI4Finance-Foundation/FinRL-Tutorials/blob/master/2-Advance/FinRL\_PortfolioAllocation\_Explainable\_DRL.ipynb](https://colab.research.google.com/github/AI4Finance-Foundation/FinRL-Tutorials/blob/master/2-Advance/FinRL_PortfolioAllocation_Explainable_DRL.ipynb)  
26. Using Reinforcement Learning for Stock Trading with FinRL \- Finding Theta, [https://findingtheta.com/blog/using-reinforcement-learning-for-stock-trading-with-finrl](https://findingtheta.com/blog/using-reinforcement-learning-for-stock-trading-with-finrl)  
27. yfinance-cache \- PyPI, [https://pypi.org/project/yfinance-cache/0.3.2/](https://pypi.org/project/yfinance-cache/0.3.2/)  
28. Yfinace \- Getting Too Many Requests. Rate limited. Try after a while \- Stack Overflow, [https://stackoverflow.com/questions/79454460/yfinace-getting-too-many-requests-rate-limited-try-after-a-while](https://stackoverflow.com/questions/79454460/yfinace-getting-too-many-requests-rate-limited-try-after-a-while)  
29. \[0.2.57\] YFRateLimitError('Too Many Requests · Issue \#2422 · ranaroussi/yfinance \- GitHub, [https://github.com/ranaroussi/yfinance/issues/2422?timeline\_page=1](https://github.com/ranaroussi/yfinance/issues/2422?timeline_page=1)  
30. Yfinance saying “Too many requests.Rate limited” : r/learnpython \- Reddit, [https://www.reddit.com/r/learnpython/comments/1isuc4h/yfinance\_saying\_too\_many\_requestsrate\_limited/](https://www.reddit.com/r/learnpython/comments/1isuc4h/yfinance_saying_too_many_requestsrate_limited/)  
31. Using curl\_cffi for Web Scraping in Python \- Medium, [https://medium.com/@datajournal/curl-cffi-for-web-scraping-a34523f9fe89](https://medium.com/@datajournal/curl-cffi-for-web-scraping-a34523f9fe89)  
32. Your Python Scraper Has a Tell. curl-cffi Is How You Hide It. \- ITNEXT, [https://itnext.io/your-python-scraper-has-a-tell-curl-cffi-is-how-you-hide-it-3f4ebd02516f](https://itnext.io/your-python-scraper-has-a-tell-curl-cffi-is-how-you-hide-it-3f4ebd02516f)  
33. Web Scraping With curl\_cffi and Python in 2026 \- Bright Data, [https://brightdata.com/blog/web-data/web-scraping-with-curl-cffi](https://brightdata.com/blog/web-data/web-scraping-with-curl-cffi)  
34. Unable to use request\_cache to cache the yfinance response · Issue \#2486 \- GitHub, [https://github.com/ranaroussi/yfinance/issues/2486](https://github.com/ranaroussi/yfinance/issues/2486)  
35. curl-cffi \- PyPI, [https://pypi.org/project/curl-cffi/](https://pypi.org/project/curl-cffi/)  
36. 12 Best Financial Market APIs for Real-Time Data in 2026 \- APILayer Blog, [https://blog.apilayer.com/12-best-financial-market-apis-for-real-time-data-in-2026/](https://blog.apilayer.com/12-best-financial-market-apis-for-real-time-data-in-2026/)  
37. The 5 Best Free AI Stock News Sentiment Analysis Tools for 2026 and Beyond \- Medium, [https://medium.com/@tmapendembe\_28659/the-5-best-free-ai-stock-news-sentiment-analysis-tools-for-2026-and-beyond-629d835b7ba5](https://medium.com/@tmapendembe_28659/the-5-best-free-ai-stock-news-sentiment-analysis-tools-for-2026-and-beyond-629d835b7ba5)  
38. 4 Best Stock Market APIs for 2026 \- ScrapingBee, [https://www.scrapingbee.com/blog/best-stock-market-apis/](https://www.scrapingbee.com/blog/best-stock-market-apis/)  
39. Best Financial News API for Trading 2026: 5 Compared | APITube.io API d'Actualités, [https://apitube.io/fr-ch/blog/post/best-financial-news-api-trading](https://apitube.io/fr-ch/blog/post/best-financial-news-api-trading)  
40. Tiingo Stock & Financial Markets API | Tiingo, [https://www.tiingo.com/](https://www.tiingo.com/)  
41. Tiingo API Pricing, [https://www.tiingo.com/about/pricing](https://www.tiingo.com/about/pricing)  
42. Stock API Free: 8 Best Options Compared (2026) \- QVeris, [https://qveris.ai/guides/stock-api-free-comparison/](https://qveris.ai/guides/stock-api-free-comparison/)  
43. Real-time News \- Alpaca Docs, [https://docs.alpaca.markets/us/docs/streaming-real-time-news](https://docs.alpaca.markets/us/docs/streaming-real-time-news)  
44. Alpaca \- Developer-first API for Stock, Options, Crypto Trading, [https://alpaca.markets/](https://alpaca.markets/)  
45. Newsletter via API : r/alpacamarkets \- Reddit, [https://www.reddit.com/r/alpacamarkets/comments/1my3efm/newsletter\_via\_api/](https://www.reddit.com/r/alpacamarkets/comments/1my3efm/newsletter_via_api/)  
46. Structured outputs \- generateContent API \- Google AI for Developers, [https://ai.google.dev/gemini-api/docs/generate-content/structured-output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)  
47. Structured output \- Gemini by Example, [https://geminibyexample.com/020-structured-output/](https://geminibyexample.com/020-structured-output/)  
48. Structured output | Gemini Enterprise Agent Platform \- Google Cloud Documentation, [https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output)  
49. Testing \- Litestar Docs, [https://docs.litestar.dev/main/usage/testing.html](https://docs.litestar.dev/main/usage/testing.html)  
50. Getting Started with Litestar WebSockets | Better Stack Community, [https://betterstack.com/community/guides/scaling-python/litestar-websockets/](https://betterstack.com/community/guides/scaling-python/litestar-websockets/)  
51. litestar/docs/usage/websockets.rst at main \- GitHub, [https://github.com/litestar-org/litestar/blob/main/docs/usage/websockets.rst](https://github.com/litestar-org/litestar/blob/main/docs/usage/websockets.rst)  
52. WebSockets — Litestar Framework, [https://docs.litestar.dev/2/usage/websockets.html](https://docs.litestar.dev/2/usage/websockets.html)  
53. Responses — Litestar Framework, [https://docs.litestar.dev/2/usage/responses.html](https://docs.litestar.dev/2/usage/responses.html)  
54. litestar-saq \- PyPI, [https://pypi.org/project/litestar-saq/](https://pypi.org/project/litestar-saq/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAZCAYAAAABmx/yAAABRElEQVR4XoVSsUoDQRCdFUGIUTFVCptAELuY0sLaH5ATQswnpLAQrpBU+QMJtmcbhHT29nZ2foBFPuJ8k7ns3c7ucA8es/Nm3u7s3hEpuCA6n7ciNFpwcYNltPQIsqebYLkEF+CkHt22D8ACLBUfvCX0Ok6nYI7FYaPQAz/Ad/BEuxhXkL4RR6rUAd/AOe1dqoHvwiPN5I4a0efx6T2J8RfMfJlaX3Unn4JbVz9IoerRsokh+IpqZXYZ+g5S3ccko3XVSHz6iuTkdcr4Bf6Au+/RBPILhBLxUxfOuQDeBYUKTj5FdWJYeOQC4ovS97gGN8j7tSS4JTFuEY9E8jflMTfgpSj6IkRP4B/JBvyKPBpvNKZUt5L4f3wGc/AGPGMx4UrBj2gqxkb1v6gbdO5hFtpgGfVr+pU1mgVljG2xwkirCdiN/39xLIGdpVhGAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAdCAYAAABmH3YuAAAA3ElEQVR4Xo1QQQrCMBBMVEQKgtCjDxD8gwfx0KfoH8SLJ1/gxVtPgk/rI+pMtkm2WQsObDc7s7PZ1HknCDkW4+OPMiMLo0npMDJODDWN1uSNeaD8CcdFYpTc4PNErDQbFMQNcSkFYo1o0XHQJEf1MPaSXe+lriguEbWTkRRqXMA6oQLxGtyufArv6RBt1ARy4IZ0XSOtnXwb72vsr5GRH8TGyYVnPZojH6jnyHvkd5SIDsQ9tHEp7456+AyxBbFjIYKS7RoaUbVd3nBlPYGiLS/0p794QnLZhTImlC8wZhhy6QlM0gAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABeklEQVR4XpVSMU4DMRBcBwkklIKAaCj5ABUSLZRUFLRIKfIEXgBNOpr0dDQRSFCB6On4Q3oeEWZu7Tvf2r44I83d7ezs2mufSAOnrwQlvYiBgoEUEdIbbCmyBVmxh9RhFRsn8IZd8CjiKFM4gZm+HFw8/L5ok29wDT6D4+BUuAkel+AveIuYNTm0+3gXbbQCL4JIeAcb3GX03hexg5jGMd7c3Q942nOInIOH+pk5iACkDkTNjNiMnIWkx1S4aAVupDPO2BA9/hj4XsfgWxR3a+hHK7PJPFI4Hsfk7va8zl2/aDqHprJ5nIHLSCR4ASvwXkX35HT3G0HTPD4c0V+DN/sFnoAfoovm0Ct8lfbwe2ATjsr8g5iiFkZdOj1gC9rWePIiqkbkAU+tSPgFH53ujr9Oo6oetqPvEXgFLsBP8NprFuEiumHyw9ahsra0WGV5FoO1abK4sE2kpX3YvI23hjZI2iTCMLa0R+hGruxRsnexzWxGqaeHlW38D++rJWimgD5XAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAABPUlEQVR4XqVSu05DMQz1nah4SLCysTAgZuay8Q0IvoCJGfEXDMzszP0AJEQXRpYu3fsR5fjacRwn6RXiSL6OT05O7KZEisF9c45o8CUVBcPEvlH55thDPBJrQ2mU4Xj+rBCvbvtPOEdsqWfQG0XrOeo1shrUnQZUAr71BbEdig4qXUUwThBPiCOSERZMWsfNIyXuoTpD3ifpYFGPWMG2nxHvWjsDB2uljR/Eja5nJCN87NAbWPGIxE/nwQbfvOhYGH1F8qe5lhg0jwYcCmeTlpoxt4kb4dS6PM0M3SFuc+mzmSgh6RDxoBW3ya3viSDBDJYkBsfCyJdvT86fiIu8ld7bDPhZRy2Yr6wi2ujGZVK2Mb7KGzKPeOA3Qk6IdYtRlC1ntntgCr2D8YKK6A0TkX++DnYLenwD/zSaHugXFDsxWoXAGk0AAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAaCAYAAACNU8MOAAAER0lEQVR4Xu2aO4sUQRDHa/TwhQ/wMBGRU1B8gSa+UMFENFQwUEERIyNFFOUCETU4E5+o+AhEP4AIgmJgqJmJiMkllxn4IbT+U9NubW3PTE/P7OzueT+ou5ma7q7u/vdU9xxHNMdQklgH8DqHBde5Sp2sVHhWUDzi4qdDyMh1uFkaGH5ZEzfY/rB9sw9ao6yHLRHWjbBSDbGERBvYuHkWBMRFxZX2QXWaH3jzLdbD9sfee/EU6nJ5nmfgCbTZnf3OJa8JiDtC5A1DEVAEBBYbBjZRibh5RIgbOy2x9Szx7cTXHACdzrYp7jAwUjJRb3/dvfV7qSauarKWuEFdmwUMapxZ3GriKvLEXcv2ne0e20O2fZk1TZ/idORoSZgxtlNsb9kesB1mu0By4q1LnLiJX1xMLj6NXIPXSY7jJ/+VqEk24X2P0xY8nin+NS2XKRgXxtLAV0ikuNQrrvu2uqJ8e9l+s61SPsdG6yhFhp/FScrjJHSOf06yrenyW7yvqHXa+3AKah5k+8q2Xvmeksyj5RbJIphh26P804mU/8G2U/mBEje/F74nVtxDbD/ZtivfeZLAC5RvK9sbtl/KlwXwhekhNM4Wth1sG0hiIfUNHDXCpWyv2O6wze+46TOJgL0kqVgzbLeVF4sd25KPiDdXeqjFRQp5T+nqSrRCn8jfUQSN+cuWitO1EmwcDOgjibDgLPnfBg9J4BqrDbYQ9Gmz8cN33/gcF9mOU/dYsMgvq3tNhLiCFtdNpt3zZtg+kEzXcuWPFTc0zhhfXKLOwE5TsLgNELY4XJ/03orMAx+e4Rpvt2tvGcmcryZZzK7eUZJDmI9GxEVqeMa2X/mQFtFRpEwER/pxFIm7jqQeUpalahwHYk2aSS+K49jFM4syV7t96d4Hn0unaBnl4HfAhwWGswC2EssBkmfuVIxTM84HSMsQ8Dl1bz0YG4QE29gesS0k0QHC+2hEXHCE5NSKTiLVvCMZ8Fm2xySHB0eRuDgcoR72VR9V4gCs/ptsi40/jZPkxwEudWJB+XxOmEWZD+aAzx2OfAtuBdtrkjMIQMrFGwnDwRBj0Z9DeI55AxAVn4EQOS8lg7ridu1RSCVobF52DwGQPmyiKhIXoDz2Vbm0tcPjXGM7k11PKL9DxekbWIB3rVN1FSKPq3ssRp8gyBR6fFgYOGlPKJ9FiWunphj15larSOXiIs08sc4qZEvihFymuJSmqR0nAKRTZJpeXM/Cps/23x2s0pSc00TdN7cyx0g+TdCxL2wvxa26l6QTjvQbizt4uVQJw15mCYqTM3E92HLZ/QuStzOQnlamKJ2vBPuzzgAoqL/1fbQubhk4pCBVItX2kzbi4A81+lAUjZU8kKri/gsDcfmNSIrSa3+JHPF/QMB/YjQ+eaENhpab5dhpsPftMbjIo8rcjKXETkOnXmwLo071cVevoahVeQCMSn/L+mmf23uiv3WsrIVo3ycOAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAaCAYAAADL5WCkAAADi0lEQVR4Xu2Yy6tOURjG34VcDrnGwECGSJQQuRQTIyUzdRgpUmYiSUpmOkTSF8WMYoaSf0BKDCQZmp8/gvdZl2+v/a7r3mef4yt+9Z6v/ax3Xfaz12XvQ/Qvo6Qw7yx0j7X91eaF9K/5nyqyBmcLJ4rISCMS89vGNlkwz5ylpu/DEOLDo0zB5HGBYwPHElkwBBkfpsj0+4ysmQEqW38iwQyRHOJ4wXGS4xXHp3ZxJ46SaStuGKkRJcsKOKfN79x9b7cn1QImTZq5g+Mjxyp7jd/HVu/CHY7PHD85Zilt2IjHkSpbQBTt4r/3qNl7XFzy0wpIM79xfBDaZo4vVNhXE48QdVA3ZVj/mVlLYmC+vonM8pum4n6Xak0jzcTDeCs07G3QTwm9hsHNxCaLJ/6G4wHHczL7Ul9ec5yTYk/GZipzKMC0kf8APP3+WKwnaabtoZOZbJp6Qs2JeZPMwM40KSqYO/LaYfUZ/l3WLqkj0q4/Mz0zW6T0NrJxc63NVGnDqs1EIgbhd3OQzJ600dPACs7aIrQICoNbK9Uy8TulIc2Mk5yZllHG6BaznPhDaBfJLJelQsdMDfYkaQGZjjG7r2di7zhb07QSaS9qpsgzupofM8kri4xPs570wNRtT8NsxKzc52ld2U69ZqYjGG7sAHoqNPQH/YbQa+hkZmR8GncCenujNvEXGVNRy53C6HB3qiEBbuyAFEs1M+UxM98LbdjTvD2Yqj3TLRk/ES/D0Bh1gv8s5tjPsZJMo4tcYhal3wampVxHsOSlmQ9JP/DWHR/hmKHm0EMh7gMv44Kg/dDMNoGZqQePzrC/ASxPPHEMAkY/svppjp0cX+21R6pZ2kr6NUsVT/RkCw3STPcFtNpeYxW9tLpjOZn7QGBCGNqd4csJdS+TWY23OPZwrCEvU0XMzIGDZh01sw5Lu9UgmffGK+OrCgcs+ALCYeZuzMU1P6mANNNxnOMqmZWT+ijABMHEmAudzPQIloDjO5n99HxbDkn4DBkPCHsbQr4p5Iia6frRv7LT5hpblSzVROvF6WtmEpzwdynVfVwdCmtmuRORcYwDHyNzpfo9s5YppfeY8IaMEuoDEp2ZFbwj/QaSp2Lkg8/MbqTWUESqwO2z2f8I+fTrJgAP0fX9F82cFAZwdYAmhqDDMDqk1lNqNCwPlYmgPKxyhqEqryKpImVgXI8L33MV/YbVr1YX/gCcKowGAvCH7wAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAaCAYAAABIIVmfAAADtUlEQVR4Xu2ZzYuNURzHfwcRyUuSt9Qko8lLYqEkNWMjSik2JEmKrY2Sf2BqkpIkFpMNpZRShmQlYsHC1sbOwh8xft/nnPPc8/qcc577XHPnjk99597nd95+5/X5nTtEixrhGoaUmJ8x+xAgXXMddJ+7Ir/e5pxuqvu8ZOiu493VFKJX+3yzRMBmaSX1hd9N3zJI2rZWXi5W4hXJgTzH2pTQTtZN1ntVBtpFRcTcWLpgRC6RHMyHTloTKHeaNcta66R1SPsJay4ZTF3BesD64yYkOMZ6xjrDesH6YidLgi0qMIB6Rdf5mgoYfGUddI3Dj9e7TyT7/1t9Onj5NXtZn6m3CPGJhQy7QbS8Rkzxn5+s16xtTmITO0juoM5JujwY5khNQGb7P1jvHNt21jfWhGNvBNvvNmteyG04JGQOQ3fUE5AJ8mLRmvD7sgpezprGRE/qZGwnFN7XSzNJVEPBHIdI1jvDusU6yRq3ctQESiviKZ1SMgFrSOZ9hAfDP22/1zPlc5HkS+gla3PP3Lr750kebavV82OSzh3VGVI1O+kbyY/OAhL6e2mYHJkA7YXljTUBKXuqnyZbSVbQGA1kVLiFZD2YBM0FZYOTJhgsTP6A6Hkb9ru2zongBAQJDnSDvQisWlSyx02IEejYNdYHql5Kdeo0WR2s7XdYv3x7oNYE5SUsIjsgWG9soGP2Ig6w3uBLoOEcxoUMUa849u+sj47NoP3Ad0RkAqL+IO8Tx7ZB2bGoWoPQaso1FjAhZChWn/UKvTKWsdYrGyIwvJSjvTSYZb0t0ClZLI1qvDQMRV6UMcFxCrsVBeWiLxIYlAI8d/ECxw4yY2FMKBxDFHRDCU7iGXlxZGXjtdgNTRNwhGQaIjnNfbKOzorjrLusVcFaEuAuYP0kUV5FBYpd54/L8ruAU9hV6MAk6ylVkyOuklwxOJr2p1tLpZcidI3w4TDJixV8xM7FIsJO1egAwjzb9U14nXpGmeewJz0NZMAKda7QSRDhTAdrk+CFhM7pDAgL8WwyRkakFK2pojl1ATlBcmdgl1inR67HmDFELKXg11QcIf3Agy/GqFqBMXdj9tEA5z6OnsC5rzvuDcBukpc1hJXLYfBy5IP4H7fkSceeQR+tWrSvxy7p1+NbbPRvQLk/KSNywXbDJU2/UAOkmvVwL2ZJcltI5YsusX+EunAl//PlScjPavWPAmUTUJZ7CEg5nEr/TzHdDmkdLi4SFpe3C4g7UO5z/7SssWUxyi0ZzyVT4umjwl+ZpqpEpzMuywAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAaCAYAAADCDsDeAAAEeUlEQVR4Xu2Zz4vVVRTAz9ditBJLo58LmSIjtUUtCsUKBooCEQokCEwIWrhoIwjiQgWLCkLDRiQKKgSjAsES1CHdKAgudBHixs1ACxf+EXY+73zv+9533r3v+2PeNG8xHzij99xf55577rn3OyMyIRTRz0XHTxOVB6p8uwb0uozsN7JyoeQGz+mXWWbs5IPttMqLXtlvn+83RhY8yX2V2ah8XGVNVawbv66+G5tUZgZVuYly+oXTNne6XPmwmHM/7mtEDqicjMqNYVgcwoB3yn+Ri6WEcpDV1m0IDPjDK1uvdOl5U+VzlQec/nWV95wuQ7XO/SrzKuvKMg6kHHhQ5QWVe2Udk6dgY3Z6ZXuWeAMK2aM/t3i1slLlT5WnfEWOl1WuqDwX6XDghagceEOsbquvUJ6XsNvujC0NRd+ClpY8q3LZKyPOq/zslTm2qTwZlafEHBjll75575d1IcJjyE/vemUdNnLL5Xs6epH2iS4EzlWvjPha5Z8BTWKQHNNiDsSRMQwxL5ZXPTj7nMrjviKamdRySywn/63yl6tvyk9ii6M/NzhRRIBkyWzgtMrvKt8UFkikAnLsCpVVUbuSfn+cT3r0+kbQ+abKxkj3kMpusdxM3vFsULkudsumwIJdYhcCPK3ya1XdGJz4g9gmslkHxQLho7hRQ86qfFH+H4cSrayjjpdUbkh+rVlICd+KGf2MVK8DjC+dmtypkItzhN1eW5Y/UTlVVZckhxb0LOR7sTniVow7p/JEpGsCkYk928vyerHIZcPqYGO5jxKndDQhmZM7HxPbIRa0V/JLhzrnviaWUnhN/KJDtTXsHTFn3HZ6HEIwEBRtmCqqwDkkZl+P3iJzKzV9Z+fuE5swGMt7lpyG7tPQKEGdc+ERsTx5V6ztb4PVnoEVks/pcyTSEa1Ebd8xnrSP+tpXVb6Tysk7QkUNpXNbB4ickQEn9QwhatBRlyNEZiqCGIRcSd4G0gtReK3foh4iBRvi3BrmxMnMMXyk095lkwmGAO93No/7pAnhdKdeTFkwhQXwVvWE3eUighmxIx6+1AZfC4OL4olG23CZUc9tH58ErStok/oqgpBvY6ewOffLyUhjod9R0/fe7+KNkWqjwsVMP523wGkNKDq9Fhh8XpJfJsUlsYVww7MQnlRfRQ3CRRi/MAI6XvFWVOaiJCXElxARyYKJiNQi+eRkQVy0wDzBSVx2J0o9hBRCPk5BKsDWwIdi62lKsHWYEX4m56SeWUA3ctRnKpszgxApucjjyBLdyPDxrTgm9tTJwSby4uDpBIz1qKSXddgrHJyy1nlT7AuNk/S/ohtTzBXpyGvKj5J5VqW8V0P8G600HQZV/lX5wCvzJCdJKiWv7/GlpH4r1gzy+Ste2QEM5INl1AlpRbRi7o23q2LMSL+MBRykXz5F25nIm7MyHgv5jR1fX+PDrOLy5uswv2njsL4B6b9ETBjtfFG4v0QsMym028dhuvbv2q9i4SOkWJxRJ4iOC+zYbRGZPIvS1NlZ1Y9uObp2HPwHbOqqVg7HwysAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIkAAAAaCAYAAACD1n8kAAAFMUlEQVR4Xu2ay8tVVRTA100p0KKHKRIGn0FhDzEEzXwEDaKGFY16gIOgZlLqQKR8oTQRNUREcaAk9qAIgh5Qk6LQQQ2bOHHWoD/C1u/sc767zzp7n7PPuffc+127P1h8Z++zX2vttfde+9xPpBUDm9FA2/JdanRhMr343XTtsWu9IGNpbCyN1GDbt+k5Y6Q34/bW8Jw5MCsOlo3zqsoT5sVS5BmVlTYzjdJ8bFdZ52f0wpRdYJXKYypP2xcdeErlRZvZihGM0bLq+9K6ShDa+FplrX1had9ZVqN9tWRiTZfzST2uckXlUOlNRqwRS1bugMqX5sVSZZvKJZsJqRob1qv8Kp2r985YxoWDBJykFTdV3rCZbRiLJml8pPKuzRwBhv6ByoYJKNF/DxFGdRKOq2Mqy1xyWnok93teZYXNTMf2k6Vp7yeVR8rvpowd6gi0cpJAv++ovGwzlyj3yIg7Xg3/qrxkM1O4Ju78O6OyWuV3lU9V9sniyps6vpMQyP6gcjuXHSo/iotb/lF5Pi9X8JDKd+LqWZar/Cyu7psy9K+T4tq+N09PEhza2n1BXDx1fVCOqzhCmfhUbojbpVqBUd5TuUucUf4W58msOiYiM2xgZcagKHU8GZh0RVLwnYSxPqjyh7gxn1VZk797RVwkj2MUEPhinND2TXkcYYPKVyoP5Pk803bq+MYFYwkFrBfE3cqwAeMqKBZKKswpkpE6r6w6jMcOgkfuEuckBE4veOWmTei4YUVgIH/VMank7fTyeA4Zcos4B6P+J+J2zsJu/MUGK1IN2QDfZbbazAAfihuHz93i5gVYxCyOnAHO/ecw3Qg2K5VP0Y8BAAb7ReJBDW19LMPyk6bOSXzYuVKdBF1YuQsqv6lsMgbb7T3ziu8WbfXn287b4o5BjpEmPhd3/fWh7+X5bKIHDl3A4v7MSy+oXKmZ+IqTVIhURvFT4owQ40mZbuDXwkkadpKqEdD9tslnsRCnFKD/X17astf9qTaew8Q0OQk7Wt21l4WMMy94ecyZP29HpTxuS7OThBngjd+LG0QIDP+WymZxsUAdfEYmiGwjKYziJOh1S+K7ANdCG/yxILgyA7sN+hPXoD8xkWVv3D8yUpwEx+RTfIzdUr0ak6YOAThx2DeSH5NeGR8cCD1q/HmIX4TBY9iYEQnmCOSmyShOUne7AVanXV3HxRm+AP2JF2LkO0mURSeJzA1xIDfKOujft8H9Ks96abA7jcXcbiKjCcAZZ43t07TVVkjvOoxXn8eN4lYAwq7AtsyEF9dg3mOwtSqv5nn7ZbiaiuMUPTLM+LjuFjsJr56T6u8c6O8ft/Tn39AOmnRpwQ2adxI+9nErq4PA97K4vtmxj0hZFZ6x0X1engU965w9ysMyvEKGaDrnZgG2ZO+La4XCGbGDPU5SjB/dSfJZbHISrr0pH7lwvkclfJw0xY3UIawgvIjSdYGz1bJS8OA95t2swHbe9ZM0xy36A/qHJijqJDlNTvKFNExeAuyifBOC0OcLrsv8frPoB10dIsRhcdes12W87U6aE9LtV2AcDP05lmP6x5zkNXFfdDkCkYtSDf5xwm0mrwubxMVS/hW5YL30/CswDbOLzDrEGd9KjaGiL5z+oR2kIOYkKeAgdUdZGm7wsdsXN55zNjNGjR1ymkukEWsnmB/M7Iva/0wbdSQt6xOAnraZcdJb90pO5j/TwnQa8BiItRbLj9O+RgKDvN1eGk+jp66LZlObTy03py/mM3CHYCfSpmeXO0eTDvyvlQ/yH0PuwJFc3znbAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAaCAYAAABhJqYYAAABB0lEQVR4XoVQMQrCUAz9BdGlIlhcnHQQOgi6OLi5SFdPo4OIs4NnEDyBkwdwc3DzFh5CX37//02T1j54TfLykqY1xiFiz5AVpYdXhJFB1gpysxjQ8/I0Ad2oUaQcKUWh0SAdvmwedCgZo1DbsEW8Ib4RF84yBh/gWr7hAKGD+EU8Om2JPR/Ue+aLSGwjialpwib7HIIZq8lof9MM+R0csIMTpCm72aILXsGMaWTYUAhGl0zAJzhiIn3D2dd8cwq+wD7TTuCKEm6kMoZwQTJ3jRbijmLeDsYSEnSmiD330QzilirYvjZ5pa6j9fKIntcTWiGom12lN8rlflLvzRWtl6WKfoG/TWN+ZxgQzd+dlgsAAAAASUVORK5CYII=>