/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gamepad2, Trophy, Star, ArrowRight, RefreshCw, Smile, Zap, Sparkles } from "lucide-react";

interface GameZoneProps {
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
  onAddCoins: (count: number) => void;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  emoji: string;
}

export default function GameZone({ onEarnBadge, onAddStars, onAddCoins }: GameZoneProps) {
  const [activeGame, setActiveGame] = useState<"balloon" | "words" | "math">("balloon");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");

  // ====== BALLOON POP GAME STATE ======
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const balloonColors = ["bg-rose-400", "bg-sky-400", "bg-amber-400", "bg-emerald-400", "bg-purple-400", "bg-pink-400"];
  const balloonEmojis = ["🎈", "🎈", "🎈", "⭐", "🍒", "🦖", "🦄", "🦄", "🧸"];

  // ====== WORD BUILDER STATE ======
  const wordPuzzles = [
    { word: "CAT", formula: "C _ T", missing: "A", options: ["E", "A", "O", "I"], hint: "🐱 Says Meow!" },
    { word: "DOG", formula: "D _ G", missing: "O", options: ["A", "U", "O", "E"], hint: "🐶 Loves to chase balls!" },
    { word: "FROG", formula: "F R _ G", missing: "O", options: ["U", "O", "A", "E"], hint: "🐸 Jumps high on green lilypads!" },
    { word: "BEE", formula: "B _ E", missing: "E", options: ["I", "E", "A", "U"], hint: "🐝 Generates sweet golden honey!" },
    { word: "LION", formula: "L _ O N", missing: "I", options: ["E", "I", "U", "O"], hint: "🦁 King of the deep forest savanna!" },
  ];
  const [wordIdx, setWordIdx] = useState(0);

  // ====== MATH EMOTE ADVENTURE ======
  const mathPuzzles = [
    { question: "🍎🍎 + 🍎 = ?", count: 3, emojis: "🍎🍎 + 🍎", options: [2, 3, 4, 5], answer: 3, hint: "Count the shiny red apples!" },
    { question: "🍌🍌🍌 + 🍌🍌 = ?", count: 5, emojis: "🍌🍌🍌 + 🍌🍌", options: [4, 5, 6, 7], answer: 5, hint: "Yummy yellow bananas!" },
    { question: "⭐ + ⭐ = ?", count: 2, emojis: "⭐ + ⭐", options: [1, 2, 3, 4], answer: 2, hint: "Stars shining in the night sky!" },
    { question: "🦖🦖🦖 - 🦖 = ?", count: 2, emojis: "🦖🦖🦖 - 🦖", options: [1, 2, 3, 4], answer: 2, hint: "Two friendly dinos stay!" },
    { question: "🍩🍩 + 🍩🍩 = ?", count: 4, emojis: "🍩🍩 + 🍩🍩", options: [3, 4, 5, 6], answer: 4, hint: "Delicious sweet chocolate donuts!" },
  ];
  const [mathIdx, setMathIdx] = useState(0);

  // Handle Balloon Pop animation loops
  useEffect(() => {
    if (activeGame !== "balloon" || !gameStarted) return;

    let idCounter = 0;
    // Spawn a balloon every seconds
    const spawner = setInterval(() => {
      setBalloons((prev) => [
        ...prev,
        {
          id: idCounter++,
          x: Math.floor(Math.random() * 80) + 10, // x coordinate percentage 10% to 90%
          y: 110, // top position starts at bottom
          color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
          size: Math.floor(Math.random() * 20) + 60, // size 60px to 80px
          speed: Math.random() * 2 + 1.5 + (level * 0.3), // speed floats up
          emoji: balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)],
        },
      ]);
    }, 1200);

    // Speed frame loop and clean up off-mesh balloons
    const ticker = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20)
      );
    }, 45);

    return () => {
      clearInterval(spawner);
      clearInterval(ticker);
    };
  }, [activeGame, gameStarted, level]);

  const popBalloon = (id: number) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    const hitPoints = 10;
    const newScore = score + hitPoints;
    setScore(newScore);

    onAddStars(3);
    onAddCoins(1);

    // Advance Level check
    if (newScore >= level * 100) {
      setLevel((prev) => prev + 1);
      onAddStars(20);
    }
  };

  const handleStartGame = () => {
    setScore(0);
    setLevel(1);
    setBalloons([]);
    setGameStarted(true);
    setWinnerMessage("");
    setWordIdx(0);
    setMathIdx(0);
  };

  const selectWordOption = (opt: string) => {
    const current = wordPuzzles[wordIdx];
    if (opt === current.missing) {
      // Correct Match code
      setScore((prev) => prev + 25);
      onAddStars(10);
      onAddCoins(5);

      if (wordIdx + 1 < wordPuzzles.length) {
        setWordIdx((prev) => prev + 1);
      } else {
        // Complete Word Arena
        onEarnBadge("badge-first-quiz");
        setWinnerMessage("🎉 AMAZING JOB WORD MASTER! You got them all!");
        setGameStarted(false);
      }
    } else {
      // wrong answer shaker
    }
  };

  const selectMathOption = (val: number) => {
    const current = mathPuzzles[mathIdx];
    if (val === current.answer) {
      // Correct!
      setScore((prev) => prev + 20);
      onAddStars(10);
      onAddCoins(4);

      if (mathIdx + 1 < mathPuzzles.length) {
        setMathIdx((prev) => prev + 1);
      } else {
        onEarnBadge("badge-first-quiz");
        setWinnerMessage("☀️ FANTASTIC! You are a Math Super Hero!");
        setGameStarted(false);
      }
    } else {
      // Try again!
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-4 border-amber-200 shadow-xl font-body" id="games-zone">
      {/* Game category switcher banner */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 font-body">
        <div>
          <h2 className="text-3xl font-bold text-amber-800 flex items-center gap-2 font-heading">
            <Trophy className="text-yellow-400 fill-yellow-400" />
            Wonderkids Play & Arcade Zone
          </h2>
          <p className="text-amber-700 font-body">Play, puzzle, count numbers, and learn matching letters!</p>
        </div>

        {/* Categories toggling */}
        <div className="flex bg-amber-100 p-1.5 rounded-xl gap-2 border border-amber-200 font-button">
          <button
            id="tab-game-balloon"
            onClick={() => {
              setActiveGame("balloon");
              setGameStarted(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeGame === "balloon"
                ? "bg-amber-500 text-white shadow-md scale-105"
                : "text-amber-800 hover:bg-amber-200"
            }`}
          >
            🎈 Balloon Pop!
          </button>
          <button
            id="tab-game-words"
            onClick={() => {
              setActiveGame("words");
              setGameStarted(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeGame === "words"
                ? "bg-amber-500 text-white shadow-md scale-105"
                : "text-amber-800 hover:bg-amber-200"
            }`}
          >
            🍎 Word Builder
          </button>
          <button
            id="tab-game-math"
            onClick={() => {
              setActiveGame("math");
              setGameStarted(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeGame === "math"
                ? "bg-amber-500 text-white shadow-md scale-105"
                : "text-amber-800 hover:bg-amber-200"
            }`}
          >
            🧮 Math Challenge
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-body">
        {/* Left column: HUD panel containing stars level and counters */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border-2 border-amber-100 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4 font-body">
              <span className="text-3xl">🏆</span>
              <h3 className="font-bold text-amber-900 text-lg font-heading">Your Game Record</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <span className="text-slate-500 font-bold text-xs uppercase block tracking-wider font-body">Score</span>
                <span className="text-3xl font-black text-amber-600 font-heading">{score} pts</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <span className="text-slate-500 font-bold text-xs uppercase block tracking-wider font-body">Current Level</span>
                <span className="text-3xl font-black text-orange-500 font-heading">Lv. {level}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-bold py-1 font-body">
                <span>Next Rank:</span>
                <span>{level * 100} Pt goal</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-lg overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-350"
                  style={{ width: `${Math.min(100, (score / (level * 100)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center font-body">
            <span className="text-xs font-bold text-slate-400 block mb-2 font-body">Prizes with Games</span>
            <div className="flex justify-center gap-2 font-button">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 font-button">
                <Star size={12} className="text-yellow-500 fill-yellow-500" /> +3 Stars / tap
              </span>
            </div>
          </div>
        </div>

        {/* Right column: The interactive Board game */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border-4 border-yellow-200 shadow-inner h-[400px] relative overflow-hidden flex flex-col items-center justify-center font-body">
          {!gameStarted ? (
            <div className="text-center p-6 space-y-4 w-full max-w-md font-body">
              <div className="inline-block p-4 bg-amber-100 border-2 border-amber-200 rounded-xl text-4xl animate-bounce">
                {activeGame === "balloon" ? "🎈" : activeGame === "words" ? "🔤" : "🧮"}
              </div>
              {winnerMessage ? (
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-amber-600 font-heading">{winnerMessage}</h3>
                  <p className="text-slate-500 text-sm font-bold">You earned extra stars and coins for finishing!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-amber-900 font-heading">
                    {activeGame === "balloon"
                      ? "Balloon Float Pop!"
                      : activeGame === "words"
                      ? "Animal Word Mystery"
                      : "Math Count Adventure"}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {activeGame === "balloon"
                      ? "Pop colorful floating balloons as they rise to the sky!"
                      : activeGame === "words"
                      ? "Fill in correct missing letters of animal names!"
                      : "Look at cute fruits, count them together, and find answers!"}
                  </p>
                </div>
              )}

              <button
                id="btn-play-game"
                onClick={handleStartGame}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg font-button"
              >
                <Gamepad2 size={20} /> Play Game Now!
              </button>
            </div>
          ) : (
            <>
              {/* Active Match Arena */}

              {/* ====== BALLOON POP CONTAINER ====== */}
              {activeGame === "balloon" && (
                <div className="relative w-full h-full bg-gradient-to-b from-sky-200 to-teal-100 overflow-hidden cursor-pointer font-body" id="balloon-canvas">
                  <div className="absolute top-2 left-2 z-10 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-800">
                    Instructions: Tap/Click the floating balloons to pop!
                  </div>
                  <button
                    onClick={() => setGameStarted(false)}
                    className="absolute top-2 right-2 z-10 bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-900 font-button"
                  >
                    Pause Game
                  </button>

                  {balloons.map((b) => (
                    <button
                      key={b.id}
                      id={`balloon-${b.id}`}
                      onClick={() => popBalloon(b.id)}
                      className={`absolute rounded-2xl flex flex-col items-center justify-center font-bold text-xl text-white shadow-md active:scale-90 transition-transform ${b.color}`}
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: `${b.size * 1.2}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <span className="text-2xl">{b.emoji}</span>
                      <div className="w-1.5 h-3 bg-white/30 rounded-lg mt-1.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* ====== WORD BUILDER INTERACTIVE ====== */}
              {activeGame === "words" && (
                <div className="w-full max-w-lg space-y-6 text-center font-body" id="word-game-board">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 font-body">
                    <span>Challenge {wordIdx + 1} of {wordPuzzles.length}</span>
                    <button onClick={() => setGameStarted(false)} className="text-amber-600 hover:underline font-button">
                      Exit Quiz
                    </button>
                  </div>

                  <div className="space-y-1 font-body">
                    <span className="text-lg font-bold text-amber-500 font-body">{wordPuzzles[wordIdx].hint}</span>
                    <h4 className="text-5xl font-black tracking-widest text-[#1e293b] py-4 bg-slate-50 rounded-xl border font-heading">
                      {wordPuzzles[wordIdx].formula}
                    </h4>
                  </div>

                  <div className="grid grid-cols-4 gap-4 px-4 font-button">
                    {wordPuzzles[wordIdx].options.map((option) => (
                      <button
                        key={option}
                        id={`btn-word-opt-${option}`}
                        onClick={() => selectWordOption(option)}
                        className="py-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white font-black text-2xl shadow-md border-b-4 border-orange-600 transition-all hover:scale-105 active:scale-95 text-center active:border-b-0 font-button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ====== MATH DETECTIVE SCREEN ====== */}
              {activeGame === "math" && (
                <div className="w-full max-w-lg space-y-6 text-center font-body" id="math-game-board">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 font-body">
                    <span>Puzzle {mathIdx + 1} of {mathPuzzles.length}</span>
                    <button onClick={() => setGameStarted(false)} className="text-amber-600 hover:underline font-button">
                      Exit Practice
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-bold bg-yellow-100 text-amber-800 px-3 py-1 rounded-lg font-body">
                      {mathPuzzles[mathIdx].hint}
                    </span>
                    <div className="text-5xl font-extrabold text-slate-800 tracking-wider py-4 bg-amber-50 rounded-xl border-2 border-yellow-200 font-heading">
                      {mathPuzzles[mathIdx].emojis}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 px-4 font-button">
                    {mathPuzzles[mathIdx].options.map((option) => (
                      <button
                        key={option}
                        id={`btn-math-opt-${option}`}
                        onClick={() => selectMathOption(option)}
                        className="py-5 rounded-lg bg-amber-400 hover:bg-amber-500 text-white font-black text-2xl shadow-md border-b-4 border-amber-600 active:border-b-0 hover:scale-105 active:scale-95 text-center font-button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
