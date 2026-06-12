/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, CircleDot, Volume2, Timer, Gauge, Sparkles, Sliders } from "lucide-react";
import { AudioBook } from "../types";
import { SEED_AUDIO_BOOKS } from "../data";
import { kidsSound } from "../utils/kidsSound";

interface AudioBookPlayerProps {
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
}

export default function AudioBookPlayer({ onEarnBadge, onAddStars }: AudioBookPlayerProps) {
  // Persistence of progress memory per audiobook
  const [sessionProgress, setSessionProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("wonderkids-audio-progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedBook, setSelectedBook] = useState<AudioBook>(() => {
    return SEED_AUDIO_BOOKS[0];
  });

  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0); // 0.8 | 1.0 | 1.2
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  // Gemini TTS integration
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Sleep Timer tracker
  useEffect(() => {
    if (timerMinutes === null) return;
    setTimerRemaining(timerMinutes * 60);

    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsPlaying(false);
          if (audioElement) audioElement.pause();
          clearInterval(interval);
          setTimerMinutes(null);
          // Gently announce slumber time
          kidsSound.speakPhrase("Time to rest! Milo wishes you sweet dreams.");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerMinutes]);

  // Load last remembered chapter when book choice changes
  useEffect(() => {
    const savedChapter = sessionProgress[selectedBook.id];
    if (savedChapter !== undefined && savedChapter < selectedBook.chapters.length) {
      setActiveChapterIdx(savedChapter);
    } else {
      setActiveChapterIdx(0);
    }
  }, [selectedBook]);

  // Save progress memory when chapter changes
  useEffect(() => {
    if (!selectedBook) return;
    const nextProgress = { ...sessionProgress, [selectedBook.id]: activeChapterIdx };
    setSessionProgress(nextProgress);
    localStorage.setItem("wonderkids-audio-progress", JSON.stringify(nextProgress));
  }, [activeChapterIdx, selectedBook]);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      if (audioElement) {
        audioElement.pause();
      }
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
      setIsPlaying(false);
      kidsSound.playGenericPop();
    } else {
      setIsPlaying(true);
      kidsSound.playMagicChime();
      await playChapterTTS();
    }
  };

  const playChapterTTS = async () => {
    const textToSpeak = selectedBook.chapters[activeChapterIdx].text;
    setAudioLoading(true);

    // Stop existing audio playbacks
    if (audioElement) {
      audioElement.pause();
    }
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    let audioPlayed = false;

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, voice: "zephyr" }) // Zephyr is majestic & smooth
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audioSrc = `data:audio/wav;base64,${data.audio}`;
          const audio = new Audio(audioSrc);
          audio.playbackRate = speed;
          setAudioElement(audio);
          audio.play();

          audio.onended = () => {
            // Go to next chapter if available
            if (activeChapterIdx + 1 < selectedBook.chapters.length) {
              onAddStars(3);
              kidsSound.playGenericPop();
              setActiveChapterIdx((prev) => prev + 1);
            } else {
              setIsPlaying(false);
              onEarnBadge("badge-first-audiobook");
              onAddStars(25);
              kidsSound.playTreasureChest();
            }
          };
          audioPlayed = true;
        }
      }
    } catch (err) {
      console.warn("TTS API fetch or audio format playback failed. Falling back to local SpeechSynthesis:", err);
    }

    // Direct Browser SpeechSynthesis Fallback if server TTS didn't play audio
    if (!audioPlayed) {
      try {
        const synth = window.speechSynthesis;
        if (synth) {
          synth.cancel(); // Flush previous speech queue
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = speed;
          
          utterance.onend = () => {
            if (activeChapterIdx + 1 < selectedBook.chapters.length) {
              onAddStars(3);
              kidsSound.playGenericPop();
              setActiveChapterIdx((prev) => prev + 1);
            } else {
              setIsPlaying(false);
              onEarnBadge("badge-first-audiobook");
              onAddStars(25);
              kidsSound.playTreasureChest();
            }
          };

          utterance.onerror = (e) => {
            console.error("SpeechSynthesis error details:", e);
            if (e.error !== "interrupted" && e.error !== "canceled") {
              setIsPlaying(false);
            }
          };

          synth.speak(utterance);
          audioPlayed = true;
        } else {
          setIsPlaying(false);
        }
      } catch (fallbackError) {
        console.error("Local SpeechSynthesis completely failed:", fallbackError);
        setIsPlaying(false);
      }
    }

    setAudioLoading(false);
  };

  // Speed Adjustment
  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = speed;
    }
  }, [speed, audioElement]);

  // Tab unmount & audio system cleanup
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    };
  }, [audioElement]);

  const nextChapter = () => {
    if (activeChapterIdx + 1 < selectedBook.chapters.length) {
      kidsSound.playGenericPop();
      setActiveChapterIdx((prev) => prev + 1);
    }
  };

  const prevChapter = () => {
    if (activeChapterIdx - 1 >= 0) {
      kidsSound.playGenericPop();
      setActiveChapterIdx((prev) => prev - 1);
    }
  };

  // When active chapter moves, trigger reload if actively playing
  useEffect(() => {
    if (isPlaying) {
      playChapterTTS();
    }
  }, [activeChapterIdx]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-4 border-purple-200 shadow-xl font-body" id="audio-books-station">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-purple-800 flex items-center gap-2 font-heading">
            <Volume2 className="text-pink-500 fill-pink-200" />
            Wonderkids Audio Book Lounge
          </h2>
          <p className="text-purple-750 font-body">Listen to classic lullabies & moral adventures spoken aloud by friendly sleep narrators!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Books List selection */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border-2 border-purple-100 space-y-3 font-body">
          <span className="text-xs font-bold text-slate-400 block tracking-wide uppercase font-body">
            Library Selection
          </span>

          <div className="space-y-2">
            {SEED_AUDIO_BOOKS.map((book) => (
              <button
                key={book.id}
                id={`btn-audiobook-${book.id}`}
                onClick={() => {
                  kidsSound.playGenericPop();
                  if (audioElement) audioElement.pause();
                  setSelectedBook(book);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg border flex items-center gap-3 transition-all active:scale-98 font-button ${
                  selectedBook.id === book.id
                    ? "bg-purple-100/50 border-purple-400 text-purple-900 shadow-sm"
                    : "border-slate-100 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${book.coverBg} text-lg`}>
                  {book.coverEmoji}
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-xs truncate block font-heading">{book.title}</span>
                  <span className="text-[10px] text-slate-600 block font-body">{book.duration} • {book.narrator}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Speed Controls info box */}
          <div className="border-t pt-3 space-y-2 text-xs text-slate-500 font-semibold font-body">
            <div className="flex justify-between">
              <span>Voice speed:</span>
              <span className="text-purple-600 font-bold font-body">{speed}x pace</span>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg gap-1 border">
              {[0.8, 1.0, 1.2].map((s) => (
                <button
                  key={s}
                  id={`btn-speed-${s.toString().replace(".", "-")}`}
                  onClick={() => {
                    kidsSound.playGenericPop();
                    setSpeed(s);
                  }}
                  className={`flex-1 text-[10px] py-1 font-black rounded-lg ${
                    speed === s ? "bg-purple-600 text-white shadow-sm font-black" : "hover:bg-slate-200"
                  }`}
                >
                  {s === 0.8 ? "Slow 🐢" : s === 1.0 ? "Normal 🚶" : "Fast 🚀"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Col: Music Player HUD */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border-4 border-pink-200 shadow-inner flex flex-col items-center justify-between text-center min-h-[300px]">
          {/* Sleep timer status header */}
          <div className="w-full flex justify-between items-center text-xs font-extrabold text-slate-400 font-body">
            <span className="flex items-center gap-1">
              <Timer size={14} /> Sleep Timer:{" "}
              {timerRemaining ? (
                <span className="text-pink-600 font-bold font-mono">
                  {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, "0")}
                </span>
              ) : (
                "Not set"
              )}
            </span>

            {/* Timers choices */}
            <div className="flex gap-2 font-button">
              {[5, 10, 15].map((m) => (
                <button
                  key={m}
                  id={`btn-sleep-timer-${m}`}
                  onClick={() => {
                    kidsSound.playMagicChime();
                    setTimerMinutes(m);
                    kidsSound.speakPhrase(`Sleep timer set to ${m} minutes.`);
                  }}
                  className={`px-2 py-0.5 rounded-lg border ${
                    timerMinutes === m ? "bg-pink-600 text-white font-bold" : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {m}m
                </button>
              ))}
              {timerMinutes !== null && (
                <button
                  onClick={() => {
                    kidsSound.playGenericPop();
                    setTimerMinutes(null);
                    setTimerRemaining(null);
                    kidsSound.speakPhrase("Sleep timer turned off.");
                  }}
                  className="text-slate-400 hover:text-slate-600 underline font-button animate-pulse-soft"
                >
                  Off
                </button>
              )}
            </div>
          </div>

          {/* Album visual art animation */}
          <div className="space-y-3 py-6 font-body">
            <div className="relative">
              <div
                className={`w-32 h-32 mx-auto rounded-xl bg-gradient-to-tr ${
                  selectedBook.coverBg
                } shadow-lg border-8 border-yellow-200 flex items-center justify-center text-5xl transform duration-500 select-none ${
                  isPlaying ? "animate-spin [animation-duration:8s]" : ""
                }`}
              >
                {selectedBook.coverEmoji}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-lg border border-slate-300 shadow-inner flex items-center justify-center">
                <CircleDot size={12} className="text-slate-800 animate-pulse-soft" />
              </div>
            </div>

            <div>
              <div className="flex justify-center items-center gap-1.5">
                <h3 className="text-xl font-black text-purple-900 font-heading">{selectedBook.title}</h3>
                {sessionProgress[selectedBook.id] !== undefined && sessionProgress[selectedBook.id] > 0 && (
                  <span className="bg-purple-100 text-purple-700 font-black text-[9px] px-1.5 py-0.5 rounded" title="Auto-resume status active">
                    ⏳ Page {sessionProgress[selectedBook.id] + 1}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-sm mx-auto font-body">
                {selectedBook.summary}
              </p>
            </div>
          </div>

          {/* Passive highlighted page paragraph */}
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 max-w-md w-full mb-4 font-body">
            <span className="text-[10px] uppercase font-black tracking-wide text-purple-400 block mb-1 font-body">
              Currently Reading: {selectedBook.chapters[activeChapterIdx]?.title || "First Chapter"}
            </span>
            <p className="text-xs text-slate-700 italic font-semibold leading-relaxed font-body">
              "{selectedBook.chapters[activeChapterIdx]?.text || "No text segment available"}"
            </p>
          </div>

          {/* Controls button panel */}
          <div className="flex items-center gap-4 font-button">
            <button
              onClick={prevChapter}
              disabled={activeChapterIdx === 0}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-800 rounded-lg transition disabled:opacity-30 active:scale-95"
            >
              <SkipBack size={20} />
            </button>

            <button
              id="btn-play-audiobook"
              onClick={handleTogglePlay}
              className="p-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-xl"
            >
              {audioLoading ? (
                <Sparkles className="animate-spin text-white" />
              ) : isPlaying ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" className="translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextChapter}
              disabled={activeChapterIdx + 1 >= selectedBook.chapters.length}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-800 rounded-lg transition disabled:opacity-30 active:scale-95"
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
