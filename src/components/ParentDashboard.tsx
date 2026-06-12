/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Unlock, Settings, ShieldAlert, Award, Clock, Star, Brain, CheckCircle } from "lucide-react";
import { ParentConfig, AchievementBadge } from "../types";

interface ParentDashboardProps {
  parentConfig: ParentConfig;
  setParentConfig: React.Dispatch<React.SetStateAction<ParentConfig>>;
  stars: number;
  coins: number;
  badges: AchievementBadge[];
  onAddStars: (count: number) => void;
  onAddCoins: (count: number) => void;
}

export default function ParentDashboard({
  parentConfig,
  setParentConfig,
  stars,
  coins,
  badges,
  onAddStars,
  onAddCoins,
}: ParentDashboardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  const staticCategories = [
    "Fairy Tales",
    "Princess Stories",
    "Science Stories",
    "Moral Stories",
    "Magic Toons",
    "Funny Cartoons",
    "Nursery Rhymes",
  ];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === parentConfig.parentPin) {
      setIsLocked(false);
      setPinError("");
    } else {
      setPinError("Wrong PIN! Ask your mom or dad to help! Hint: It's '1234'");
    }
    setEnteredPin("");
  };

  const handleToggleCategory = (category: string) => {
    setParentConfig((prev) => {
      const exists = prev.blockCategoryList.includes(category);
      return {
        ...prev,
        blockCategoryList: exists
          ? prev.blockCategoryList.filter((c) => c !== category)
          : [...prev.blockCategoryList, category],
      };
    });
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl border-4 border-rose-200 shadow-xl font-body" id="parents-guardian-deck">
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-rose-100 font-body">
        <div>
          <h2 className="text-3xl font-bold text-rose-800 flex items-center gap-2 font-heading">
            <Settings className="text-rose-500" />
            Parents Guardian Deck
          </h2>
          <p className="text-rose-700 text-sm font-medium font-body">Set bedtime limits, monitor progress, and review earned badges.</p>
        </div>
        <div className="font-button">
          <span className="bg-rose-100 text-rose-800 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            {isLocked ? "Locked for Safety" : "Guardian Mode Active"}
          </span>
        </div>
      </div>

      {isLocked ? (
        /* Pin Pad lock */
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 font-body">
          <div className="p-4 bg-rose-100 rounded-xl text-rose-600 animate-bounce">
            <Lock size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-rose-900 font-heading">Are you a parent?</h3>
            <p className="text-slate-500 text-xs font-bold max-w-xs font-body">
              This section is secure for moms & dads. Please enter the default safety PIN to enter! (Hint: It is <span className="underline font-bold">1234</span>)
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-2 w-full max-w-xs font-body">
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full text-center text-2xl tracking-widest p-2 border-4 border-rose-100 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-50 bg-white font-mono"
            />
            {pinError && (
              <span className="text-[11px] font-black text-rose-600 font-body">
                {pinError}
              </span>
            )}
            <button
              id="submit-pin"
              type="submit"
              className="mt-2 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-lg shadow-md active:scale-95 transition-all font-button"
            >
              Enter Dashboard 👑
            </button>
          </form>
        </div>
      ) : (
        /* Unlocked statistics and preferences */
        <div className="space-y-6 font-body" id="parents-panel-unlocked">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-body">
            <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <span className="text-xs text-slate-400 font-bold block leading-none font-body">Total Stars</span>
                <span className="text-xl font-black text-amber-500 font-heading">{stars}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
              <span className="text-3xl">🪙</span>
              <div>
                <span className="text-xs text-slate-400 font-bold block leading-none font-body">Magic Coins</span>
                <span className="text-xl font-black text-yellow-600 font-heading">{coins}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <div>
                <span className="text-xs text-slate-400 font-bold block leading-none font-body">Badges Unlocked</span>
                <span className="text-xl font-black text-purple-600 font-heading">{badges.length} / 6</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <div>
                <span className="text-xs text-slate-400 font-bold block leading-none font-body">Limit Active</span>
                <span className="text-xl font-black text-rose-500 font-heading">{parentConfig.screenTimeLimitMinutes}m</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Limit controls & timers */}
            <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-rose-900 border-b pb-2 flex items-center gap-2 font-heading">
                <Clock className="text-rose-500" size={18} /> Screentime & Sleep Control
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-slate-600 text-xs mb-1 font-body">
                    <span>Daily Screen Limit:</span>
                    <span className="text-rose-600 font-black">{parentConfig.screenTimeLimitMinutes} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={parentConfig.screenTimeLimitMinutes}
                    onChange={(e) =>
                      setParentConfig((p) => ({ ...p, screenTimeLimitMinutes: Number(e.target.value) }))
                    }
                    className="w-full accent-rose-500"
                  />
                  <span className="text-[10px] text-slate-400 font-bold font-body">
                    Automatically triggers Bedtime Mode once this duration is exceeded.
                  </span>
                </div>

                {/* Bedtime Hour setup */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-600 text-xs block font-body">Enforce Bedtime Lockout</span>
                      <span className="text-[10px] text-slate-400 font-bold font-body">Dark mode, calm music, lock content categories</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={parentConfig.enableBedtimeMode}
                      onChange={(e) =>
                        setParentConfig((p) => ({ ...p, enableBedtimeMode: e.target.checked }))
                      }
                      className="w-5 h-5 rounded-lg accent-rose-500"
                    />
                  </div>

                  {parentConfig.enableBedtimeMode && (
                    <div className="flex gap-2 bg-rose-50/50 p-2 rounded-lg border font-body">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1 font-body">Bedtime Hour (24h)</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={parentConfig.bedtimeStartHour}
                          onChange={(e) =>
                            setParentConfig((p) => ({ ...p, bedtimeStartHour: Number(e.target.value) }))
                          }
                          className="w-full text-xs p-1 bg-white border rounded-lg text-center font-bold font-mono"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1 font-body">Bedtime Minute</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={parentConfig.bedtimeStartMinute}
                          onChange={(e) =>
                            setParentConfig((p) => ({ ...p, bedtimeStartMinute: Number(e.target.value) }))
                          }
                          className="w-full text-xs p-1 bg-white border rounded-lg text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content blocking controls */}
            <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-rose-900 border-b pb-2 flex items-center gap-2 font-heading">
                <ShieldAlert className="text-rose-500" size={18} /> Category Filter Options
              </h3>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block leading-relaxed font-body">
                  Toggle any category to lock/block content from showing up on the child's home screen. Locked categories disappear.
                </span>

                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {staticCategories.map((cat) => {
                    const isBlocked = parentConfig.blockCategoryList.includes(cat);
                    return (
                      <button
                        key={cat}
                        id={`btn-block-toggle-${cat.replace(/\s+/g, "-")}`}
                        onClick={() => handleToggleCategory(cat)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-bold transition-all font-button ${
                          isBlocked
                            ? "bg-rose-50 border-rose-400 text-rose-700 font-extrabold"
                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat}</span>
                        <span>{isBlocked ? "🚫 Locked" : "✅ Safe"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-3 flex gap-2 justify-end font-button">
                <button
                  onClick={() => setIsLocked(true)}
                  className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-lg text-xs transition font-button"
                >
                  🔒 Lock Dashboard
                </button>
                <button
                  onClick={() => {
                    onAddStars(50);
                    onAddCoins(10);
                  }}
                  className="px-4 py-1.5 bg-[#f43f5e] text-white hover:bg-rose-600 font-bold rounded-lg text-xs transition font-button"
                >
                  Gift stars! ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
