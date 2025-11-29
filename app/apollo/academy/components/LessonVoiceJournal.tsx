
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "@/lib/user-storage";

type LessonVoiceJournalProps = {
  trackId: string;
  lessonCode: string;
  label?: string;
};

type SpeechStatus = "idle" | "listening" | "unsupported" | "error";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export const LessonVoiceJournal: React.FC<LessonVoiceJournalProps> = ({
  trackId,
  lessonCode,
  label = "Your notes for this lesson",
}) => {
  const storageKey = useMemo(
    () => `gaia.academy.journal.${trackId}.${lessonCode}`,
    [trackId, lessonCode]
  );

  const [text, setText] = useState("");
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [canUseSpeech, setCanUseSpeech] = useState(false);

  useEffect(() => {
    const exists =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setCanUseSpeech(Boolean(exists));
  }, []);

  useEffect(() => {
    try {
      const stored = readJSON<string | null>(storageKey, null);
      if (stored !== null) {
        setText(stored);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const persist = (value: string) => {
    setText(value);
    try {
      writeJSON(storageKey, value);
    } catch {
      // ignore
    }
  };

  const handleToggleSpeech = () => {
    if (!canUseSpeech) {
      setStatus("unsupported");
      return;
    }

    if (status === "listening") {
      // stopping is handled by recognition instance itself; we just flip UI state
      setStatus("idle");
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatus("unsupported");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatus("listening");
      };

      recognition.onerror = () => {
        setStatus("error");
      };

      recognition.onend = () => {
        setStatus("idle");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          const appended =
            text.trim().length > 0
              ? text.trimEnd() + "\n" + finalTranscript.trim()
              : finalTranscript.trim();
          persist(appended);
        }
      };

      recognition.start();
    } catch {
      setStatus("error");
    }
  };

  const statusLabel =
    status === "idle"
      ? canUseSpeech
        ? "Tap mic and speak"
        : "Speech input not supported in this browser"
      : status === "listening"
      ? "Listening… tap again to stop"
      : status === "unsupported"
      ? "Speech input not supported in this browser"
      : "Something went wrong. You can still type.";

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4 space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold gaia-strong">
            {label}
          </p>
          <p className="text-[10px] sm:text-xs gaia-muted">
            You can speak or type. The text is saved automatically and will still
            be here when you come back.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleSpeech}
          disabled={!canUseSpeech}
          className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-medium transition ${
            status === "listening"
              ? "border-rose-400/70 bg-rose-400/15 text-rose-50 animate-pulse"
              : canUseSpeech
              ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-50 hover:bg-emerald-400/20"
              : "border-white/15 bg-black/30 text-white/40 cursor-default"
          }`}
        >
          {status === "listening" ? "⏺ Listening…" : "🎙 Speak"}
        </button>
      </div>

      <p className="text-[10px] sm:text-xs gaia-muted">{statusLabel}</p>

      <textarea
        value={text}
        onChange={(e) => persist(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs sm:text-sm gaia-strong outline-none focus:border-emerald-400/70 focus:ring-1 focus:ring-emerald-400/50 min-h-[120px]"
        placeholder="Dictate or type your workday as a simple timeline here..."
      />
    </section>
  );
};
