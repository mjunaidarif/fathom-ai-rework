"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Attendee, TranscriptCue } from "./types";

/**
 * Voice narration for the synthetic player. The capture layer is stubbed, so
 * there is no recorded audio — instead we speak the active transcript line via
 * the Web Speech API, giving each speaker a distinct, stable voice. Honest
 * synthesized audio: no media files, works on the static deploy.
 */
export function narrationSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function useNarration({
  enabled,
  playing,
  currentCue,
  attendees,
  rate,
}: {
  enabled: boolean;
  playing: boolean;
  currentCue?: TranscriptCue;
  attendees: Attendee[];
  rate: number;
}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const lastSpokenId = useRef<string | null>(null);

  // Load voices (they arrive asynchronously in most browsers).
  useEffect(() => {
    if (!narrationSupported()) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Prefer natural-sounding English voices; fall back to whatever exists.
  const voicePool = useMemo(() => {
    const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
    return (en.length ? en : voices).filter((v) => !/novelty|whisper/i.test(v.name));
  }, [voices]);

  // Assign a stable voice + pitch per speaker label.
  const speakerVoice = useMemo(() => {
    const map: Record<string, { voice?: SpeechSynthesisVoice; pitch: number }> = {};
    attendees.forEach((a, i) => {
      map[a.speakerLabel] = {
        voice: voicePool.length ? voicePool[i % voicePool.length] : undefined,
        pitch: 0.85 + ((i * 0.17) % 0.5), // 0.85–1.35, deterministic per index
      };
    });
    return map;
  }, [attendees, voicePool]);

  // Speak the active cue when it changes during playback.
  useEffect(() => {
    if (!narrationSupported()) return;
    const synth = window.speechSynthesis;

    if (!enabled || !playing) {
      synth.cancel();
      lastSpokenId.current = null;
      return;
    }
    if (!currentCue || currentCue.id === lastSpokenId.current) return;

    synth.cancel();
    const u = new SpeechSynthesisUtterance(currentCue.text);
    const cfg = speakerVoice[currentCue.speaker];
    if (cfg?.voice) u.voice = cfg.voice;
    u.pitch = cfg?.pitch ?? 1;
    u.rate = Math.min(2, Math.max(0.6, rate));
    synth.speak(u);
    lastSpokenId.current = currentCue.id;
  }, [enabled, playing, currentCue, speakerVoice, rate]);

  // Always stop speech on unmount.
  useEffect(() => {
    return () => {
      if (narrationSupported()) window.speechSynthesis.cancel();
    };
  }, []);
}
