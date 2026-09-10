"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Player {
  currentMs: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (ms: number) => void;
  rate: number;
  setRate: (r: number) => void;
}

/** A synthetic media clock — the capture layer is stubbed, so playback is
 *  simulated against the known duration and transcript timeline. */
export function usePlayer(durationMs: number): Player {
  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  const stop = useCallback(() => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  useEffect(() => {
    if (!playing) {
      stop();
      return;
    }
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) * rate;
      last.current = now;
      setCurrentMs((prev) => {
        const next = prev + dt;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return stop;
  }, [playing, rate, durationMs, stop]);

  const play = useCallback(() => {
    setCurrentMs((c) => (c >= durationMs ? 0 : c));
    setPlaying(true);
  }, [durationMs]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const seek = useCallback(
    (ms: number) => setCurrentMs(Math.max(0, Math.min(durationMs, ms))),
    [durationMs],
  );

  return { currentMs, playing, play, pause, toggle, seek, rate, setRate };
}
