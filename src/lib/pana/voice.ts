"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Talk to Pana with the browser's built-in speech APIs (free, no keys):
 * SpeechRecognition for listening (Chrome, Edge, Safari) and speechSynthesis
 * for Pana's voice. Falls back gracefully where unsupported.
 */

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoice({ onFinal, lang = "en-US" }: { onFinal: (text: string) => void; lang?: string }) {
  const [supported, setSupported] = useState({ listen: false, speak: false });
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  });

  useEffect(() => {
    // Feature detection must run in the browser.
    setSupported({ listen: Boolean(recognitionCtor()), speak: "speechSynthesis" in window }); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const listen = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    window.speechSynthesis?.cancel(); // don't let Pana talk over you
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        final = e.results[i].isFinal;
      }
      setInterim(text);
      if (final && text.trim()) {
        setInterim("");
        onFinalRef.current(text.trim());
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOn || !("speechSynthesis" in window)) return;
      const clean = text.replace(/[*_#•]/g, "").replace(/\[[^\]]*\]/g, "");
      const u = new SpeechSynthesisUtterance(clean);
      // Prefer a voice matching the reply's language (Pana switches to Spanish).
      const spanish = /[¿¡ñ]|\b(qué|pana|dale|wepa|bienvenid)/i.test(clean) && /\b(el|la|que|tu|y)\b/i.test(clean);
      const want = spanish ? "es" : "en";
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(want));
      if (voice) u.voice = voice;
      u.rate = 1.03;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [voiceOn],
  );

  return { supported, listening, interim, listen, stop, voiceOn, setVoiceOn, speak };
}
