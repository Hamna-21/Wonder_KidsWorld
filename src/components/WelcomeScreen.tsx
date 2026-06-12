/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Star, ChevronRight, HelpCircle, ShieldAlert, Award, Volume2, VolumeX, Mail, Lock } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface WelcomeScreenProps {
  onStartSignUp: () => void;
  onStartLogin: () => void;
  onContinueAsGuest: () => void;
}

export default function WelcomeScreen({
  onStartSignUp,
  onStartLogin,
  onContinueAsGuest,
}: WelcomeScreenProps) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activeMascotEmoji, setActiveMascotEmoji] = useState("🦊");
  const [waveCounter, setWaveCounter] = useState(0);

  // Automatic mascot waving animation interval
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveCounter((prev) => prev + 1);
      kidsSound.playGenericPop();
    }, 4500);
    return () => clearInterval(waveInterval);
  }, []);

  const handleMascotClick = () => {
    kidsSound.playMagicChime();
    kidsSound.speakPhrase("Hello explorer! I am Todd the Fox. Click a button below to enter my magical wonderland!");
    // Fun mascot cycle
    const emojis = ["🦊", "🐻", "🐰", "🦕", "🐨", "🦁"];
    const curIndex = emojis.indexOf(activeMascotEmoji);
    const nextEmoji = emojis[(curIndex + 1) % emojis.length];
    setActiveMascotEmoji(nextEmoji);
  };

  const playBackgroundMelody = () => {
    try {
      if (isPlayingMusic) {
        window.speechSynthesis.cancel();
        setIsPlayingMusic(false);
        return;
      }
      
      setIsPlayingMusic(true);
      kidsSound.playMagicChime();
      kidsSound.speakPhrase("Welcome to WonderKids World! Let's play together.");
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#fae8ff] to-[#fef2f2]"
      id="magical-welcome-screen"
    >
      {/* Moving Clouds */}
      <div className="absolute top-12 left-[-100px] text-5xl opacity-30 animate-[float-cloud-right_22s_linear_infinite]" style={{ animationDelay: "0s" }}>☁️</div>
      <div className="absolute top-36 right-[-100px] text-6xl opacity-20 animate-[float-cloud-left_28s_linear_infinite]" style={{ animationDelay: "2s" }}>☁️</div>
      <div className="absolute bottom-24 left-[-100px] text-4xl opacity-25 animate-[float-cloud-right_32s_linear_infinite]" style={{ animationDelay: "4s" }}>☁️</div>

      {/* Floating Sparkles & Sparkly Stars */}
      <div className="absolute top-20 right-20 text-yellow-400 text-3xl animate-pulse [animation-duration:1.5s] select-none">⭐</div>
      <div className="absolute top-48 left-16 text-pink-400 text-2xl animate-pulse [animation-duration:2s] select-none">✨</div>
      <div className="absolute bottom-40 right-24 text-sky-400 text-4xl animate-bounce [animation-duration:3s] select-none">💫</div>
      <div className="absolute bottom-16 left-28 text-amber-400 text-3xl animate-bounce [animation-duration:4s] select-none">🌟</div>

      {/* Floating Book & Balloon Accents */}
      <div className="absolute top-1/4 left-1/10 text-5xl animate-[float-gentle_6s_ease-in-out_infinite] select-none filter drop-shadow">📚</div>
      <div className="absolute top-1/3 right-1/10 text-5xl animate-[float-gentle_8s_ease-in-out_infinite_1s] select-none filter drop-shadow">🎈</div>
      <div className="absolute bottom-1/3 left-1/12 text-5xl animate-bounce [animation-duration:5s] select-none">🎨</div>
      <div className="absolute bottom-1/5 right-1/12 text-6xl animate-pulse [animation-duration:3.5s] select-none">🦖</div>

      <div 
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl border-8 border-yellow-200 p-8 md:p-12 text-center shadow-[0_30px_70px_rgba(234,179,8,0.25)] relative z-10 transition-all duration-300"
        id="welcome-card-box"
      >
        {/* Soft Background Music/Audio ambient controller */}
        <button
          onClick={playBackgroundMelody}
          className="absolute top-4 right-4 p-3 rounded-full bg-yellow-104 border-2 border-yellow-300 text-yellow-800 hover:bg-yellow-250 transition-transform active:scale-90"
          id="btn-toggle-welcome-melody"
          title="Toggle Welcome Greeting Narration"
        >
          {isPlayingMusic ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
        </button>

        {/* Animated logo reveal */}
        <div className="mb-6 inline-block relative scale-110" id="welcome-logo-container">
          <div className="text-7xl animate-bounce select-none filter drop-shadow-md">
            🌈🏰✨
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-spin [animation-duration:10s]">⭐</div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-heading leading-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-pink-500 to-amber-500 mb-4 animate-fade-in">
          Welcome to WonderKids World
        </h1>

        {/* Subheading */}
        <p className="text-md md:text-lg font-bold text-slate-500 max-w-lg mx-auto mb-8 font-body leading-relaxed">
          A magical place to learn, listen, play, and explore fables, cartoons, and interactive puzzle blocks!
        </p>

        {/* Mascot waves at user */}
        <div 
          onClick={handleMascotClick}
          className="my-8 cursor-pointer inline-flex flex-col items-center group relative select-none"
          id="waving-mascot-container"
        >
          <div className="relative">
            <span className="text-8xl block transition-transform group-hover:scale-110 active:scale-95 duration-200">
              {activeMascotEmoji}
            </span>
            {/* Wave animation tag */}
            <span className={`absolute -top-2 -right-6 text-4xl origin-bottom-left ${
              waveCounter % 2 === 0 ? "animate-[wave-hand_1.2s_ease-in-out_infinite]" : "rotate-12"
            }`}>
              👋
            </span>
          </div>
          <span className="mt-2 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full group-hover:bg-amber-100 transition-colors">
            Todd says: "Tap me to change my face!"
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-4" id="welcome-button-group">
          {/* Get Started */}
          <button
            id="welcome-get-started-btn"
            onClick={() => {
              kidsSound.playMagicChime();
              onStartSignUp();
            }}
            className="py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 text-white font-black text-sm shadow-[0_8px_20px_rgba(14,165,233,0.3)] transition-transform active:scale-95 border-b-4 border-sky-700 hover:scale-[1.03]"
          >
            Get Started 🚀
          </button>

          {/* Login */}
          <button
            id="welcome-login-btn"
            onClick={() => {
              kidsSound.playGenericPop();
              onStartLogin();
            }}
            className="py-4 px-6 rounded-2xl bg-white border-4 border-yellow-300 text-yellow-800 font-extrabold text-sm shadow-md transition-transform active:scale-95 hover:bg-yellow-50 hover:scale-[1.03]"
          >
            Login Key 🔑
          </button>

          {/* Continue as Guest */}
          <button
            id="welcome-guest-btn"
            onClick={() => {
              kidsSound.playGenericPop();
              kidsSound.speakPhrase("Alright, entering as guest explorer!");
              onContinueAsGuest();
            }}
            className="py-4 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-transform active:scale-95 hover:scale-[1.03]"
          >
            Guest Tour 🚶‍♂️
          </button>
        </div>

        {/* Security / Safe Space Banner */}
        <div className="mt-12 flex justify-center items-center gap-2 max-w-md mx-auto p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-[10px] font-black">
          <span>🛡️ Certified Safe & Playful Learning Space for Toddlers & Kids.</span>
        </div>
      </div>
    </div>
  );
}
