import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/terminal-feed"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected.")
            # Send initialization
            await websocket.send(json.dumps({"target_asset": "AAPL"}))
            print("Sent initialization payload.")
            
            # Wait for response
            while True:
                response = await websocket.recv()
                print(f"Received: {response}")
                break
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test_ws())
