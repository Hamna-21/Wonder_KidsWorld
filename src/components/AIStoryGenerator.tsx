/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Play, BookOpen, Volume2, Wand2, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Story } from "../types";

interface AIStoryGeneratorProps {
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
  onStoryCreated: (newStory: Story) => void;
}

export default function AIStoryGenerator({ onEarnBadge, onAddStars, onStoryCreated }: AIStoryGeneratorProps) {
  const [character, setCharacter] = useState("Ollie the Baby Panda");
  const [theme, setTheme] = useState("The Candy Kingdom");
  const [adventure, setAdventure] = useState("Finding the lost cookie key");
  const [endingStyle, setEndingStyle] = useState("Joyfully singing together in bedtime");
  const [ageGroup, setAgeGroup] = useState("3-5 years");
  const [customCharacter, setCustomCharacter] = useState("");
  const [customTheme, setCustomTheme] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [activePageIdx, setActivePageIdx] = useState(0);

  // Audio Playback
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const characterPresets = [
    { name: "Ollie the Panda 🐼", value: "Ollie the Baby Panda" },
    { name: "Luna the Unicorn 🦄", value: "Luna the Starry Unicorn" },
    { name: "Barnaby the Beaver 🦦", value: "Barnaby the Beaver Builder" },
    { name: "Sparky the Dragon 🐲", value: "Sparky the Little Baking Dragon" },
  ];

  const themePresets = [
    { name: "Candy Kingdom 🍭", value: "The magical Candy Kingdom with licorice bridges" },
    { name: "Star Cluster 🚀", value: "A glowing blue Mars canyon in the Outer Milky Way" },
    { name: "Dino Cove 🦖", value: "The sunny Jurassic bay with warm gentle volcanoes" },
    { name: "Ocean Kingdom 🧜‍♀️", value: "The glowing coral reefs under the deep turquoise sea" },
  ];

  const adventurePresets = [
    { text: "Finding the giant cookie key 🍪", value: "finding the legendary golden cookie key" },
    { text: "Returning a lonely baby dino home 🦕", value: "helping a tiny baby dinosaur find its forest home" },
    { text: "Saving a stuck shooting star 🌠", value: "rescuing a mischievous shooting star stuck in a tree branch" },
  ];

  const generateAIStory = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setGeneratedStory(null);

    const charInput = customCharacter.trim() || character;
    const themeInput = customTheme.trim() || theme;

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: charInput,
          theme: themeInput,
          adventure,
          endingStyle,
          ageGroup
        })
      });

      if (!response.ok) {
        throw new Error("Story generation returned a clouds delay, try again.");
      }

      const val: Story = await response.json();
      setGeneratedStory(val);
      setActivePageIdx(0);
      onEarnBadge("badge-story-architect");
      onAddStars(30);
      onStoryCreated(val); // Add to dynamic list

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to summon the Story Wizard. Let's try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (textToSpeak: string) => {
    if (audioLoading) return;
    setAudioLoading(true);

    // Stop current audio first
    if (audioElement) {
      audioElement.pause();
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, voice: "kore" })
      });

      const data = await response.json();

      if (data.audio) {
        // Play the audio
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        setAudioElement(audio);
        audio.play();
      } else {
        // Mock fallback text narration using standard SpeechSynthesis if online TTS is empty or failed
        const synth = window.speechSynthesis;
        if (synth) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 0.9; // charming voice pace
          synth.speak(utterance);
        } else {
          alert("Your device doesn't support speaking aloud. Try updating Chrome/Safari!");
        }
      }

    } catch (err) {
      console.error("TTS Failed:", err);
      // Fallback
      const synth = window.speechSynthesis;
      if (synth) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.9;
        synth.speak(utterance);
      }
    } finally {
      setAudioLoading(false);
    }
  };

  const stopMusicAudio = () => {
    if (audioElement) {
      audioElement.pause();
    }
    window.speechSynthesis.cancel();
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border-4 border-violet-200 shadow-xl font-body" id="ai-storybuilder">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-violet-800 flex items-center gap-2 font-heading">
            <Sparkles className="text-yellow-400 fill-yellow-400" />
            AI Magical Story Wizard
          </h2>
          <p className="text-violet-750 font-body">Choose your favorite character & theme to build a brand new custom illustrated story!</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
          <Loader2 className="h-16 w-16 text-violet-600 animate-spin" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-violet-900">Mixing Magical Inks...</h3>
            <p className="text-slate-500 max-w-sm font-semibold">
              The AI Story Pixie is painting your pages and preparing cookie rewards! This takes around 5 seconds.
            </p>
          </div>
          {/* Animated cute facts during loader */}
          <div className="bg-white p-4 rounded-xl border max-w-sm text-xs font-semibold text-slate-500">
            🐱 Did you know? Honeybees recognize human faces! Next time you see a bee, wave cheerfully!
          </div>
        </div>
      ) : generatedStory ? (
        /* Render newly generated story reader */
        <div className="bg-white p-6 rounded-xl border-2 border-violet-100 shadow-sm font-body" id="generated-story-reader">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                setGeneratedStory(null);
                stopMusicAudio();
              }}
              className="flex items-center gap-1.5 font-extrabold text-[#7c3aed] text-sm hover:underline font-button"
            >
              <ArrowLeft size={16} /> Choose New Parameters
            </button>
            <span className="bg-violet-100 text-violet-800 font-bold px-3 py-1 rounded-lg text-xs font-body">
              AI Generated Magic 🪄
            </span>
          </div>

          <div className="text-center space-y-6">
            <h3 className="text-3xl font-black text-violet-900 border-b pb-2 mb-2 font-heading">
              {generatedStory.title}
            </h3>

            {/* Visual Page display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-violet-50/50 p-6 rounded-xl border border-violet-100 font-body">
              <div className="flex items-center justify-center text-8xl h-48 bg-white rounded-xl border shadow-sm select-none animate-bounce">
                {generatedStory.pages[activePageIdx]?.illustration || "📖"}
              </div>
              <div className="text-left space-y-4">
                <span className="text-xs font-black uppercase text-violet-500 tracking-wider font-body">
                  Page {activePageIdx + 1} of {generatedStory.pages.length}
                </span>
                <p className="text-lg font-medium text-slate-800 leading-relaxed md:min-h-24 font-body font-bold">
                  {generatedStory.pages[activePageIdx]?.text}
                </p>

                <div className="flex gap-2">
                  <button
                    id="btn-speak-chapter-page"
                    onClick={() => playTTS(generatedStory.pages[activePageIdx].text)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-lg shadow-md active:scale-95 transition-all font-button"
                  >
                    <Volume2 size={16} /> {audioLoading ? "Casting Voice..." : "🔊 Read Page Aloud"}
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between pt-4">
              <button
                disabled={activePageIdx === 0}
                onClick={() => {
                  stopMusicAudio();
                  setActivePageIdx((p) => p - 1);
                }}
                className="py-2 px-4 rounded-lg font-bold bg-slate-50 border text-slate-700 disabled:opacity-40 font-button"
              >
                Previous Page
              </button>
              <div className="flex gap-1 items-center">
                {generatedStory.pages.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 text-xs rounded-lg transition-all duration-200 ${
                      i === activePageIdx ? "bg-violet-600 w-6" : "bg-slate-200 w-2"
                    }`}
                  />
                ))}
              </div>
              {activePageIdx + 1 < generatedStory.pages.length ? (
                <button
                  onClick={() => {
                    stopMusicAudio();
                    setActivePageIdx((p) => p + 1);
                  }}
                  className="py-2 px-4 rounded-lg font-bold bg-[#7c3aed] text-white hover:bg-violet-700 transition font-button"
                >
                  Next Page 👉
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGeneratedStory(null);
                    stopMusicAudio();
                  }}
                  className="py-2 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg transition font-button"
                >
                  Finish & Get Coins! 💰
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Configuration Screen */
        <div className="bg-white p-6 rounded-xl border-2 border-violet-100 shadow-sm space-y-6 font-body">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-700 border-2 border-rose-100 p-3 rounded-lg text-sm font-semibold font-body">
              🚨 {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
            {/* Left Col: Setup form */}
            <div className="space-y-4">
              {/* Character presets */}
              <div>
                <label className="text-sm font-extrabold text-violet-900 block mb-2 font-body">
                  1. Choose Hero Character
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {characterPresets.map((p) => (
                    <button
                      key={p.value}
                      id={`hero-preset-${p.value.replace(/\s+/g, "-")}`}
                      onClick={() => {
                        setCharacter(p.value);
                        setCustomCharacter("");
                      }}
                      className={`text-xs p-2 text-left rounded-lg border font-bold transition-all active:scale-95 font-button ${
                        character === p.value && !customCharacter
                           ? "bg-violet-50 border-violet-400 text-violet-900 animate-pulse-soft"
                           : "border-slate-100 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {/* Custom Hero input */}
                <input
                  type="text"
                  placeholder="Or type a custom hero... (e.g. Blue Robot)"
                  value={customCharacter}
                  onChange={(e) => setCustomCharacter(e.target.value)}
                  className="w-full mt-2 text-xs p-2 border-2 border-slate-100 rounded-lg focus:border-violet-300 focus:outline-none font-medium font-body"
                />
              </div>

              {/* Theme Settings */}
              <div>
                <label className="text-sm font-extrabold text-violet-900 block mb-2 font-body">
                  2. Where is this adventure happening?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themePresets.map((p) => (
                    <button
                      key={p.value}
                      id={`theme-preset-${p.value.substring(0, 10).replace(/\s+/g, "-")}`}
                      onClick={() => {
                        setTheme(p.value);
                        setCustomTheme("");
                      }}
                      className={`text-xs p-2 text-left rounded-lg border font-bold transition-all active:scale-95 font-button ${
                        theme === p.value && !customTheme
                          ? "bg-violet-50 border-violet-400 text-violet-900"
                          : "border-slate-100 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or write custom setting... (e.g. Floating Bed)"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="w-full mt-2 text-xs p-2 border-2 border-slate-100 rounded-lg focus:border-violet-300 focus:outline-none font-medium font-body"
                />
              </div>
            </div>

            {/* Right Col: Goal and style selection */}
            <div className="space-y-4">
              {/* Adventures list */}
              <div>
                <label className="text-sm font-extrabold text-violet-900 block mb-2 font-body">
                  3. What is the Hero's Mission?
                </label>
                <div className="space-y-1.5 font-button">
                  {adventurePresets.map((p) => (
                    <button
                      key={p.value}
                      id={`adv-preset-${p.value.substring(0, 15).replace(/\s+/g, "-")}`}
                      onClick={() => setAdventure(p.value)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border font-bold transition-all ${
                        adventure === p.value
                          ? "bg-violet-50 border-violet-400 text-violet-900"
                          : "border-slate-100 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ending settings */}
              <div>
                <label className="text-sm font-extrabold text-violet-900 block mb-2 font-body">
                  4. Story Mood / Ending Style
                </label>
                <select
                  value={endingStyle}
                  onChange={(e) => setEndingStyle(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-slate-100 rounded-lg focus:border-violet-300 focus:outline-none font-bold text-slate-700 font-body"
                >
                  <option value="Very funny, laughing, and ticklish chocolate rain">Funny & Silly 🤪</option>
                  <option value="Sleepy, slow-breathing, and warm bedtime cozy pillow hugs">Cozy Bedtime 😴</option>
                  <option value="Learning a sweet friendly lesson about sharing cookies">Sharing Moral Lesson 💖</option>
                  <option value="Triumph discovery with sparkling stars inside a trophy box">Exciting & Heroic 🏆</option>
                </select>
              </div>

              {/* Child age group */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 font-body">
                  Age group target
                </label>
                <div className="flex gap-2">
                  {["3-5 years", "6-8 years", "9-12 years"].map((grp) => (
                    <button
                      key={grp}
                      id={`grp-preset-${grp.replace(/\s+/g, "-")}`}
                      onClick={() => setAgeGroup(grp)}
                      className={`flex-1 text-[11px] py-1.5 px-1.5 rounded-lg border font-bold active:scale-95 transition-all font-button ${
                        ageGroup === grp
                          ? "bg-[#7c3aed] text-white border-violet-600 shadow-sm font-bold"
                          : "border-slate-100 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-trigger-ai-spell"
            onClick={generateAIStory}
            className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 text-white font-black rounded-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-lg uppercase tracking-wide cursor-pointer font-button"
          >
            <Wand2 className="animate-bounce" /> Cast Story Wizard Spell ✨
          </button>
        </div>
      )}
    </div>
  );
}
