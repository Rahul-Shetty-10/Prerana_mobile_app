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
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

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

  // 1. Tick Interval Effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // 2. Trigger onTimeUp when timeLeft hits 0
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (onTimeUpRef.current) {
        onTimeUpRef.current();
      }
    }
  }, [timeLeft, isRunning]);

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
