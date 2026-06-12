/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Star, Award, Heart, Compass, ArrowRight, ArrowLeft, Check, User } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface OnboardingScreenProps {
  onComplete: (config: {
    favoriteTopics: string[];
    favoriteCharacter: string;
    favoriteCharacterEmoji: string;
    learningGoals: string[];
    customAvatar: string;
  }) => void;
  childName?: string;
}

export default function OnboardingScreen({ onComplete, childName = "Explorer" }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);

  // Step 1: Favorite Topics
  const topicOptions = [
    { id: "animals", label: "Animals 🦁", emoji: "🐹" },
    { id: "space", label: "Space 🚀", emoji: "🪐" },
    { id: "princess", label: "Princess 👑", emoji: "👸" },
    { id: "adventure", label: "Adventure 🗺️", emoji: "🤠" },
    { id: "science", label: "Science 🔬", emoji: "🧪" },
    { id: "magic", label: "Magic ✨", emoji: "🧙‍♂️" },
    { id: "cartoons", label: "Cartoons 📺", emoji: "🧸" }
  ];
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["animals", "adventure"]);

  // Step 2: Favorite Character
  const characterOptions = [
    { name: "Todd the Fox", emoji: "🦊", intro: "Hey explorer! I'm Todd the Fox! Let's wander and read story books together!" },
    { name: "Barnaby the Bear", emoji: "🐻", intro: "Hello friend, I'm Barnaby! Ready to listen to calming bedtimes and solve puzzles?" },
    { name: "Penelope Bunny", emoji: "🐰", intro: "Yippee! I'm Penelope the Bunny! Let's play balloon-pop game adventures!" },
    { name: "Denver the Dino", emoji: "🦕", intro: "Roar! I'm Denver the Dinosaur! Let's paint bright pictures and learn cool fun facts!" },
    { name: "Celeste the Unicorn", emoji: "🦄", intro: "Greetings! I am Celeste the Unicorn, let's explore sparkling magic castles!" },
    { name: "Leo the Lion", emoji: "🦁", intro: "Hehe! I'm Leo the Lion. Let's practice phonics and become super strong!" }
  ];
  const [selectedCharacter, setSelectedCharacter] = useState("Todd the Fox");
  const [selectedCharacterEmoji, setSelectedCharacterEmoji] = useState("🦊");

  // Step 3: Learning Goals
  const goalOptions = [
    { id: "reading", label: "Read micro stories and books", emoji: "📖" },
    { id: "logic", label: "Train math & logic puzzle blocks", emoji: "🧠" },
    { id: "drawing", label: "Draw, doodle, and paint canvas", emoji: "🎨" },
    { id: "calming", label: "Listen to sleepy nursery audiobooks", emoji: "😴" }
  ];
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["reading"]);

  // Step 4: Create Avatar
  const avatarOptions = [
    { emoji: "🦁", label: "Sunny Lion" },
    { emoji: "🦄", label: "Rainbow Unicorn" },
    { emoji: "🦊", label: "Swift Fox" },
    { emoji: "🐼", label: "Bamboo Panda" },
    { emoji: "🚀", label: "Astro Kid" },
    { emoji: "🦸", label: "Super Kid" },
    { emoji: "🎨", label: "Artist Kid" }
  ];
  const [selectedAvatar, setSelectedAvatar] = useState("🦁");

  const handleToggleTopic = (topicId: string) => {
    kidsSound.playGenericPop();
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectCharacter = (name: string, emoji: string, intro: string) => {
    setSelectedCharacter(name);
    setSelectedCharacterEmoji(emoji);
    kidsSound.playMagicChime();
    kidsSound.speakPhrase(intro);
  };

  const handleToggleGoal = (goalId: string) => {
    kidsSound.playGenericPop();
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSelectAvatar = (emoji: string, label: string) => {
    setSelectedAvatar(emoji);
    kidsSound.playMagicChime();
    kidsSound.speakPhrase(`Perfect avatar chosen: ${label}!`);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedTopics.length === 0) {
      kidsSound.speakPhrase("Please choose at least one favorite topic!");
      return;
    }
    if (step === 3 && selectedGoals.length === 0) {
      kidsSound.speakPhrase("Please choose at least one learning goal for your badge!");
      return;
    }
    kidsSound.playGenericPop();
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    kidsSound.playGenericPop();
    setStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    kidsSound.playTreasureChest();
    const endingSpeech = `Awesome job ${childName}! You won 50 starting bonus stars! Let's get reading!`;
    kidsSound.speakPhrase(endingSpeech);

    onComplete({
      favoriteTopics: selectedTopics,
      favoriteCharacter: selectedCharacter,
      favoriteCharacterEmoji: selectedCharacterEmoji,
      learningGoals: selectedGoals,
      customAvatar: selectedAvatar
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-[#e0f1fe] via-[#fdf2f8] to-[#faf5ff] z-50 flex items-center justify-center p-4 overflow-y-auto"
      id="wonderkids-onboarding-overlay"
    >
      <div className="absolute top-12 left-10 text-6xl select-none animate-bounce">🎈</div>
      <div className="absolute bottom-16 right-16 text-6xl select-none animate-spin [animation-duration:25s]">⭐</div>
      <div className="absolute top-1/4 right-8 text-5xl select-none opacity-30">☁️</div>

      <div 
        className="bg-white rounded-3xl border-8 border-yellow-250 p-6 md:p-10 max-w-2xl w-full shadow-[0_20px_60px_rgba(234,179,8,0.2)] relative overflow-hidden" 
        id="onboarding-card-stage"
      >
        {/* Progress bar and dot */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5 bg-yellow-104 px-3 py-1 rounded-full text-xs font-black text-amber-700">
            <span>⭐</span> Plus 50 Bonus Stars on Finish!
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`h-3 rounded-full transition-all duration-300 ${
                  s === step ? "bg-amber-400 w-10" : s < step ? "bg-emerald-400 w-3" : "bg-slate-100 w-3"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: CHOOSE FAVORITE TOPICS */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-fade-in" id="onboarding-step-topics">
            <div>
              <span className="text-xs bg-pink-100 text-pink-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">Step 1 of 4</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-heading mt-2">Pick Your Favorite Topics!</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">What do you love most? We've loaded cute custom cartoon reels for these topics.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 py-4 max-w-lg mx-auto">
              {topicOptions.map((opt) => {
                const isSelected = selectedTopics.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    id={`topic-badge-${opt.id}`}
                    onClick={() => handleToggleTopic(opt.id)}
                    className={`py-3 px-5 rounded-2xl border-4 text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer selection-none ${
                      isSelected
                        ? "bg-amber-400 border-amber-500 text-amber-955 scale-103 shadow-md"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <button
              id="onboarding-btn-next-1"
              onClick={handleNextStep}
              className="py-3.5 px-10 bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 text-white font-black text-sm rounded-xl shadow-lg transition-all hover:scale-103 active:scale-97 flex items-center gap-2 mx-auto"
            >
              Next Adventure <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: CHOOSE FAVORITE CHARACTER */}
        {step === 2 && (
          <div className="space-y-5 text-center animate-fade-in" id="onboarding-step-character">
            <div>
              <span className="text-xs bg-purple-100 text-purple-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">Step 2 of 4</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-heading mt-2">Pick Your Cosmic Companion!</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Tap an animal helper to hear their voice greeting and activate their spell!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto py-2">
              {characterOptions.map((char) => {
                const isSelected = selectedCharacter === char.name;
                return (
                  <div
                    key={char.name}
                    id={`companion-card-${char.name.replace(/\s+/g, "-")}`}
                    onClick={() => handleSelectCharacter(char.name, char.emoji, char.intro)}
                    className={`p-3 rounded-2xl border-4 cursor-pointer text-left flex items-start gap-2.5 transition-all active:scale-97 select-none ${
                      isSelected
                        ? "border-amber-400 bg-amber-50 shadow-md scale-[1.02]"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-4xl shrink-0 animate-pulse-soft">{char.emoji}</span>
                    <div className="overflow-hidden">
                      <span className="font-extrabold text-xs block font-heading">{char.name}</span>
                      <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5 max-h-12 overflow-hidden italic">
                        "{char.intro}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center max-w-lg mx-auto pt-3">
              <button
                onClick={handlePrevStep}
                className="py-2.5 px-6 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-8 bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE LEARNING GOALS */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-fade-in" id="onboarding-step-goals">
            <div>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">Step 3 of 4</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-heading mt-2">What is Your Learning Goal?</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">This configures micro challenge tasks inside the dashboard hud.</p>
            </div>

            <div className="flex flex-col gap-2.5 max-w-md mx-auto py-2">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    id={`goal-btn-${goal.id}`}
                    onClick={() => handleToggleGoal(goal.id)}
                    className={`p-3.5 rounded-2xl border-4 text-left font-black flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-amber-50 border-amber-400 text-amber-950 scale-[1.01]"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-100 text-stone-700"
                    }`}
                  >
                    <span className="text-2.5xl bg-white p-1 rounded-lg border shadow-inner">{goal.emoji}</span>
                    <span className="text-xs">{goal.label}</span>
                    {isSelected && (
                      <span className="ml-auto bg-amber-400 text-amber-950 p-1 rounded-full">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center max-w-md mx-auto pt-4">
              <button
                onClick={handlePrevStep}
                className="py-2.5 px-6 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                disabled={selectedGoals.length === 0}
                onClick={handleNextStep}
                className="py-3 px-8 bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CREATE PERSONALIZED AVATAR */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-fade-in" id="onboarding-step-avatar">
            <div>
              <span className="text-xs bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full uppercase tracking-wider">Step 4 of 4</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-heading mt-2">Create Your Custom Avatar!</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">This card avatar emoji will show on top of your live profile badge.</p>
            </div>

            {/* Selected big showcase */}
            <div className="my-3 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-300 via-pink-300 to-sky-300 flex items-center justify-center text-6xl shadow-inner border-4 border-white animate-pulse-soft">
                {selectedAvatar}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2">Active Explorer Mask</span>
            </div>

            {/* List options */}
            <div className="flex flex-wrap justify-center gap-3.5 py-4 max-w-lg mx-auto">
              {avatarOptions.map((av) => (
                <button
                  key={av.emoji}
                  id={`avatar-choice-${av.label.replace(/\s+/g, "-")}`}
                  onClick={() => handleSelectAvatar(av.emoji, av.label)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-4 transition-all active:scale-90 hover:scale-105 cursor-pointer ${
                    selectedAvatar === av.emoji
                      ? "bg-amber-400 border-amber-500 text-white shadow-md scale-110"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  }`}
                  title={av.label}
                >
                  {av.emoji}
                </button>
              ))}
            </div>

            {/* Feedback from Mascot helper friend */}
            <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl max-w-sm mx-auto flex items-center gap-3">
              <span className="text-4xl shrink-0 animate-bounce">{selectedCharacterEmoji}</span>
              <p className="text-[10px] text-sky-800 font-bold leading-tight text-left">
                <strong>Guide {selectedCharacter}:</strong> "Congratulations! Your magical character card is active. Let's step into the dashboard!"
              </p>
            </div>

            <div className="flex justify-between items-center max-w-lg mx-auto pt-2">
              <button
                onClick={handlePrevStep}
                className="py-2.5 px-6 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                id="btn-complete-onboarding"
                onClick={handleFinish}
                className="py-3.5 px-10 bg-gradient-to-r from-amber-400 via-pink-400 to-sky-400 hover:from-amber-500 hover:to-sky-500 text-white font-black text-sm rounded-xl shadow-xl transition-all border-b-4 border-sky-700 active:border-b-0 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                Enter WonderKids 🌈
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
