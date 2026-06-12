/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Sparkles, Star, Mail, Lock, Heart, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface SignupScreenProps {
  onRegisterSuccess: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
  onGoBack: () => void;
}

export default function SignupScreen({
  onRegisterSuccess,
  onSwitchToLogin,
  onGoBack,
}: SignupScreenProps) {
  const [parentName, setParentName] = useState("");
  const [childNickname, setChildNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageGroup, setAgeGroup] = useState<string>("6-8"); // default

  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState("");

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");

    // Input validations
    if (!parentName || !childNickname || !email || !password || !confirmPassword) {
      kidsSound.speakPhrase("Please fill in your parent name, child nickname, and starry email coordinates.");
      setErrorMess("Missing magic items! All fields must be filled in.");
      return;
    }

    if (password !== confirmPassword) {
      kidsSound.speakPhrase("Oops! Your passwords do not match like twins.");
      setErrorMess("Passwords do not match! Check spelling.");
      return;
    }

    if (password.length < 6) {
      kidsSound.speakPhrase("Safety lock warning: Your password must contain at least six stars.");
      setErrorMess("Security fairy asks for 6+ characters for safety!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName,
          childNickname,
          email,
          password,
          confirmPassword,
          ageGroup: ageGroup === "3-5" ? "3-5" : ageGroup === "6-8" ? "6-8" : "9-12"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The magic ticket printer has hit an obstacle!");
      }

      kidsSound.playTreasureChest();
      // On success, redirect right into onboarding flow
      onRegisterSuccess(data.accessToken, data.user);

    } catch (err: any) {
      setErrorMess(err.message || "Registration helper is offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAgeGroup = (range: string) => {
    kidsSound.playGenericPop();
    setAgeGroup(range);
    
    const message = range === "3-5" 
      ? "Little Sprout selected! Age 3 to 5 mode is gentle, cozy, and sleepy." 
      : range === "6-8" 
      ? "Cosmic Cadet selected! Ready for magical games and reading tasks!" 
      : "Star Voyager selected! Age 9 to 12 mode holds high-intelligence math puzzles.";
    
    kidsSound.speakPhrase(message);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-sky-50 to-pink-100"
      id="signup-page-frame"
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl border-8 border-yellow-200 overflow-hidden shadow-[0_20px_50px_rgba(234,179,8,0.15)] flex flex-col md:flex-row relative"
        id="signup-split-card"
      >
        {/* BACK ARROW LINK */}
        <button
          onClick={() => {
            kidsSound.playGenericPop();
            onGoBack();
          }}
          className="absolute top-4 left-4 z-20 flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold bg-white/80 p-2.5 rounded-full border border-slate-100 shadow-sm hover:scale-103"
          id="btn-signup-back"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* LEFT PANEL: MAGICAL ILLUSTRATION */}
        <div 
          className="w-full md:w-1/2 bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-500 p-8 flex flex-col justify-between text-white relative overflow-hidden"
          id="signup-illustration-side"
        >
          {/* Decorative elements */}
          <div className="absolute top-12 left-8 text-white/20 text-7xl select-none animate-pulse">★</div>
          <div className="absolute bottom-16 right-10 text-white/25 text-9xl animate-bounce [animation-duration:6s] select-none">🦄</div>
          <div className="absolute top-1/2 right-1/4 text-6xl opacity-15 animate-spin [animation-duration:15s] select-none">🪐</div>

          <div className="relative z-10">
            <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
              Sparkly Family Setup 👨‍👩‍👦
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 font-heading leading-tight">
              Join the Cosmic Family!
            </h2>
            <p className="text-white/90 text-xs font-semibold leading-relaxed max-w-sm mt-2 font-body">
              Create one secure parent account, build your child's custom nickname profile, and let the adventure take flight!
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            <span className="text-8xl animate-[float-gentle_6s_ease-in-out_infinite] select-none">🦄</span>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 mt-4 text-center max-w-xs">
              <p className="text-[10px] italic font-semibold leading-tight text-yellow-101">
                "Celeste the Unicorn says: Rainbow cloud balloons are ready. Fill in your name coordinates to get 50 starting star rewards!"
              </p>
            </div>
          </div>

          <div className="relative z-10 text-[10px] font-bold text-white/70 flex items-center gap-1.5">
            <ShieldCheck size={14} /> CERTIFIED KIDSAFE SAFE HAVEN (COPPA RESPONSIVE)
          </div>
        </div>

        {/* RIGHT PANEL: SIGNUP FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white" id="signup-form-side">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-slate-800 font-heading">
              New Explorer Ticket
            </h3>
            <p className="text-xs text-slate-400 font-extrabold mt-1 font-body">
              Join millions of parent & children explorers worldwide.
            </p>
          </div>

          {errorMess && (
            <div className="mb-4 p-3 bg-rose-50 border-1.5 border-rose-200 text-rose-700 rounded-xl text-[11px] font-black flex items-center gap-2 animate-bounce">
              <span>⚠️</span>
              <span>{errorMess}</span>
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Parent Name */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                  Parent Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="text"
                    maxLength={30}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Grand Voyager"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-slate-705 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Child Nickname */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                  Child Nickname
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="text"
                    maxLength={14}
                    value={childNickname}
                    onChange={(e) => setChildNickname(e.target.value)}
                    placeholder="Junior Star"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-slate-705 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                Parent Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={14} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mail.com"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-slate-705 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                  Magic Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-slate-705 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-slate-705 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Age Group Selector Buttons */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                Select Child's Age Group
              </label>
              <div className="flex gap-2 font-heading" id="signup-age-group-radios">
                {[
                  { id: "3-5", label: "3-5 yrs", emoji: "👶" },
                  { id: "6-8", label: "6-8 yrs", emoji: "🚀" },
                  { id: "9-12", label: "9-12 yrs", emoji: "🧠" }
                ].map((group) => {
                  const isSelected = ageGroup === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      id={`signup-age-${group.id}`}
                      onClick={() => handleSelectAgeGroup(group.id)}
                      className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-black flex flex-col items-center justify-center transition active:scale-95 ${
                        isSelected 
                          ? "bg-amber-400 border-amber-500 text-amber-950 scale-103 shadow-md"
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-sm">{group.emoji}</span>
                      <span>{group.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-xs rounded-xl border-b-4 border-sky-700 active:border-b-0 shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Casting Profile Spell...</>
              ) : (
                <>
                  Register Ticket <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Switch screens link */}
          <div className="mt-6 text-center text-xs font-bold text-slate-400">
            Already have an Explorer Code?{" "}
            <button
              onClick={() => {
                kidsSound.playGenericPop();
                onSwitchToLogin();
              }}
              className="text-purple-600 font-black hover:underline"
              type="button"
            >
              Sign In Here 🔑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
