import { useState, useEffect, useRef } from 'react';

export function useCrossTabState<T>(channelName: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(defaultValue);
  
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Create the channel on mount
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    // Listen for messages from other tabs
    channel.onmessage = (event) => {
      setState(event.data);
    };
    
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  // Update local state AND broadcast to all other tabs
  const updateState = (val: T) => {
    setState(val);
    if (channelRef.current) {
      channelRef.current.postMessage(val);
    }
  };

  return [state, updateState];
}
