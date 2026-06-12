/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Volume2, Plus, RotateCcw, Award, Smile, VolumeX, HelpCircle, Flame } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface RunningCartoonsProps {
  onAddStars: (count: number) => void;
  bedtimeMode: boolean;
  childName: string;
}

interface CartoonEmoji {
  id: string;
  emoji: string;
  name: string;
  x: number; // percentage coordinate [0 - 100]
  y: number; // percentage coordinate [0 - 100]
  vx: number; // horizontal speed percent per frame
  vy: number; // vertical speed percent per frame
  size: number; // diameter in pixels
  color: string; // Tailwind background gradient / color
  isCaught: boolean;
  catchCount: number;
}

const CARTOON_PRESETS = [
  { emoji: "🐼", name: "Ollie the Panda", color: "from-slate-100 to-slate-200 border-slate-400" },
  { emoji: "🦄", name: "Luna the Unicorn", color: "from-fuchsia-100 to-pink-200 border-pink-400" },
  { emoji: "🦖", name: "Rexy the Dino", color: "from-emerald-100 to-green-200 border-emerald-400" },
  { emoji: "🦁", name: "Leo the Brave Lion", color: "from-amber-100 to-yellow-250 border-amber-400" },
  { emoji: "🦊", name: "Tod the Fire Fox", color: "from-orange-100 to-red-200 border-orange-400" },
  { emoji: "🐝", name: "Buzz the Honeybee", color: "from-yellow-100 to-amber-200 border-yellow-500" },
  { emoji: "🐙", name: "Inky the Octopus", color: "from-pink-100 to-rose-200 border-pink-500" },
  { emoji: "🐒", name: "Milo the Monkey", color: "from-orange-50 to-amber-100 border-yellow-600" },
  { emoji: "🐸", name: "Hopper the Frog", color: "from-green-50 to-emerald-200 border-emerald-500" },
  { emoji: "🐹", name: "Hammy the Hamster", color: "from-orange-100 to-amber-100 border-amber-500" },
  { emoji: "🐥", name: "Piper the Baby Chick", color: "from-yellow-50 to-yellow-150 border-yellow-400" },
];

const OUCH_PHRASES = [
  "Ouuuuch! That tickles my tummy!",
  "Ouchie! You pinched my fluffy tail!",
  "Hey! Stop squeezing my cheeks! Hehehe!",
  "Oh look, you caught me! You're a speedy wizard!",
  "Whoa, dizzy dizzy dizzy! Sparkles are flying!",
  "Got me! Congratulations, little explorer!",
  "Ooouuch! Squeak squeak squeak!",
  "Nooo, don't tickle me! That makes me giggle too much!",
  "Boing! Ouch! Can I have a golden star cookie now?",
  "Bazinga! Hehehe, you got me!",
];

export default function RunningCartoons({ onAddStars, bedtimeMode, childName }: RunningCartoonsProps) {
  const [cartoons, setCartoons] = useState<CartoonEmoji[]>([]);
  const [speedLevel, setSpeedLevel] = useState<"slow" | "playful" | "speedy">("playful");
  const [muteAudio, setMuteAudio] = useState(false);
  const [particleSparks, setParticleSparks] = useState<{ id: string; x: number; y: number; emoji: string }[]>([]);
  const [totalCatches, setTotalCatches] = useState(0);

  // Keep a ref to positions for high performance physics loops
  const cartoonsRef = useRef<CartoonEmoji[]>([]);

  // Scale velocities depending on speed selections
  const getVelocityRange = (level: "slow" | "playful" | "speedy") => {
    switch (level) {
      case "slow":
        return { min: 0.15, max: 0.4 };
      case "speedy":
        return { min: 0.6, max: 1.2 };
      default:
        return { min: 0.3, max: 0.7 };
    }
  };

  // Initialize seed cartoons
  useEffect(() => {
    const vr = getVelocityRange(speedLevel);
    const initialList: CartoonEmoji[] = Array.from({ length: 6 }).map((_, i) => {
      const preset = CARTOON_PRESETS[i % CARTOON_PRESETS.length];
      const speedScaleX = (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min));
      const speedScaleY = (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min));
      return {
        id: `cartoon-${Math.random()}-${i}`,
        emoji: preset.emoji,
        name: preset.name,
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        vx: speedScaleX,
        vy: speedScaleY,
        size: 56, // rounded bubble size in px
        color: preset.color,
        isCaught: false,
        catchCount: 0,
      };
    });
    setCartoons(initialList);
    cartoonsRef.current = initialList;
  }, [speedLevel]);

  // Main high frame rate physics animation loop
  useEffect(() => {
    let animationId: number;

    const updatePhysics = () => {
      cartoonsRef.current = cartoonsRef.current.map((item) => {
        // Handle caught bounce animations
        if (item.isCaught) {
          return item; // freeze momentarily when tickled / caught
        }

        let nextX = item.x + item.vx;
        let nextY = item.y + item.vy;

        let vx = item.vx;
        let vy = item.vy;

        // Bouncing logic with container limits (percentage-based coordinates)
        if (nextX <= 1) {
          nextX = 1;
          vx = Math.abs(vx);
        } else if (nextX >= 92) {
          nextX = 92;
          vx = -Math.abs(vx);
        }

        if (nextY <= 1) {
          nextY = 1;
          vy = Math.abs(vy);
        } else if (nextY >= 82) {
          nextY = 82;
          vy = -Math.abs(vy);
        }

        // Add soft random fluctuations to look organic, like they are chasing or dodging
        if (Math.random() < 0.02) {
          const vr = getVelocityRange(speedLevel);
          const randAngle = Math.random() * Math.PI * 2;
          const currentSpeed = Math.sqrt(vx * vx + vy * vy);
          const targetSp = vr.min + Math.random() * (vr.max - vr.min);
          vx = Math.cos(randAngle) * targetSp;
          vy = Math.sin(randAngle) * targetSp;
        }

        return {
          ...item,
          x: nextX,
          y: nextY,
          vx,
          vy,
        };
      });

      // Simple elastic collision matching between cartoons playing tag
      for (let i = 0; i < cartoonsRef.current.length; i++) {
        for (let j = i + 1; j < cartoonsRef.current.length; j++) {
          const c1 = cartoonsRef.current[i];
          const c2 = cartoonsRef.current[j];
          if (c1.isCaught || c2.isCaught) continue;

          // Approx distance in percentage
          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If circles overlap (approx 8.5% threshold)
          if (distance < 8.5) {
            // Swap velocities to simulate direct physics bounces
            const tempVx = c1.vx;
            const tempVy = c1.vy;
            c1.vx = c2.vx;
            c1.vy = c2.vy;
            c2.vx = tempVx;
            c2.vy = tempVy;

            // Push slightly apart so they don't lock
            c1.x -= (dx / distance) * 0.5;
            c1.y -= (dy / distance) * 0.5;
            c2.x += (dx / distance) * 0.5;
            c2.y += (dy / distance) * 0.5;
          }
        }
      }

      setCartoons([...cartoonsRef.current]);
      animationId = requestAnimationFrame(updatePhysics);
    };

    animationId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationId);
  }, [speedLevel]);

  // Delegated procedural sounds and TTS via unified kidsSound manager
  const playRetroBoingSynth = (isOucch = false) => {
    if (muteAudio) return;
    if (isOucch) {
      kidsSound.playGenericPop();
    } else {
      kidsSound.playMagicChime();
    }
  };

  const speakOuchGreeting = (custText: string) => {
    if (muteAudio) return;
    kidsSound.speakPhrase(custText);
  };

  // Click handler to catch the cartoons running around
  const handleCatchCartoon = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const clickedIdx = cartoonsRef.current.findIndex((m) => m.id === id);
    if (clickedIdx === -1) return;

    const item = cartoonsRef.current[clickedIdx];
    if (item.isCaught) return; // avoid duplicate quick clicks

    // Mark as caught and freeze
    item.isCaught = true;
    item.catchCount += 1;

    // Award rewards
    onAddStars(10);
    setTotalCatches((prev) => prev + 1);

    // Procedural sound synth + Speech Speak squeal in parallel
    playRetroBoingSynth(true);
    
    // Choose a fun funny ouch sentence
    const phrase = OUCH_PHRASES[Math.floor(Math.random() * OUCH_PHRASES.length)];
    speakOuchGreeting(phrase);

    // Visual sparks coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sparkId = `spark-${Math.random()}`;
    setParticleSparks((prev) => [
      ...prev,
      { id: sparkId, x: item.x, y: item.y, emoji: "✨" },
      { id: `${sparkId}-star`, x: item.x + 3, y: item.y - 3, emoji: "🌟" },
      { id: `${sparkId}-giggle`, x: item.x - 4, y: item.y + 4, emoji: "🎨" }
    ]);

    // Remove particles after a short delay
    setTimeout(() => {
      setParticleSparks((prev) => prev.filter((p) => !p.id.startsWith(sparkId)));
    }, 1200);

    // Release after 1.5 seconds so they run again!
    setTimeout(() => {
      const matchPos = cartoonsRef.current.find((m) => m.id === id);
      if (matchPos) {
        matchPos.isCaught = false;
        // Boost velocity momentarily after being tickled!
        const vr = getVelocityRange(speedLevel);
        const randAngle = Math.random() * Math.PI * 2;
        matchPos.vx = Math.cos(randAngle) * (vr.max * 1.2);
        matchPos.vy = Math.sin(randAngle) * (vr.max * 1.2);
      }
      setCartoons([...cartoonsRef.current]);
    }, 1500);

    setCartoons([...cartoonsRef.current]);
  };

  // Spawn cartoon
  const handleAddNewCartoon = () => {
    if (cartoons.length >= 15) {
      speakOuchGreeting("Wow! Our playground is already full of running cartoons!");
      return;
    }
    const vr = getVelocityRange(speedLevel);
    const preset = CARTOON_PRESETS[Math.floor(Math.random() * CARTOON_PRESETS.length)];
    const speedScaleX = (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min));
    const speedScaleY = (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min));
    
    const spawned: CartoonEmoji = {
      id: `cartoon-${Math.random()}-${Date.now()}`,
      emoji: preset.emoji,
      name: preset.name,
      x: 10 + Math.random() * 60,
      y: Math.random() * 50,
      vx: speedScaleX,
      vy: speedScaleY,
      size: 56,
      color: preset.color,
      isCaught: false,
      catchCount: 0,
    };

    cartoonsRef.current = [...cartoonsRef.current, spawned];
    setCartoons(cartoonsRef.current);
    playRetroBoingSynth(false);
  };

  // Reset/Clear playground
  const handleResetPlayground = () => {
    const vr = getVelocityRange(speedLevel);
    const initialList: CartoonEmoji[] = Array.from({ length: 6 }).map((_, i) => {
      const preset = CARTOON_PRESETS[i % CARTOON_PRESETS.length];
      return {
        id: `cartoon-${Math.random()}-${i}`,
        emoji: preset.emoji,
        name: preset.name,
        x: 15 + Math.random() * 65,
        y: 15 + Math.random() * 65,
        vx: (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min)),
        vy: (Math.random() > 0.5 ? 1 : -1) * (vr.min + Math.random() * (vr.max - vr.min)),
        size: 56,
        color: preset.color,
        isCaught: false,
        catchCount: 0,
      };
    });
    cartoonsRef.current = initialList;
    setCartoons(initialList);
    setTotalCatches(0);
    speakOuchGreeting("Playground reset! Ready to chase!");
  };

  return (
    <div
      className={`rounded-xl border-4 p-5 shadow-xl transition-all duration-300 font-body ${
        bedtimeMode
          ? "bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-700 text-slate-100"
          : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 text-slate-800"
      }`}
      id="running-cartoons-playground"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-200">
        <div>
          <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-heading">
            <Flame className="text-orange-400 fill-orange-300 animate-pulse" />
            Catch the Running Cartoons!
          </h3>
          <p className="text-xs font-semibold text-emerald-700 dark:text-slate-300 font-body">
            Our cute mascot friends are running around playing tag! Click or tap on them to hear them shout <span className="underline italic">"Ouuuch!"</span> or giggle!
          </p>
        </div>

        {/* Catch stat & interactive control HUD */}
        <div className="flex gap-2.5 items-center flex-wrap shrink-0 font-body">
          <div className="bg-white/80 dark:bg-slate-800 px-3 py-1 rounded-lg border border-emerald-200 text-xs font-black flex items-center gap-1 text-emerald-900 dark:text-slate-100 font-body">
            🥇 Catches: <span className="text-orange-500 font-black">{totalCatches}</span>
          </div>

          <button
            onClick={() => {
              const nextMute = !muteAudio;
              setMuteAudio(nextMute);
              kidsSound.setMuted(nextMute);
            }}
            className={`p-1.5 rounded-lg border transition active:scale-95 font-button ${
              muteAudio
                ? "bg-rose-100 text-rose-600 border-rose-300"
                : "bg-white text-emerald-600 border-emerald-200"
            }`}
            title={muteAudio ? "Unmute Squeaks" : "Mute Sound Effects"}
          >
            {muteAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* THE MAIN BOUNCING CART PLAY AREA */}
      <div
        className={`relative w-full h-80 rounded-xl overflow-hidden border-2 cursor-crosshair select-none ${
          bedtimeMode
            ? "bg-[#111029] border-indigo-500 shadow-inner"
            : "bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 border-emerald-200 shadow-inner"
        }`}
        id="cartoons-sandbox-stage"
      >
        {/* Floating clouds / backgrounds inside the play zone */}
        {!bedtimeMode ? (
          <>
            <div className="absolute top-4 left-6 text-sky-400/20 text-4xl animate-pulse">☁️</div>
            <div className="absolute bottom-16 right-10 text-emerald-400/25 text-5xl font-bold">☘️</div>
            <div className="absolute top-10 right-20 text-yellow-400/25 text-4xl">☀️</div>
          </>
        ) : (
          <>
            <div className="absolute top-6 left-1/3 text-purple-400/30 text-lg">★</div>
            <div className="absolute top-16 right-1/4 text-indigo-400/20 text-2xl">★</div>
          </>
        )}

        {/* SPARK PARTICLE EFFECTS */}
        {particleSparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute text-xl pointer-events-none z-30 transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              animation: "spark-float 1s ease-out forwards",
            }}
          >
            <div className="animate-bounce font-black text-yellow-500">{spark.emoji}</div>
            <span className="text-[10px] bg-amber-400 text-white font-black px-1 rounded-lg shadow block mt-1 font-body">
              ⭐ +10
            </span>
          </div>
        ))}

        {/* CARTOON BOUNCERS LIST */}
        {cartoons.map((cartoon) => (
          <div
            key={cartoon.id}
            onClick={(e) => handleCatchCartoon(cartoon.id, e)}
            id={`bouncer-${cartoon.id}`}
            className={`absolute rounded-xl border-4 shadow-md flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-90 ${
              cartoon.isCaught
                ? "animate-ping [animation-duration:1.5s]"
                : "hover:scale-105"
            } bg-gradient-to-br ${cartoon.color}`}
            style={{
              left: `${cartoon.x}%`,
              top: `${cartoon.y}%`,
              width: `${cartoon.size}px`,
              height: `${cartoon.size}px`,
              transition: cartoon.isCaught ? "all 0.15s" : "none",
            }}
          >
            <span className="text-3xl filter drop-shadow select-none animate-bounce">
              {cartoon.emoji}
            </span>
            {cartoon.isCaught && (
              <span className="absolute -top-6 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow uppercase border font-body whitespace-nowrap">
                🤕 Ouchie!
              </span>
            )}
          </div>
        ))}

        {cartoons.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold font-body">
            💡 Tap "Spawn Mascot" below to add funny cartoons to chase!
          </div>
        )}
      </div>

      {/* CONTROLS BAR FOR MANAGING THE PLAYGROUND */}
      <div className="mt-4 flex flex-wrap gap-3 items-center justify-between font-body">
        {/* Play pace select button group */}
        <div className="flex gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 font-body">Run Speed:</span>
          <div className="flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border gap-1">
            {(["slow", "playful", "speedy"] as const).map((lvl) => (
              <button
                key={lvl}
                id={`btn-pace-${lvl}`}
                onClick={() => setSpeedLevel(lvl)}
                className={`py-1 px-3.5 text-xs font-extrabold rounded-lg capitalize select-none active:scale-95 transition font-button ${
                  speedLevel === lvl
                    ? "bg-emerald-500 text-white shadow-sm font-black"
                    : "text-slate-600 hover:bg-slate-150"
                }`}
              >
                {lvl === "slow" ? "🐢 Slow" : lvl === "speedy" ? "⚡ Speedy" : "🏃 Playful"}
              </button>
            ))}
          </div>
        </div>

        {/* Spawn and reset buttons */}
        <div className="flex gap-2">
          <button
            id="spawn-cartoon-btn"
            onClick={handleAddNewCartoon}
            className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition active:scale-95 font-button"
          >
            <Plus size={14} /> Spawn Mascot
          </button>
          <button
            id="reset-playground-btn"
            onClick={handleResetPlayground}
            className="flex items-center gap-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-lg text-xs transition active:scale-95 font-button"
          >
            <RotateCcw size={14} /> Reset Field
          </button>
        </div>
      </div>
    </div>
  );
}
