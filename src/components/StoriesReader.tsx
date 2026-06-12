/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Search, Filter, Star, Heart, Volume2, Globe, Map, Moon, Award, ArrowLeft, ArrowRight, BookMarked, Settings, Type, Sparkles, Check, Bookmark } from "lucide-react";
import { Story } from "../types";
import { SEED_STORIES } from "../data";
import { kidsSound } from "../utils/kidsSound";

interface StoriesReaderProps {
  customStories: Story[];
  onEarnBadge: (badgeId: string) => void;
  onAddStars: (count: number) => void;
  blockedCategories: string[];
}

export default function StoriesReader({
  customStories,
  onEarnBadge,
  onAddStars,
  blockedCategories,
}: StoriesReaderProps) {
  // Combine seed stories and custom generated session ones
  const allStories = [...customStories, ...SEED_STORIES].filter((s) => !blockedCategories.includes(s.category));

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("All Age Groups");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  // Selection state
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activePage, setActivePage] = useState(0);

  // Persistence States
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("wonderkids-story-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readProgress, setReadProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("wonderkids-story-progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarkedPages, setBookmarkedPages] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("wonderkids-story-bookmarks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Kids Accessibility Settings
  const [isDyslexicMode, setIsDyslexicMode] = useState(() => {
    return localStorage.getItem("wonderkids-dyslexic-mode") === "true";
  });
  const [fontSizeScale, setFontSizeScale] = useState<"normal" | "large" | "extra">(() => {
    return (localStorage.getItem("wonderkids-font-scale") as any) || "normal";
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("wonderkids-high-contrast") === "true";
  });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [spokenCharIndex, setSpokenCharIndex] = useState(-1);

  // Audio elements
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const ageGroups = ["All Age Groups", "3-5 years", "6-8 years", "9-12 years"];
  const categories = [
    "All Categories",
    "Fairy Tales",
    "Adventure Stories",
    "Magic Stories",
    "Animal Stories",
    "Moral Stories",
    "Science Stories",
    "Bedtime Stories",
  ];

  // Save Settings toggles
  useEffect(() => {
    localStorage.setItem("wonderkids-dyslexic-mode", String(isDyslexicMode));
  }, [isDyslexicMode]);

  useEffect(() => {
    localStorage.setItem("wonderkids-font-scale", fontSizeScale);
  }, [fontSizeScale]);

  useEffect(() => {
    localStorage.setItem("wonderkids-high-contrast", String(highContrast));
  }, [highContrast]);

  // Filtering Logic
  const filteredStories = allStories.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = selectedAgeGroup === "All Age Groups" || s.ageGroup === selectedAgeGroup;
    const matchesCat = selectedCategory === "All Categories" || s.category === selectedCategory;
    return matchesSearch && matchesAge && matchesCat;
  });

  const handleSelectStory = (story: Story) => {
    if (audioRef) audioRef.pause();
    window.speechSynthesis.cancel();
    setSpokenCharIndex(-1);

    setActiveStory(story);

    // Continue reading later: resume reading from bookmark if it exists!
    const savedBookmark = bookmarkedPages[story.id];
    if (savedBookmark !== undefined && savedBookmark < story.pages.length) {
      setActivePage(savedBookmark);
      kidsSound.playMagicChime();
      // Speak warm welcome
      try {
        kidsSound.speakPhrase(`Welcome back! Resuming ${story.title} from page ${savedBookmark + 1}`);
      } catch (e) {}
    } else {
      setActivePage(0);
    }

    onEarnBadge("badge-first-story");

    // Initialize progress if empty
    if (!readProgress[story.id]) {
      const nextProgress = { ...readProgress, [story.id]: 1 };
      setReadProgress(nextProgress);
      localStorage.setItem("wonderkids-story-progress", JSON.stringify(nextProgress));
    }
  };

  const handleNextPage = () => {
    if (!activeStory) return;
    stopSpeaker();
    setSpokenCharIndex(-1);

    if (activePage + 1 < activeStory.pages.length) {
      const nextPage = activePage + 1;
      setActivePage(nextPage);

      // Save reading log progress
      const nextProgress = {
        ...readProgress,
        [activeStory.id]: Math.max(readProgress[activeStory.id] || 1, nextPage + 1),
      };
      setReadProgress(nextProgress);
      localStorage.setItem("wonderkids-story-progress", JSON.stringify(nextProgress));

      onAddStars(5);
      kidsSound.playGenericPop();
    } else {
      // Completed Story badge
      onAddStars(20);
      kidsSound.playTreasureChest();
      setActiveStory(null);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const exists = favorites.includes(id);
    let nextFavs: string[];
    if (exists) {
      nextFavs = favorites.filter((item) => item !== id);
    } else {
      nextFavs = [...favorites, id];
      onAddStars(3);
      kidsSound.playMagicChime();
    }
    setFavorites(nextFavs);
    localStorage.setItem("wonderkids-story-favorites", JSON.stringify(nextFavs));
  };

  const toggleBookmark = () => {
    if (!activeStory) return;
    const currentBookmark = bookmarkedPages[activeStory.id];
    let nextBookmarks = { ...bookmarkedPages };

    if (currentBookmark === activePage) {
      // Remove bookmark
      delete nextBookmarks[activeStory.id];
      kidsSound.playGenericPop();
    } else {
      // Save current page bookmark
      nextBookmarks[activeStory.id] = activePage;
      onAddStars(5);
      kidsSound.playMagicChime();
    }

    setBookmarkedPages(nextBookmarks);
    localStorage.setItem("wonderkids-story-bookmarks", JSON.stringify(nextBookmarks));
  };

  const triggerTTS = async (text: string) => {
    if (ttsLoading) return;
    setTtsLoading(true);
    setSpokenCharIndex(-1);

    if (audioRef) audioRef.pause();
    window.speechSynthesis.cancel();

    try {
      // Intelligent browser SpeechSynthesis with word boundaries for visual read-along
      const synth = window.speechSynthesis;
      if (synth) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = isDyslexicMode ? 1.05 : 1.35; // friendly pitch
        utterance.rate = 0.85; // slower for easy highlighting and tracking

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setSpokenCharIndex(event.charIndex);
          }
        };

        utterance.onend = () => {
          setSpokenCharIndex(-1);
          // If auto duration active, go to next page automatically!
          if (isAutoPlay && activeStory) {
            setTimeout(() => {
              handleNextPage();
            }, 2000);
          }
        };

        synth.speak(utterance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTtsLoading(false);
    }
  };

  const stopSpeaker = () => {
    if (audioRef) audioRef.pause();
    window.speechSynthesis.cancel();
    setSpokenCharIndex(-1);
  };

  // Split words and track their starting positions to highlights spoken text
  const renderReadAlongText = (text: string) => {
    if (!text) return null;
    const words = text.split(/\s+/);
    let currentPos = 0;
    const wordsWithPositions = words.map((w) => {
      const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"?]/g, "");
      const start = text.indexOf(w, currentPos);
      const end = start + w.length;
      currentPos = end + 1;
      return { word: w, cleanWord, start, end };
    });

    return (
      <div 
        className={`flex flex-wrap gap-x-2 gap-y-1.5 transition-all duration-300 font-bold select-none ${
          isDyslexicMode ? "tracking-widest leading-[2.1] font-mono text-stone-900" : "leading-relaxed"
        } ${
          fontSizeScale === "extra" ? "text-2xl md:text-3xl" : fontSizeScale === "large" ? "text-xl md:text-2xl" : "text-base md:text-lg"
        } ${
          highContrast ? "text-black font-black" : "text-slate-800"
        }`}
      >
        {wordsWithPositions.map((item, index) => {
          const isHighlighted = spokenCharIndex >= item.start && spokenCharIndex <= item.end;
          return (
            <span
              key={index}
              onClick={() => {
                // Squeak the specific keyword on click/touch
                try {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(item.cleanWord);
                  utterance.pitch = 1.6;
                  utterance.rate = 1.0;
                  window.speechSynthesis.speak(utterance);
                } catch (e) {}
              }}
              className={`cursor-pointer transition-all duration-150 inline-block px-1.5 py-0.5 rounded ${
                isHighlighted
                  ? "bg-yellow-300 text-slate-950 font-black shadow-md ring-4 ring-yellow-200 scale-105"
                  : highContrast
                  ? "hover:bg-slate-300 border-b border-black"
                  : "hover:text-sky-600 hover:bg-sky-50"
              }`}
              title="Tap to hear this word!"
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`p-6 rounded-xl border-4 shadow-xl font-body transition-colors duration-500 ${
      highContrast 
        ? "bg-stone-100 border-black" 
        : activeStory 
        ? "bg-[#faf6eb] border-amber-200" 
        : "bg-gradient-to-br from-sky-50 to-emerald-50 border-sky-200"
    }`} id="story-book-library">
      {activeStory ? (
        /* Illustrated Book Layout */
        <div className={`p-6 rounded-xl border-4 shadow-sm transition-all duration-300 ${
          highContrast ? "bg-white border-black" : "bg-white border-yellow-200"
        }`} id="active-story-reader">
          
          {/* Top action header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <button
              onClick={() => {
                setActiveStory(null);
                stopSpeaker();
              }}
              className="flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-extrabold hover:underline font-button py-2 px-3 hover:bg-sky-50 rounded-lg active:scale-95 transition-transform"
            >
              <ArrowLeft size={16} /> Close Book
            </button>

            {/* Accessibility Settings Drawer on the book itself */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bookmark Toggle */}
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition active:scale-95 border-2 ${
                  bookmarkedPages[activeStory.id] === activePage
                    ? "bg-pink-100 border-pink-400 text-pink-700"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                }`}
                title="Bookmark this page to continue reading later"
              >
                <Bookmark size={14} fill={bookmarkedPages[activeStory.id] === activePage ? "currentColor" : "none"} />
                <span>
                  {bookmarkedPages[activeStory.id] === activePage ? "Bookmarked!" : "Bookmark Page"}
                </span>
              </button>

              {/* Dyslexia mode toggle */}
              <button
                onClick={() => {
                  setIsDyslexicMode(!isDyslexicMode);
                  kidsSound.playGenericPop();
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-black border-2 transition active:scale-95 ${
                  isDyslexicMode
                    ? "bg-amber-100 border-amber-400 text-amber-800"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                }`}
              >
                📖 {isDyslexicMode ? "Dyslexia Font ON" : "Dyslexia Font"}
              </button>

              {/* Font Scale toggle */}
              <button
                onClick={() => {
                  const nextScaleMap: Record<string, "normal" | "large" | "extra"> = {
                    normal: "large",
                    large: "extra",
                    extra: "normal",
                  };
                  setFontSizeScale(nextScaleMap[fontSizeScale]);
                  kidsSound.playGenericPop();
                }}
                className="py-1.5 px-3 rounded-lg text-xs font-black bg-stone-50 border-2 border-stone-200 text-stone-500 hover:bg-stone-100 transition active:scale-95"
              >
                Aa ({fontSizeScale.toUpperCase()})
              </button>

              {/* High Contrast */}
              <button
                onClick={() => {
                  setHighContrast(!highContrast);
                  kidsSound.playGenericPop();
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-black border-2 transition active:scale-95 ${
                  highContrast
                    ? "bg-black border-black text-white"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                }`}
              >
                🌗 Contrast
              </button>
            </div>
          </div>

          <div className="text-center space-y-6">
            <h3 className={`font-black text-slate-800 tracking-tight font-heading ${
              isDyslexicMode ? "tracking-widest font-mono text-stone-900" : ""
            } ${
              fontSizeScale === "extra" ? "text-4xl" : fontSizeScale === "large" ? "text-3xl" : "text-2.5xl"
            }`}>
              {activeStory.title}
            </h3>

            {/* Quick Resume banner if returned */}
            {bookmarkedPages[activeStory.id] !== undefined && (
              <span className="inline-block bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse-soft">
                🔖 Resumed reading from bookmark on Page {activePage + 1}
              </span>
            )}

            {/* Main book spreads */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 rounded-xl border-2 border-dashed mt-4 font-body transition-colors ${
              isDyslexicMode ? "bg-amber-50/70 border-amber-200" : "bg-sky-50/40 border-sky-100"
            }`}>
              {/* Illustration window */}
              <div className="flex items-center justify-center text-8xl h-48 bg-white rounded-xl border border-sky-200 shadow-inner select-none animate-bounce">
                {activeStory.pages[activePage]?.illustration || "🧚‍♂️"}
              </div>

              {/* Interacting Text Content with highlighting */}
              <div className="text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-500 font-body">
                    Page {activePage + 1} of {activeStory.pages.length}
                  </span>
                  
                  {/* Tap prompt */}
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    💡 Click any word to hear it pronounced!
                  </span>
                </div>

                {/* Styled word segments */}
                <div className="p-3 bg-white/70 backdrop-blur rounded-lg border min-h-32">
                  {renderReadAlongText(activeStory.pages[activePage]?.text)}
                </div>

                {/* Page narration bar */}
                <div className="flex gap-4 items-center">
                  <button
                    id={`btn-narrate-page-${activePage}`}
                    onClick={() => triggerTTS(activeStory.pages[activePage].text)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg shadow-md active:scale-95 transition-all text-xs font-button"
                  >
                    <Volume2 size={16} /> 🚀 {ttsLoading ? "Wind of story..." : "Play Story Narration! 🔊"}
                  </button>

                  {/* Auto Scroll / Auto Advance option */}
                  <button
                    onClick={() => {
                      setIsAutoPlay(!isAutoPlay);
                      kidsSound.playGenericPop();
                    }}
                    className={`flex items-center justify-center gap-1 px-4 py-3 rounded-lg text-xs font-black transition border-2 ${
                      isAutoPlay
                        ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <span>{isAutoPlay ? "⏱️ Auto-Play ON" : "⏱️ Auto-Play"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Page navigation controls */}
            <div className="flex justify-between items-center pt-4">
              <button
                disabled={activePage === 0}
                onClick={() => {
                  stopSpeaker();
                  setActivePage((p) => p - 1);
                  kidsSound.playGenericPop();
                }}
                className="py-2.5 px-4 rounded-lg font-bold bg-slate-50 border text-slate-700 disabled:opacity-40 font-button transition active:scale-95"
              >
                Previous Page
              </button>

              <div className="flex gap-1.5 items-center">
                {activeStory.pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      stopSpeaker();
                      setActivePage(i);
                      kidsSound.playGenericPop();
                    }}
                    title={`Go to page ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-200 focus:outline-none ${
                      i === activePage ? "bg-sky-500 w-8" : "bg-slate-200 w-3 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <button
                id="btn-next-story-page"
                onClick={handleNextPage}
                className="py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg transition active:scale-95 shadow-md font-button"
              >
                {activePage + 1 < activeStory.pages.length ? "Next Page 👉" : "Finished reading! 🎉"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Stories Gallery */
        <div className="space-y-6 font-body">
          
          {/* Header titles */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
            <div>
              <h3 className="text-xl font-black text-sky-900 flex items-center gap-1.5 font-heading">
                📚 Magical Kids Library
              </h3>
              <p className="text-slate-500 text-xs font-bold font-body">Explore fairy stories, moral fables, and animal adventures customized for you!</p>
            </div>

            {/* Total count indicator */}
            <div className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-3 py-1 rounded-lg">
              {filteredStories.length} interactive stories available
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-sky-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search magical stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 border-2 border-slate-100 rounded-lg focus:border-sky-300 focus:outline-none font-bold font-body"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap w-full md:w-auto font-body">
              {/* Age select */}
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="text-xs p-2 border-2 border-slate-100 bg-white rounded-lg focus:border-sky-300 focus:outline-none font-bold text-slate-700 font-body"
              >
                {ageGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Category select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs p-2 border-2 border-slate-100 bg-white rounded-lg focus:border-sky-300 focus:outline-none font-bold text-slate-700 font-body"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid list of stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const isFavorite = favorites.includes(story.id);
              const progress = readProgress[story.id] || 0;
              const isComplete = progress >= story.pages.length;
              const hasBookmark = bookmarkedPages[story.id] !== undefined;

              return (
                <div
                  key={story.id}
                  id={`story-card-${story.id}`}
                  onClick={() => handleSelectStory(story)}
                  className="bg-white rounded-xl border-4 hover:border-sky-300 border-yellow-250 hover:scale-103 transition-all duration-200 cursor-pointer shadow-md overflow-hidden relative p-4 flex flex-col justify-between hover:shadow-lg active:scale-98"
                >
                  <div>
                    {/* Header bar and stats */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-sky-50 text-sky-800 font-extrabold px-2.5 py-1 rounded-lg uppercase leading-none font-body">
                          {story.category}
                        </span>
                        {hasBookmark && (
                          <span className="bg-pink-100 text-pink-700 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5" title="You have a bookmarked page here!">
                            <Bookmark size={9} fill="currentColor" /> Page {bookmarkedPages[story.id] + 1}
                          </span>
                        )}
                      </div>
                      
                      <button
                        id={`btn-fav-story-${story.id}`}
                        onClick={(e) => toggleFavorite(story.id, e)}
                        className={`p-1.5 rounded-lg border transition active:scale-95 font-button ${
                          isFavorite ? "bg-rose-50 text-rose-500 border-rose-250" : "bg-slate-50 text-slate-400 hover:text-rose-400"
                        }`}
                      >
                        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Book Graphics & Title */}
                    <div className="flex items-center gap-3">
                      <div className="text-4xl p-2.5 bg-sky-50 rounded-xl border select-none transition-transform hover:scale-110">
                        {story.coverUrl}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-extrabold text-sm text-slate-800 truncate font-heading">{story.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5 font-body">By {story.author}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-bold line-clamp-2 mt-3 leading-relaxed font-body">
                      {story.summary}
                    </p>
                  </div>

                  {/* Actions progress */}
                  <div className="mt-4 border-t pt-3 flex justify-between items-center text-xs font-body">
                    <span className="bg-yellow-50 text-amber-800 font-bold px-2 py-0.5 rounded-lg text-[10px] font-body">
                      👶 {story.ageGroup}
                    </span>

                    {/* Completion tag */}
                    {isComplete ? (
                      <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5 font-body">
                        🏆 Finished!
                      </span>
                    ) : progress > 0 ? (
                      <span className="text-sky-600 font-bold text-[10px] font-body">
                        Page {progress} read
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[10px] font-body">
                        Not started
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Milo's Safe Kid-Friendly Error message */}
            {filteredStories.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-600 font-bold bg-white/70 rounded-xl border-4 border-dashed border-amber-200 font-body flex flex-col items-center justify-center p-6 transition-all duration-300">
                <span className="text-6xl mb-3 animate-bounce">🦊🔍</span>
                <p className="text-lg font-black text-amber-800 font-heading">Oops! Milo is looking for your story.</p>
                <p className="text-xs text-slate-500 font-bold max-w-sm mt-1 leading-relaxed">
                  We couldn't find any books matching those categories. Let's try changing your filters or ask the Story Wizard to cook up a fresh fairy tale!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
