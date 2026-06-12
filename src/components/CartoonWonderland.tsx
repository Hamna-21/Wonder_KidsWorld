import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Volume2, VolumeX, Heart, Star, Award, RotateCcw } from "lucide-react";
import { kidsSound } from "../utils/kidsSound";

interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
  color: string;
}

interface CartoonWonderlandProps {
  onAddStars: (count: number) => void;
  bedtimeMode: boolean;
}

export default function CartoonWonderland({ onAddStars, bedtimeMode }: CartoonWonderlandProps) {
  // Volume & Settings State
  const [vol, setVol] = useState(() => kidsSound.getVolume());
  const [muted, setMuted] = useState(() => kidsSound.getMuted());
  const [giggleText, setGiggleText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  // States for Character Animations/Interactive Reactions
  const [catState, setCatState] = useState<"running" | "jump">("running");
  const [dogAction, setDogAction] = useState(false);
  const [birdAction, setBirdAction] = useState(false);
  const [rocketState, setRocketState] = useState<"idle" | "launch">("idle");
  const [starPower, setStarPower] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [bookOpenState, setBookOpenState] = useState(false);
  const [dragonHappy, setDragonHappy] = useState(false);

  // Synchronize initial sound manager states
  useEffect(() => {
    kidsSound.setVolume(vol);
    kidsSound.setMuted(muted);
  }, [vol, muted]);

  // Spawn visual reward particle bursts
  const spawnExplosionOfJoy = (x: number, y: number, presetType: "stars" | "coins" | "rainbow") => {
    const freshParticles: Particle[] = [];
    const emojis = presetType === "coins" ? ["🪙", "✨", "💫"] : presetType === "rainbow" ? ["🌈", "🌸", "⭐️"] : ["⭐️", "✨", "🌟"];
    
    for (let i = 0; i < 12; i++) {
      freshParticles.push({
        id: `joy-${Math.random()}-${i}`,
        x: x + (Math.random() * 120 - 60),
        y: y + (Math.random() * 120 - 60),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        color: ["text-yellow-400", "text-pink-400", "text-sky-400", "text-emerald-400"][Math.floor(Math.random() * 4)]
      });
    }
    
    setParticles((prev) => [...prev, ...freshParticles]);
    setTimeout(() => {
      // Clean up exploded elements
      setParticles((prev) => prev.filter((p) => !freshParticles.some((f) => f.id === p.id)));
    }, 1500);
  };

  // Helper trigger phrase speech balloon
  const triggerGiggleBubble = (phrase: string, sfxFunc?: () => void) => {
    setGiggleText(phrase);
    if (sfxFunc) sfxFunc();
    kidsSound.speakPhrase(phrase);
    
    // Clear balloon text after timeout
    setTimeout(() => {
      setGiggleText("");
    }, 2500);
  };

  return (
    <div
      className={`rounded-2xl border-4 p-5 shadow-xl transition-all duration-300 relative overflow-hidden font-body ${
        bedtimeMode
          ? "bg-gradient-to-b from-[#1b193f] via-[#2d1b4e] to-[#120a21] border-indigo-500 text-purple-100"
          : "bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 border-sky-300 text-slate-800"
      }`}
      id="magical-interactive-wonderland-playground"
    >
      {/* Dynamic Sound HUD Console for Parents & Kids */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-3 mb-6 border-slate-100 relative z-30">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-pink-500 to-amber-500 flex items-center gap-2 font-heading">
            ✨ Interactive Animated Cartoon World ✨
          </h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body">
            Giggle, tap, and play with characters! Everything responds with animations and magical Web Audio music chimes!
          </p>
        </div>

        {/* Parent-Mute Sound controls of the HTML5 Audio Engine & Speeches */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border shadow-sm font-button shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">🔇 Sound Panel:</span>
          
          <button
            onClick={() => {
              const prev = muted;
              setMuted(!prev);
              kidsSound.setMuted(!prev);
            }}
            className={`p-1.5 rounded-lg border transition active:scale-95 ${
              muted ? "bg-red-100 border-red-300 text-red-600" : "bg-emerald-100 border-emerald-300 text-emerald-600"
            }`}
            title={muted ? "Uncommence Sound" : "Mute Sound Settings"}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Volume Control Slider */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={vol}
              onChange={(e) => {
                const targetVol = parseFloat(e.target.value);
                setVol(targetVol);
                kidsSound.setVolume(targetVol);
                setMuted(false);
              }}
              className="w-16 h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Floating Sparklies/Particles Display from interactions */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, x: p.x, y: p.y, opacity: 1 }}
            animate={{ scale: [1, 2.5, 0], y: p.y - 120, rotate: Math.random() * 360, opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute text-2xl z-40 pointer-events-none select-none font-black"
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Primary Cartoon Characters Main Stage Canvas */}
      <div
        className={`relative w-full h-[400px] border-3 rounded-2xl overflow-hidden select-none mb-4 ${
          bedtimeMode
            ? "bg-[#100c25] border-indigo-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]"
            : "bg-gradient-to-b from-[#bfe8ff] via-[#dcf5ff] to-[#ecfccb] border-sky-200 shadow-inner"
        }`}
        id="wonderland-cartoon-stage"
      >
        {/* Sky/Bedtime ambiance decorations - clouds, sun/moon, planets */}
        {!bedtimeMode ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute top-6 left-12 text-6xl opacity-80"
            >
              ☀️
            </motion.div>
            <motion.div
              animate={{ x: [-20, 100, -20] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-[30%] text-5xl opacity-40 select-none pointer-events-none"
            >
              ☁️
            </motion.div>
            <motion.div
              animate={{ x: [0, -120, 0] }}
              transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-[25%] text-4xl opacity-30 select-none pointer-events-none"
            >
              ☁️
            </motion.div>
          </>
        ) : (
          <>
            <div className="absolute top-6 right-12 text-6xl text-yellow-100 opacity-60">🌙</div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-[15%] text-purple-400 text-xl"
            >
              ★
            </motion.div>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-24 right-[35%] text-indigo-400 text-2xl"
            >
              ★
            </motion.div>
          </>
        )}

        {/* Mascot Speech Bubble System over the entire playground */}
        <AnimatePresence>
          {giggleText && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: -10 }}
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 font-extrabold px-6 py-3 rounded-2xl border-4 border-amber-400 shadow-xl z-50 flex items-center gap-2"
              style={{ x: "-50%" }}
            >
              <span className="text-2xl">🦊🗣️</span>
              <span className="text-sm font-heading">{giggleText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. CAT Jerry & MOUSE Chasing Animation System */}
        <div className="absolute top-[50%] left-0 right-0 h-16 pointer-events-none z-10">
          {/* Animated Cat chasing Mouse */}
          <motion.div
            animate={{ x: ["-10vw", "110vw"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute flex items-end gap-2"
            style={{ bottom: "0" }}
          >
            {/* Jerry Mouse running ahead */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-2xl select-none"
            >
              🐭
            </motion.div>

            {/* Tom Cat following closely */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setCatState("jump");
                onAddStars(10);
                spawnExplosionOfJoy(e.clientX - e.currentTarget.getBoundingClientRect().left, 180, "stars");
                triggerGiggleBubble("Meow! Let's chase that smart cheese! 🐱🧀", () => kidsSound.playMeow());
                setTimeout(() => setCatState("running"), 1400);
              }}
              animate={
                catState === "jump"
                  ? { y: [0, -110, 0], rotate: [0, 360, 0] }
                  : { y: [0, -8, 0] }
              }
              transition={
                catState === "jump"
                  ? { duration: 1.1, ease: "easeOut" }
                  : { duration: 0.4, repeat: Infinity }
              }
              className="text-5xl pointer-events-auto cursor-pointer focus:outline-none hover:scale-115 active:scale-90 select-none filter drop-shadow-md"
              style={{ border: "none", background: "none" }}
            >
              🐈
            </motion.button>
          </motion.div>
        </div>

        {/* 2. RUNNING PUPPIES crossing the bottom of stage */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setDogAction(true);
            onAddStars(10);
            spawnExplosionOfJoy(e.clientX - e.currentTarget.getBoundingClientRect().left, 320, "rainbow");
            triggerGiggleBubble("Woof! Woof! You found my fluffy tail! 🐶🦴", () => kidsSound.playWoof());
            setTimeout(() => setDogAction(false), 2000);
          }}
          animate={{
            x: ["110vw", "-20vw"],
            rotate: dogAction ? [0, -20, 20, -20, 0] : [0, 5, -5, 5, 0]
          }}
          transition={{
            x: { duration: 25, repeat: Infinity, ease: "linear" },
            rotate: dogAction ? { duration: 0.5, repeat: 4 } : { duration: 0.8, repeat: Infinity }
          }}
          className="absolute bottom-1.5 text-5xl hover:scale-120 z-20 cursor-pointer focus:outline-none select-none"
          style={{ background: "none", border: "none" }}
        >
          {dogAction ? "🐕🐾" : "🐶"}
        </motion.button>

        {/* 3. FLYING BIRDS moving in elegant sine waves in the sky */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setBirdAction(true);
            onAddStars(5);
            spawnExplosionOfJoy(e.clientX - e.currentTarget.getBoundingClientRect().left, 80, "stars");
            triggerGiggleBubble("Chirp chirp! High into the cotton skies! 🐦🌱", () => kidsSound.playChirp());
            setTimeout(() => setBirdAction(false), 1500);
          }}
          animate={{
            x: ["-15vw", "115vw"],
            y: [60, 40, 80, 50, 60],
            scaleX: birdAction ? [1, 1.4, 1] : 1,
            rotate: birdAction ? [0, 45, 0] : 0
          }}
          transition={{
            x: { duration: 22, repeat: Infinity, ease: "linear" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            scaleX: { duration: 0.4, repeat: 3 },
            rotate: { duration: 0.5 }
          }}
          className="absolute text-4xl hover:scale-120 z-10 cursor-pointer focus:outline-none select-none"
          style={{ background: "none", border: "none" }}
        >
          🐦
        </motion.button>

        {/* 4. BUTTERFLIES fluttering near spring flowers */}
        <div className="absolute bottom-4 left-[20%] flex items-end gap-3 z-15">
          <span className="text-3xl select-none">🌻</span>
          <motion.button
            onClick={() => {
              kidsSound.playChirp();
              onAddStars(5);
            }}
            animate={{
              x: [0, -15, 10, -5, 0],
              y: [0, -35, -15, -45, 0],
              rotate: [0, 45, -45, 15, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl hover:scale-125 focus:outline-none select-none cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            🦋
          </motion.button>
          <span className="text-3xl select-none">🌷</span>
          <motion.button
            onClick={() => {
              kidsSound.playChirp();
              onAddStars(5);
            }}
            animate={{
              x: [0, 15, -10, 5, 0],
              y: [0, -30, -10, -40, 0],
              rotate: [0, -45, 45, -15, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl hover:scale-125 focus:outline-none select-none cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            🦋
          </motion.button>
        </div>

        {/* 5. SWIM FISH in an aquatic pond box */}
        <div className="absolute right-4 bottom-4 w-36 h-20 rounded-xl bg-gradient-to-tr from-cyan-400 to-sky-300 border-2 border-white/60 shadow-md flex items-center justify-center overflow-hidden z-20">
          {/* Animated swimming fish */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddStars(5);
              triggerGiggleBubble("Bubbles! Glub glub glub! 🐠💦", () => kidsSound.playGenericPop());
            }}
            animate={{
              x: [-40, 40, -40],
              scaleX: [1, -1, 1]
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl cursor-pointer focus:outline-none select-none"
            style={{ background: "none", border: "none" }}
          >
            🐠
          </motion.button>
          <div className="absolute inset-0 pointer-events-none flex justify-around">
            <motion.span animate={{ y: [20, -40], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} className="text-[10px]">🫧</motion.span>
            <motion.span animate={{ y: [30, -30], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} className="text-[8px]">🫧</motion.span>
          </div>
        </div>

        {/* 6. ROCKET launch animations near space base */}
        <div className="absolute top-12 right-12 flex flex-col items-center z-15">
          <motion.button
            id="rocket-play-launcher"
            onClick={(e) => {
              e.stopPropagation();
              if (rocketState === "launch") return;
              setRocketState("launch");
              onAddStars(25);
              spawnExplosionOfJoy(e.clientX - e.currentTarget.getBoundingClientRect().left, 40, "stars");
              triggerGiggleBubble("Whoosh! Rocket launching to the outer galaxies! 🚀⭐", () => kidsSound.playRocketWhoosh());
              
              setTimeout(() => {
                setRocketState("idle");
              }, 4000);
            }}
            animate={
              rocketState === "launch"
                ? { y: [0, -320, 20, 0], rotate: [0, 0, 180, 0], scale: [1, 1.4, 0.4, 1] }
                : { y: [0, -6, 0] }
            }
            transition={
              rocketState === "launch"
                ? { duration: 3.5, ease: "easeInOut" }
                : { duration: 1.5, repeat: Infinity }
            }
            className="text-5xl cursor-pointer focus:outline-none select-none filter drop-shadow-md"
            style={{ background: "none", border: "none" }}
          >
            🚀
          </motion.button>
          <span className="text-[8px] font-black tracking-widest text-[#a855f7] bg-white/60 border rounded px-1 mt-1 block">LAUNCH BASE</span>
        </div>

        {/* 7. DRAG the Dragon hovering to tell stories */}
        <div className="absolute left-6 bottom-16 z-20">
          <motion.button
            onClick={() => {
              setDragonHappy(true);
              onAddStars(15);
              triggerGiggleBubble("Rruuumble! Dragons love fairy bedtime tales! 🐲🔥", () => kidsSound.playDragonFlutter());
              setTimeout(() => setDragonHappy(false), 2000);
            }}
            animate={{
              y: [0, -18, 0],
              scale: dragonHappy ? 1.3 : 1,
              rotate: dragonHappy ? [0, 15, -15, 0] : 0
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.3 }
            }}
            className="text-5xl cursor-pointer focus:outline-none select-none filter drop-shadow hover:scale-115"
            style={{ background: "none", border: "none" }}
          >
            🐲
          </motion.button>
          <span className="text-[8px] bg-red-400 text-white font-bold px-1 rounded block mt-0.5 text-center">Fairy Guard</span>
        </div>

        {/* 8. TWINKLE STAR in the space area */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setStarPower(true);
            onAddStars(15);
            spawnExplosionOfJoy(e.clientX - e.currentTarget.getBoundingClientRect().left, 30, "stars");
            triggerGiggleBubble("Sparkle Magic! A shooting wish approaches! ⭐🪄", () => kidsSound.playMagicChime());
            setTimeout(() => setStarPower(false), 1500);
          }}
          animate={{
            scale: starPower ? [1, 2.2, 1] : [1, 1.25, 1],
            rotate: starPower ? 360 : 0
          }}
          transition={{ duration: starPower ? 1.0 : 2, repeat: starPower ? 0 : Infinity, ease: "easeInOut" }}
          className="absolute top-8 left-1/2 text-4xl cursor-pointer select-none focus:outline-none text-yellow-300 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] z-10"
          style={{ background: "none", border: "none" }}
        >
          🌟
        </motion.button>

        {/* 9. TREASURE CHEST reward system */}
        <div className="absolute left-[45%] bottom-3 z-20 flex flex-col items-center">
          <motion.button
            id="treasure-chest-toy"
            onClick={(e) => {
              e.stopPropagation();
              const prev = chestOpen;
              setChestOpen(!prev);
              onAddStars(20);
              spawnExplosionOfJoy(180, 320, "coins");
              
              if (!prev) {
                triggerGiggleBubble("Wow, shiny golden coins popped out! Hurrah! 🪙🎉", () => kidsSound.playTreasureChest());
              } else {
                kidsSound.playGenericPop();
              }
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="text-5xl cursor-pointer select-none focus:outline-none filter drop-shadow-md"
            style={{ background: "none", border: "none" }}
          >
            {chestOpen ? "🔓🎁" : "🔒📦"}
          </motion.button>
          <span className="text-[9px] bg-amber-400 text-white font-extrabold rounded-lg px-2 shadow">Reward Chest</span>
        </div>

        {/* 10. BOOK flips pages */}
        <div className="absolute right-[33%] bottom-3 z-20 flex flex-col items-center">
          <motion.button
            id="wonderland-book-toy"
            onClick={() => {
              const prev = bookOpenState;
              setBookOpenState(!prev);
              onAddStars(10);
              triggerGiggleBubble(prev ? "Closing the spellbook! 📕" : "The magic spell is opened! Swish! 📖🧚‍♀️", () => kidsSound.playPageFlip());
            }}
            animate={bookOpenState ? { rotateY: 180 } : { rotateY: 0 }}
            whileHover={{ scale: 1.15 }}
            className="text-4xl cursor-pointer select-none focus:outline-none"
            style={{ background: "none", border: "none" }}
          >
            {bookOpenState ? "📖" : "📘"}
          </motion.button>
          <span className="text-[9px] bg-purple-400 text-white font-bold rounded px-1.5 shadow">Flipped Book</span>
        </div>
      </div>

      {/* QUICK LAUGHTER & PHRASES CONTROLLER MODULE */}
      <div className="bg-white/90 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-2 items-center justify-between font-body relative z-20">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">😆</span>
          <span className="text-xs font-black text-slate-500">Mascot Giggles & Sound Phrases:</span>
        </div>

        <div className="flex gap-1.5 flex-wrap font-button">
          {["Oops! 🤭", "Wow! 🤩", "Yay! 🎉", "Awesome! 🌟", "Great Job! 🏆", "Let's Play! 🦊"].map((phrase) => (
            <motion.button
              key={phrase}
              onClick={() => {
                onAddStars(15);
                triggerGiggleBubble(phrase);
              }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="py-1 px-3 bg-gradient-to-r from-amber-200 to-yellow-300 border-b-3 border-yellow-500 active:border-b-0 font-extrabold rounded-lg text-xs text-slate-800 shadow-sm transition-transform cursor-pointer"
            >
              {phrase}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
