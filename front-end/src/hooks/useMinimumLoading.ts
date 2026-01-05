import { useEffect, useState, useRef } from "react";

export function useMinimumLoading(isLoading: boolean, minDuration = 180) {
  const [visible, setVisible] = useState(isLoading);

  const startRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      const showTimer = setTimeout(() => {
        setVisible(true);
        startRef.current = Date.now();
      }, 0);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return () => clearTimeout(showTimer);
    }

    const startTime = startRef.current ?? Date.now();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minDuration - elapsed, 0);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
      startRef.current = null;
    }, remaining);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, minDuration]);

  return visible;
}
