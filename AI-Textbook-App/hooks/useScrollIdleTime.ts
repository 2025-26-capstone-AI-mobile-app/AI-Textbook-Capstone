import { useEffect, useRef, useState } from 'react';

export function useScrollIdleTime(idleThresholdMs: number = 3000) {
  const [idleTime, setIdleTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const lastInteractionRef = useRef(Date.now());

  const resetIdle = () => {
    lastInteractionRef.current = Date.now();
    setIsIdle(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - lastInteractionRef.current;
      setIdleTime(diff);
      if (diff >= idleThresholdMs) {
        setIsIdle(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [idleThresholdMs]);

  return { idleTime, isIdle, resetIdle };
}
