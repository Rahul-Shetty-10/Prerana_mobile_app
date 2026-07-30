import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTimerOptions {
  initialSeconds: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export function useTimer({ initialSeconds, onTimeUp, autoStart = true }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      setIsRunning(false);
      setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
    },
    [initialSeconds]
  );

  const restart = useCallback(
    (newSeconds?: number) => {
      setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
      setIsRunning(true);
    },
    [initialSeconds]
  );

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTimeUp]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    restart,
    setTimeLeft,
  };
}
