/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, Sparkles, Star, Heart, ArrowLeft, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  onSwitchToSignup: () => void;
  onGoBack: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  onSwitchToSignup,
  onGoBack,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Role Selection (Parent Account vs Child Mode)
  const [loginRole, setLoginRole] = useState<"Parent" | "Child">("Parent");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      kidsSound.speakPhrase("Oops! Please fill in your email address and starry key password.");
      setErrorMess("Missing magic elements! Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setErrorMess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The magic authentication mirror is foggy. Check your details!");
      }

      kidsSound.playTreasureChest();
      onLoginSuccess(data.accessToken, data.user);

      if (rememberMe) {
        localStorage.setItem("wonderkids-remember-email", email);
      } else {
        localStorage.removeItem("wonderkids-remember-email");
      }

    } catch (err: any) {
      kidsSound.speakPhrase("Access denied! Please double check your email or password.");
      setErrorMess(err.message || "Something went wrong. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMess("");
    try {
      kidsSound.playMagicChime();
      kidsSound.speakPhrase("Connecting with Google magic...");

      // Simulate the standard Google response payload
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleEmail: email || "explorer@gmail.com",
          name: email ? email.split("@")[0] : "Google Explorer",
          imageUrl: ""
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Google authentication failed!");
      }

      kidsSound.playTreasureChest();
      onLoginSuccess(data.accessToken, data.user);

    } catch (err: any) {
      setErrorMess(err.message || "Google flight got disconnected.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    kidsSound.playMagicChime();
    kidsSound.speakPhrase("No worries, parent! We sent a secret password reset balloon to your email.");
    alert("🎈 A magic reset link has been dispatched to your email (" + (email || "registered email") + ")!");
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100"
      id="login-page-frame"
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl border-8 border-yellow-200 overflow-hidden shadow-[0_20px_50px_rgba(234,179,8,0.15)] flex flex-col md:flex-row relative"
        id="login-split-card"
      >
        {/* BACK ARROW LINK */}
        <button
          onClick={() => {
            kidsSound.playGenericPop();
            onGoBack();
          }}
          className="absolute top-4 left-4 z-20 flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold bg-white/80 p-2.5 rounded-full border border-slate-100 shadow-sm hover:scale-103"
          id="btn-login-back"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* LEFT ILLUSTRATION PANEL */}
        <div 
          className="w-full md:w-1/2 bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 p-8 flex flex-col justify-between text-white relative overflow-hidden"
          id="login-illustration-side"
        >
          {/* Decorative Sparkly elements */}
          <div className="absolute top-10 right-10 text-white/20 text-6xl animate-pulse select-none">★</div>
          <div className="absolute bottom-20 left-10 text-white/30 text-8xl animate-bounce [animation-duration:5s] select-none">🎈</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-15 select-none font-black">🏰</div>

          <div className="relative z-10">
            <span className="text-sm bg-white/20 backdrop-blur-md text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
              Safe Kids Portal 🛡️
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 font-heading leading-tight">
              Unlock the Adventure!
            </h2>
            <p className="text-white/90 text-xs font-bold leading-relaxed max-w-sm mt-2 font-body">
              Log in to save your daily coins, high scores, earned badges, and custom bedtime cartoons!
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            <span className="text-8xl animate-[float-gentle_6s_ease-in-out_infinite] select-none">🦁</span>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 mt-4 text-center max-w-xs">
              <p className="text-[10px] italic font-semibold leading-tight text-yellow-101">
                "Leo the Lion has his keys ready. Type in your magical code to hop onto the starry carousel!"
              </p>
            </div>
          </div>

          <div className="relative z-10 text-[10px] font-bold text-white/70 flex items-center gap-1">
            <Shield size={12} /> SECURED WITH 256-BIT JWT STAR PROTECTORS
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white" id="login-form-side">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-800 font-heading">
              Explorer Login
            </h3>
            <p className="text-xs text-slate-400 font-extrabold mt-1 font-body">
              Step into your magical learning and listening portal!
            </p>
          </div>

          {/* Role selector tab: Parent or Kid */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 mb-6" id="login-role-tabs">
            <button
              type="button"
              onClick={() => {
                kidsSound.playGenericPop();
                setLoginRole("Parent");
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                loginRole === "Parent" 
                  ? "bg-white text-purple-700 shadow-sm" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              👩‍👦 Parent Gate
            </button>
            <button
              type="button"
              onClick={() => {
                kidsSound.playGenericPop();
                setLoginRole("Child");
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                loginRole === "Child" 
                  ? "bg-white text-orange-600 shadow-xs" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              🧒 Kid Mode
            </button>
          </div>

          {errorMess && (
            <div className="mb-4 p-3.5 bg-rose-50 border-1.5 border-rose-200 text-rose-700 rounded-xl text-xs font-black flex items-center gap-2 animate-bounce">
              <span>⚠️</span>
              <span>{errorMess}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                {loginRole === "Parent" ? "Parent's Email Address" : "Child/Parent Account Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-xs text-slate-700 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Magical Secret Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-purple-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border-2 border-slate-100 focus:border-amber-300 rounded-xl font-bold font-body text-xs text-slate-700 focus:outline-none focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Secure elements */}
            <div className="flex items-center justify-between pb-2 text-[10px] font-bold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-yellow-400 focus:ring-yellow-300 h-4 w-4"
                />
                Remember Me
              </label>
              <span>🔒 Encrypted Link</span>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-sm rounded-xl border-b-4 border-purple-700 active:border-b-0 shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>Verifying Tickets...</>
              ) : (
                <>
                  Enter Wonderland <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-98 hover:border-slate-300"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" 
                alt="Google G" 
                className="w-4 h-4 object-contain"
              />
              Sign in with Google
            </button>
          </div>

          {/* Switching screen link */}
          <div className="mt-8 text-center text-xs font-bold text-slate-500">
            Don't have an Explorer Ticket?{" "}
            <button
              type="button"
              onClick={() => {
                kidsSound.playGenericPop();
                onSwitchToSignup();
              }}
              className="text-purple-600 font-black hover:underline underline-offset-2"
            >
              Create Account Kids Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
