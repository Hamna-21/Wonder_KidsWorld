/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Puzzle, Star, Trophy, RefreshCw, Layers, ShieldAlert, Sparkles } from "lucide-react";

interface PuzzleZoneProps {
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
  onAddCoins: (count: number) => void;
}

interface TileItem {
  id: number;
  currentPos: number; // dynamically shuffled position index
  originalPos: number;
  emoji: string;
}

export default function PuzzleZone({ onEarnBadge, onAddStars, onAddCoins }: PuzzleZoneProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [theme, setTheme] = useState<"animals" | "cartoons" | "space" | "ocean" | "fairy">("animals");
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [solved, setSolved] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  // Theme arrays
  const themeEmojis = {
    animals: ["🦁", "🐼", "🐨", "🐸", "🐹", "🦊", "🐯", "🦖", "🐧", "🐒", "🐳", "🦉"],
    cartoons: ["🐭", "🐱", "🐶", "🐻", "🐰", "🦊", "🐷", "🦄", "🌈", "🎈", "🧸", "🍿"],
    space: ["🚀", "🪐", "⭐", "🛸", "👩‍🚀", "☄️", "📡", "🛰️", "👽", "🌙", "🌌", "☀️"],
    ocean: ["🐳", "🐬", "🐙", "🦑", "🐡", "🐠", "🌊", "🦀", "🦈", "🦞", "🐚", "🧜‍♀️"],
    fairy: ["🏰", "🧙‍♂️", "👸", "🧚‍♀️", "🦄", "🐉", "🔮", "🧪", "👑", "✨", "🍎", "🐸"],
  };

  const getGridSize = () => {
    if (difficulty === "easy") return 4;   // 2x2
    if (difficulty === "medium") return 9; // 3x3
    return 12;                             // 3x4
  };

  useEffect(() => {
    generatePuzzle();
  }, [difficulty, theme]);

  // Handle Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerOn) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerOn]);

  const generatePuzzle = () => {
    const size = getGridSize();
    const sourceEmojis = themeEmojis[theme].slice(0, size);

    // Initial grid positions
    const items: TileItem[] = sourceEmojis.map((emoji, index) => ({
      id: index,
      originalPos: index,
      currentPos: index,
      emoji: emoji,
    }));

    // Perform a valid shuffle
    let shuffledIndices = [...Array(size).keys()];
    // Shuffle indices with random odds
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    // Assign shuffled current positions
    const finalTiles = items.map((tile, idx) => ({
      ...tile,
      currentPos: shuffledIndices[idx],
    }));

    setTiles(finalTiles);
    setSolved(false);
    setTimer(0);
    setTimerOn(true);
  };

  // Swap tile positions
  const handleTileClick = (clickedTileId: number) => {
    if (solved) return;

    // In this child-friendly sliding puzzle, we swap any clicked tile with another.
    // If we want sliding mechanics, or simplicity: kids can click TWO tiles sequentially to swap them!
    // Since swapping is extremely fun and manageable for 3-12 age bracket, we implement a Swap helper:
    // Let's find the designated selected tile or do a drag/slide sequence.
    // Let's implement click-to-swap: Kid selects first tile, then targets second tile.
    const activeTileIndex = tiles.findIndex((t) => t.id === clickedTileId);
    if (activeTileIndex === -1) return;

    // Check if there is an existing 'staged' tile to swap with,
    // otherwise let's swap this tile with the space adjacent or implement simple sequential sliding.
    // Even easier: click any tile to advance it to its original location or swap it forward!
    // Let's make it a sliding puzzle or click-swap. Click-Swap is the ultimate fun for children.
    // To implement Click-Swap:
    const currentlySelectedIdx = tiles.findIndex((t) => t.id === selectedTileId);

    if (currentlySelectedIdx !== -1 && currentlySelectedIdx !== activeTileIndex) {
      // Swap their current positions!
      const updatedTiles = [...tiles];
      const tempPos = updatedTiles[currentlySelectedIdx].currentPos;
      updatedTiles[currentlySelectedIdx].currentPos = updatedTiles[activeTileIndex].currentPos;
      updatedTiles[activeTileIndex].currentPos = tempPos;

      setTiles(updatedTiles);
      setSelectedTileId(null);

      // Check if solved
      const isSolved = updatedTiles.every((t) => t.currentPos === t.originalPos);
      if (isSolved) {
        setWinner();
      }
    } else {
      setSelectedTileId(clickedTileId);
    }
  };

  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);

  const setWinner = () => {
    setSolved(true);
    setTimerOn(false);

    // Award rewards based on difficulty
    const rewardMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    onAddStars(10 * rewardMultiplier);
    onAddCoins(3 * rewardMultiplier);
    onEarnBadge("badge-puzzle-master");
  };

  // Helper to render columns based on difficulty
  const getColClass = () => {
    if (difficulty === "easy") return "grid-cols-2 max-w-[240px]";
    if (difficulty === "medium") return "grid-cols-3 max-w-[320px]";
    return "grid-cols-4 max-w-[400px]"; // 12 tiles
  };

  // Sort tiles by currentPos for visual layout
  const sortedTiles = [...tiles].sort((a, b) => a.currentPos - b.currentPos);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-4 border-indigo-200 shadow-xl font-body" id="puzzle-zone">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 font-body">
        <div>
          <h2 className="text-3xl font-bold text-indigo-800 flex items-center gap-2 font-heading">
            <Puzzle className="text-purple-500 fill-purple-200" />
            Jigsaw Sequence Tile Matcher
          </h2>
          <p className="text-indigo-700 font-medium font-body">Click two tiles to swap their places and complete the original picture grid!</p>
        </div>

        {/* Difficulty Selectors */}
        <div className="flex bg-indigo-100 p-1 rounded-lg border font-button">
          {(["easy", "medium", "hard"] as const).map((level) => (
            <button
              key={level}
              id={`btn-diff-${level}`}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                difficulty === level
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-800 hover:bg-indigo-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-body">
        {/* Left Side: theme configuration & Stats */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border-2 border-indigo-100 space-y-4 font-body">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1 font-body">Theme Category</span>
            <div className="grid grid-cols-2 gap-2 font-button">
              {(["animals", "cartoons", "space", "ocean", "fairy"] as const).map((t) => (
                <button
                  key={t}
                  id={`btn-theme-${t}`}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border capitalize transition-all active:scale-95 ${
                    theme === t
                      ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm"
                      : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">
                    {t === "animals" ? "🦁" : t === "cartoons" ? "🦄" : t === "space" ? "🚀" : t === "ocean" ? "🐳" : "👑"}
                  </span>
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3 space-y-2 font-body">
            <div className="flex justify-between font-bold text-slate-600 text-sm font-body">
              <span>⏱️ Adventure Timer:</span>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-600 text-sm font-body">
              <span>🌈 Target Score:</span>
              <span className="text-amber-600 font-heading">{tiles.length * 10} Stars</span>
            </div>
          </div>

          <button
            onClick={generatePuzzle}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-lg border border-indigo-200 transition-all active:scale-95 font-button"
          >
            <RefreshCw size={16} /> Shuffle & Restart
          </button>
        </div>

        {/* Right Side: Visual Board */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border-4 border-purple-200 shadow-inner flex flex-col items-center justify-center min-h-[300px] font-body">
          {solved ? (
            <div className="text-center space-y-4 max-w-sm p-4 font-body">
              <span className="text-6xl animate-bounce block">🏆</span>
              <h3 className="text-2xl font-black text-indigo-900 font-heading">CONGRATULATIONS!</h3>
              <p className="text-slate-500 font-semibold font-body">
                You matched all {tiles.length} tiles in <span className="text-indigo-600">{timer} seconds</span>! Good brain training!
              </p>
              <button
                onClick={generatePuzzle}
                className="py-2.5 px-6 bg-indigo-600 text-white font-extrabold rounded-lg shadow-md hover:bg-indigo-700 transition font-button"
              >
                Play Another Theme
              </button>
            </div>
          ) : (
            <div className="space-y-4 font-body">
              {/* Target Outline (Small guide) */}
              <div className="text-center text-xs font-bold text-slate-400 font-body">
                ⭐ Goal Pattern Sequence:{" "}
                <span className="inline-block bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-normal">
                  {themeEmojis[theme].slice(0, getGridSize()).join(" ➡️ ")}
                </span>
              </div>

              {/* Shuffled active grid */}
              <div className={`grid gap-3 p-4 bg-indigo-50/50 rounded-xl border-2 border-indigo-100 mx-auto ${getGridClass()}`}>
                {sortedTiles.map((tile) => (
                  <button
                    key={tile.id}
                    id={`tile-${tile.id}`}
                    onClick={() => handleTileClick(tile.id)}
                    className={`h-20 w-20 rounded-xl flex items-center justify-center text-4xl shadow-md border-b-4 transition-all duration-150 relative cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                      selectedTileId === tile.id
                        ? "bg-indigo-400 border-indigo-600 animate-pulse text-white scale-105"
                        : tile.currentPos === tile.originalPos
                        ? "bg-white border-green-400 ring-2 ring-green-100"
                        : "bg-white border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    {tile.emoji}

                    {/* Green check inside tile for assistance */}
                    {tile.currentPos === tile.originalPos && (
                      <span className="absolute top-1 right-1 text-xs">✅</span>
                    )}

                    <span className="absolute bottom-1 left-2 text-[10px] text-slate-300 font-bold">
                      {tile.currentPos + 1}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-center text-xs font-bold text-slate-400 font-body">
                {selectedTileId !== null
                  ? "👉 Tap any OTHER tile to swap their locations."
                  : "💡 Tap a piece to highlight, then swap!"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getGridClass() {
    if (difficulty === "easy") return "grid-cols-2";
    if (difficulty === "medium") return "grid-cols-3";
    return "grid-cols-4";
  }
}
