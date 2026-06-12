/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Tv, Volume2, Gamepad2, Compass, ShieldAlert, Sparkles, Star, Search, Moon, Sun, HelpCircle, AlertCircle, Award } from "lucide-react";
import { Story, AudioBook, CartoonVideo, Poem, AchievementBadge, ParentConfig, DailyChallenge } from "./types";
import { SEED_STORIES, SEED_AUDIO_BOOKS, SEED_CARTOONS, SEED_POEMS, STATIC_BADGES, DAILY_WORDS } from "./data";

// Import modular panels
import StoriesReader from "./components/StoriesReader";
import AudioBookPlayer from "./components/AudioBookPlayer";
import CartoonsStream from "./components/CartoonsStream";
import GameZone from "./components/GameZone";
import PuzzleZone from "./components/PuzzleZone";
import AIStoryGenerator from "./components/AIStoryGenerator";
import DrawingCanvas from "./components/DrawingCanvas";
import ParentDashboard from "./components/ParentDashboard";
import RunningCartoons from "./components/RunningCartoons";
import CartoonWonderland from "./components/CartoonWonderland";
import OnboardingScreen from "./components/OnboardingScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import { kidsSound } from "./utils/kidsSound";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"home" | "stories" | "songs" | "audiobooks" | "cartoons" | "games" | "puzzle" | "paint" | "ai" | "parent">("home");

  // User session state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const u = localStorage.getItem("wonderkids-user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  const [authScreen, setAuthScreen] = useState<"welcome" | "login" | "signup" | "onboarding" | "app">(() => {
    const token = localStorage.getItem("wonderkids-jwt");
    const isGuest = localStorage.getItem("wonderkids-is-guest") === "true";
    const onboarded = localStorage.getItem("wonderkids-onboarded") === "true";
    if (token || isGuest) {
      return onboarded ? "app" : "onboarding";
    }
    return "welcome";
  });

  // Kids First-Time Experience Onboarding State
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("wonderkids-onboarded") === "true";
  });

  // Welcome Audio Greeting State
  const [welcomeSpeechText, setWelcomeSpeechText] = useState("");

  // Play randomized kids welcome narration on load
  useEffect(() => {
    // Read child's name from localStorage if customized, otherwise default to "Junior"
    let savedChildName = "Junior";
    try {
      const savedConfig = localStorage.getItem("wonderkids-parent-config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.childName) savedChildName = parsed.childName;
      }
    } catch (e) {}

    const welcomeMessages = [
      `Welcome back to WonderKids World, ${savedChildName}! I am so happy to see you today! Let's read micro stories, color some pages, or play tag with running cartoons!`,
      `Hi ${savedChildName}! Welcome back! We have exciting new puzzles and cute little animals eager to play with you!`,
      `Oh look, ${savedChildName} is here! Welcome back to your magical world of wonderland! Let's cast some fairy stories or hear audiobooks!`,
      `Yippee! Welcome back, ${savedChildName}, my dear smart explorer! What magical adventure are we going to choose first today?`
    ];

    const chosenGreeting = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setWelcomeSpeechText(chosenGreeting);

    const speakMessage = () => {
      try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(chosenGreeting);
        utterance.pitch = 1.35; // friendly high pitch for children
        utterance.rate = 1.05;  // bright and energetic delivery
        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Autoplay voice greeting speech blocked by browser policy:", err);
      }
    };

    // Attempt to trigger immediately
    speakMessage();

    // Setup an interaction hook to play after user makes first tap/click anywhere
    const onUserFirstInteract = () => {
      speakMessage();
      window.removeEventListener("click", onUserFirstInteract);
      window.removeEventListener("touchstart", onUserFirstInteract);
    };
    window.addEventListener("click", onUserFirstInteract);
    window.addEventListener("touchstart", onUserFirstInteract);

    return () => {
      window.removeEventListener("click", onUserFirstInteract);
      window.removeEventListener("touchstart", onUserFirstInteract);
    };
  }, []);

  // Rewards and progress stats
  const [stars, setStars] = useState(() => {
    const s = localStorage.getItem("wonderkids-stars");
    return s ? Number(s) : 120; // 120 starting bonus stars
  });
  const [coins, setCoins] = useState(() => {
    const c = localStorage.getItem("wonderkids-coins");
    return c ? Number(c) : 15;
  });
  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    const saved = localStorage.getItem("wonderkids-badges");
    return saved ? JSON.parse(saved) : [STATIC_BADGES[0]]; // seed "Star Reader"
  });

  const [customStories, setCustomStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem("wonderkids-custom-stories");
    return saved ? JSON.parse(saved) : [];
  });

  // Daily Challenge index
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);

  // Search
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Bedtime & Parental Lock
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [parentConfig, setParentConfig] = useState<ParentConfig>({
    parentPin: "1234",
    screenTimeLimitMinutes: 45,
    enableBedtimeMode: true,
    bedtimeStartHour: 20,
    bedtimeStartMinute: 30,
    blockCategoryList: [],
    childName: "Junior",
    childAge: 6,
  });

  // Persist State
  useEffect(() => {
    localStorage.setItem("wonderkids-stars", stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem("wonderkids-coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("wonderkids-badges", JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem("wonderkids-custom-stories", JSON.stringify(customStories));
  }, [customStories]);

  // Gamification helpers
  const handleAddStars = (count: number) => {
    setStars((prev) => prev + count);
  };

  const handleOnboardingComplete = (config: {
    favoriteTopics: string[];
    favoriteCharacter: string;
    favoriteCharacterEmoji: string;
    learningGoals: string[];
    customAvatar: string;
  }) => {
    // Determine child name from logged in state
    const cName = currentUser?.childProfile?.nickname || currentUser?.name || "Junior Star";
    
    // Save to parent config
    const nextConfig = {
      ...parentConfig,
      childName: cName,
      favoriteTopics: config.favoriteTopics,
      favoriteCharacter: config.favoriteCharacter,
      favoriteCharacterEmoji: config.favoriteCharacterEmoji,
      customAvatar: config.customAvatar,
      learningGoals: config.learningGoals
    };
    
    setParentConfig(nextConfig);
    localStorage.setItem("wonderkids-parent-config", JSON.stringify(nextConfig));

    // Award bonus stars for completing onboarding
    setStars((prev) => prev + 50);

    // Save selected interests as parent config customized properties if needed
    setIsOnboarded(true);
    localStorage.setItem("wonderkids-onboarded", "true");
    setAuthScreen("app");

    // Sync child nickname and avatar with the server db if authenticated
    const token = localStorage.getItem("wonderkids-jwt");
    if (token && currentUser) {
      fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: cName,
          avatar: config.customAvatar,
          ageGroup: parentConfig.childAge <= 5 ? "3-5" : parentConfig.childAge <= 8 ? "6-8" : "9-12"
        })
      }).catch(e => console.warn("Failed to sync profile update onto backend:", e));
    }
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("wonderkids-refresh-token") || "";
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(e => console.warn("Logout request failed:", e));

    localStorage.removeItem("wonderkids-jwt");
    localStorage.removeItem("wonderkids-refresh-token");
    localStorage.removeItem("wonderkids-is-guest");
    localStorage.removeItem("wonderkids-onboarded");
    localStorage.removeItem("wonderkids-user");

    kidsSound.playGenericPop();
    kidsSound.speakPhrase("See you next time, explorer!");

    setCurrentUser(null);
    setIsOnboarded(false);
    setAuthScreen("welcome");
  };

  const handleAddCoins = (count: number) => {
    setCoins((prev) => prev + count);
  };

  const handleEarnBadge = (badgeId: string) => {
    const alreadyEarned = badges.some((b) => b.id === badgeId);
    if (alreadyEarned) return;

    const originalBadge = STATIC_BADGES.find((b) => b.id === badgeId);
    if (originalBadge) {
      const earned = {
        ...originalBadge,
        dateEarned: new Date().toLocaleDateString(),
      };
      setBadges((prev) => [...prev, earned]);
      handleAddStars(50); // Mega stars for badge achievement!
    }
  };

  const handleStoryCreated = (story: Story) => {
    setCustomStories((prev) => [story, ...prev]);
    setActiveTab("stories"); // Hop right over to reading stories
  };

  const currentChallenge = DAILY_WORDS[challengeIdx] || DAILY_WORDS[0];

  // Smart Search logic
  const matchSearch = (collection: any[], query: string, field: string) => {
    return collection.filter((item) =>
      item[field]?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const matchingStories = matchSearch([...customStories, ...SEED_STORIES], globalSearch, "title").slice(0, 3);
  const matchingBooks = matchSearch(SEED_AUDIO_BOOKS, globalSearch, "title").slice(0, 3);
  const matchingCartoons = matchSearch(SEED_CARTOONS, globalSearch, "title").slice(0, 3);
  const totalMatches = matchingStories.length + matchingBooks.length + matchingCartoons.length;

  if (authScreen === "welcome") {
    return (
      <WelcomeScreen
        onStartSignUp={() => setAuthScreen("signup")}
        onStartLogin={() => setAuthScreen("login")}
        onContinueAsGuest={() => {
          localStorage.setItem("wonderkids-is-guest", "true");
          const onboarded = localStorage.getItem("wonderkids-onboarded") === "true";
          setAuthScreen(onboarded ? "app" : "onboarding");
        }}
      />
    );
  }

  if (authScreen === "login") {
    return (
      <LoginScreen
        onLoginSuccess={(token, user) => {
          localStorage.setItem("wonderkids-jwt", token);
          localStorage.setItem("wonderkids-user", JSON.stringify(user));
          setCurrentUser(user);
          const onboarded = localStorage.getItem("wonderkids-onboarded") === "true";
          setAuthScreen(onboarded ? "app" : "onboarding");
        }}
        onSwitchToSignup={() => setAuthScreen("signup")}
        onGoBack={() => setAuthScreen("welcome")}
      />
    );
  }

  if (authScreen === "signup") {
    return (
      <SignupScreen
        onRegisterSuccess={(token, user) => {
          localStorage.setItem("wonderkids-jwt", token);
          localStorage.setItem("wonderkids-user", JSON.stringify(user));
          setCurrentUser(user);
          setAuthScreen("onboarding");
        }}
        onSwitchToLogin={() => setAuthScreen("login")}
        onGoBack={() => setAuthScreen("welcome")}
      />
    );
  }

  if (authScreen === "onboarding") {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        childName={currentUser?.childProfile?.nickname || currentUser?.name || "Explorer"}
      />
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-all duration-700 pb-16 ${
        bedtimeMode
          ? "bg-slate-900 text-slate-100 selection:bg-purple-800 selection:text-purple-100"
          : "bg-gradient-to-br from-indigo-50 via-sky-50 to-pink-50 text-slate-800"
      }`}
      id="wonderkids-app-frame"
    >
      {/* Decorative starry skies / elements */}
      {bedtimeMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-12 left-1/4 text-purple-400/30 text-2xl animate-stars-slow">★</div>
          <div className="absolute top-1/3 right-1/4 text-indigo-400/20 text-4xl animate-stars-slow">★</div>
          <div className="absolute bottom-1/4 left-1/3 text-purple-400/35 text-xl animate-stars-slow">★</div>
          <div className="absolute top-1/2 right-1/10 text-pink-400/25 text-3xl animate-stars-slow">★</div>
          <div className="absolute top-6 right-16 text-yellow-100/50 text-7xl select-none">🌙</div>
        </div>
      )}

      {/* HEADER HUD BAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-md border-b-4 border-yellow-200" id="main-hud-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer hover:scale-103 transition-transform select-none"
            id="wonderkids-logo-holder"
          >
            <div className="text-4xl animate-bounce">🌈</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-pink-500 to-amber-500 font-heading">
                WonderKids World
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-none font-body">
                "Learn, Listen, Play & Explore"
              </span>
            </div>
          </div>

          {/* Smart Search Controller */}
          <div className="relative w-full md:max-w-xs" id="hud-search-box">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search cartoons, books, songs..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              className="w-full text-xs pl-10 pr-8 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-300 focus:outline-none font-bold bg-white/90 font-body"
            />
            {globalSearch && (
              <button
                onClick={() => {
                  setGlobalSearch("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-2 text-xs font-bold text-slate-400 hover:text-slate-600 font-button"
              >
                ✕
              </button>
            )}

            {/* Float result box */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-slate-800 rounded-xl border bg-white/95 backdrop-blur-md p-3 shadow-xl z-50 text-xs space-y-3 font-body">
                <span className="text-[10px] text-slate-400 font-bold block">
                  Search Results ({totalMatches} found)
                </span>

                {matchingStories.length > 0 && (
                  <div>
                    <span className="font-extrabold text-sky-600 block mb-1">📚 Stories</span>
                    <div className="space-y-1">
                      {matchingStories.map((story) => (
                        <div
                          key={story.id}
                          onClick={() => {
                            setActiveTab("stories");
                            setShowSearchResults(false);
                            setGlobalSearch("");
                          }}
                          className="p-1 px-2 hover:bg-sky-50 rounded-lg cursor-pointer truncate font-medium text-slate-700"
                        >
                          {story.coverUrl} {story.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingBooks.length > 0 && (
                  <div>
                    <span className="font-extrabold text-purple-600 block mb-1">🎧 Audiobook chapters</span>
                    <div className="space-y-1">
                      {matchingBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setActiveTab("audiobooks");
                            setShowSearchResults(false);
                            setGlobalSearch("");
                          }}
                          className="p-1 px-2 hover:bg-purple-50 rounded-lg cursor-pointer truncate font-medium text-slate-700"
                        >
                          {book.coverEmoji} {book.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingCartoons.length > 0 && (
                  <div>
                    <span className="font-extrabold text-amber-600 block mb-1">📺 Curated cartoons</span>
                    <div className="space-y-1">
                      {matchingCartoons.map((cartoon) => (
                        <div
                          key={cartoon.id}
                          onClick={() => {
                            setActiveTab("cartoons");
                            setShowSearchResults(false);
                            setGlobalSearch("");
                          }}
                          className="p-1 px-2 hover:bg-amber-50 rounded-lg cursor-pointer truncate font-medium text-slate-700"
                        >
                          {cartoon.thumbnailEmoji} {cartoon.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalMatches === 0 && (
                  <span className="text-slate-400 italic font-medium block text-center py-2">
                    No children's media matches. Try another word!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* HUD Bubbles for points & mode togglers */}
          <div className="flex gap-2.5 items-center bg-slate-100 p-1.5 rounded-xl border">
            {/* Stars Bubble */}
            <div className="bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm select-none animate-pulse-soft font-body">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>{stars} Stars</span>
            </div>

            {/* Coins Bubble */}
            <div className="bg-yellow-100 text-yellow-800 font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm select-none font-body">
              <span className="text-sm">🪙</span>
              <span>{coins} Coins</span>
            </div>

            {/* Bedtime mode controller */}
            <button
              id="bedtime-mode-btn"
              onClick={() => {
                setBedtimeMode(!bedtimeMode);
                handleAddStars(5);
              }}
              className={`p-2 rounded-lg border transition-all active:scale-95 font-button ${
                bedtimeMode
                  ? "bg-slate-800 border-purple-500 text-yellow-400"
                  : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600"
              }`}
              title={bedtimeMode ? "Switch to Daytime Mode" : "Switch to Sleepy Bedtime Mode"}
            >
              {bedtimeMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* User Profile avatar info with Logout feature */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
              <div 
                className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-lg select-none border-2 border-white shadow-xs"
                title={`${parentConfig.childName || "Explorer"}'s Avatar`}
              >
                {parentConfig.customAvatar || "🦊"}
              </div>
              <div className="hidden lg:block text-left text-[10px] leading-tight font-black text-slate-600">
                <span className="block truncate max-w-[80px]">{parentConfig.childName || "Junior"}</span>
                <span className="text-[8px] text-purple-500 font-extrabold block">
                  {currentUser ? "Parent Member" : "Guest Mode"}
                </span>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                id="btn-hud-logout"
                title="Securely Logout elements & leave Wonderland"
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:scale-105 active:scale-95 transition"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CORE NAVIGATION BAR */}
      <nav className="bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 p-1 shadow-md max-w-7xl mx-auto md:rounded-b-xl" id="nav-tabs">
        <div className="flex justify-start md:justify-center gap-1 font-extrabold text-xs text-white overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap p-1 bg-white/25 rounded-b-lg">
          <button
            id="tab-home"
            onClick={() => setActiveTab("home")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "home" ? "bg-white text-[#4f46e5] shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <Compass size={14} /> Playground Home
          </button>
          <button
            id="tab-stories"
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "stories" ? "bg-white text-sky-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <BookOpen size={14} /> Read Stories
          </button>
          <button
            id="tab-ai"
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "ai" ? "bg-white text-purple-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <Sparkles size={14} /> Story Wizard ✨
          </button>
          <button
            id="tab-audiobooks"
            onClick={() => setActiveTab("audiobooks")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "audiobooks" ? "bg-white text-pink-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <Volume2 size={14} /> Audiobook Lounge
          </button>
          <button
            id="tab-cartoons"
            onClick={() => setActiveTab("cartoons")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "cartoons" ? "bg-white text-sky-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <Tv size={14} /> Cartoons Watch
          </button>
          <button
            id="tab-games"
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "games" ? "bg-white text-amber-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            <Gamepad2 size={14} /> Game Zone
          </button>
          <button
            id="tab-puzzle"
            onClick={() => setActiveTab("puzzle")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "puzzle" ? "bg-white text-indigo-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            🧩 Jigsaw
          </button>
          <button
            id="tab-paint"
            onClick={() => setActiveTab("paint")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "paint" ? "bg-white text-emerald-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            🎨 Coloring Pad
          </button>
          <button
            id="tab-parent"
            onClick={() => setActiveTab("parent")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all font-button ${
              activeTab === "parent" ? "bg-white text-rose-600 shadow-sm transform scale-105" : "hover:bg-white/10"
            }`}
          >
            🛡️ Parents Lock
          </button>
        </div>
      </nav>

      {/* RENDER ACTIVE SCREEN CONTROLLER */}
      <main className="max-w-7xl mx-auto px-4 mt-6 relative z-10 space-y-6">
        {activeTab === "home" && (
          <>
            {/* Mascot Welcome Greeting Bubble */}
            {welcomeSpeechText && (
              <div 
                className={`p-4 rounded-xl border-4 text-xs font-bold shadow-md flex items-center justify-between gap-4 transition-all duration-300 font-body ${
                  bedtimeMode 
                    ? "bg-[#1f1b4a] border-indigo-700 text-indigo-200" 
                    : "bg-white border-amber-300 text-slate-800"
                }`} 
                id="welcome-mascot-speech"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl animate-bounce">🦊</span>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-500 block mb-1 font-heading">📢 Mascot Todd says:</span>
                    <p className="text-sm italic font-extrabold leading-tight font-body">"{welcomeSpeechText}"</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      if (!window.speechSynthesis) return;
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(welcomeSpeechText);
                      utterance.pitch = 1.35;
                      utterance.rate = 1.05;
                      window.speechSynthesis.speak(utterance);
                    } catch (err) {}
                  }}
                  className="shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-white font-extrabold shadow hover:scale-105 transition-all text-xs font-button"
                >
                  <Volume2 size={13} /> Narrate Greeting 🔊
                </button>
              </div>
            )}

            {/* PERSONALIZED KIDS DASHBOARD PANEL */}
            <div 
              className="p-6 rounded-2xl bg-white border-4 border-purple-200 shadow-sm space-y-4"
              id="personalized-exploration-dashboard"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-300 to-pink-300 flex items-center justify-center text-4xl shadow-inner animate-pulse-soft">
                    {parentConfig.customAvatar || "🦊"}
                  </div>
                  <div className="text-left font-body animate-fade-in text-slate-800">
                    <span className="text-[10px] text-purple-600 block uppercase font-black tracking-wider font-heading">Interactive Dashboard</span>
                    <h3 className="text-2xl font-black leading-none">
                      Hello {parentConfig.childName || "Explorer"}! Ready for today's adventure?
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-800 font-extrabold text-[10px] rounded-full border border-yellow-200">
                    Companion: {parentConfig.favoriteCharacterEmoji || "🦊"} {parentConfig.favoriteCharacter || "Todd"}
                  </span>
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 font-extrabold text-[10px] rounded-full border border-sky-200">
                    Topics: {parentConfig.favoriteTopics?.join(", ") || "Magic, Space"}
                  </span>
                </div>
              </div>

              {/* Continue Playing / Learning Carousel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body" id="dashboard-continue-carousel">
                {/* Continue Reading */}
                <div 
                  onClick={() => {
                    kidsSound.playMagicChime();
                    setActiveTab("stories");
                  }}
                  className="p-4 rounded-xl bg-sky-50 hover:bg-sky-100 border-2 border-dashed border-sky-300 cursor-pointer transition-all hover:scale-102 flex items-center gap-3"
                  id="dash-continue-read"
                >
                  <span className="text-3xl">📖</span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-sky-600 block leading-none">Bookmarked Story</span>
                    <span className="font-extrabold text-xs block text-slate-700 mt-1">Continue Reading Fairy Tales</span>
                  </div>
                </div>

                {/* Continue Watching */}
                <div 
                  onClick={() => {
                    kidsSound.playMagicChime();
                    setActiveTab("cartoons");
                  }}
                  className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-300 cursor-pointer transition-all hover:scale-102 flex items-center gap-3"
                  id="dash-continue-watch"
                >
                  <span className="text-3xl">📺</span>
                  <div className="text-left font-body">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block leading-none">On-Demand Cartoons</span>
                    <span className="font-extrabold text-xs block text-slate-700 mt-1">Continue Watching KidSafe Videos</span>
                  </div>
                </div>

                {/* Continue Listening */}
                <div 
                  onClick={() => {
                    kidsSound.playMagicChime();
                    setActiveTab("audiobooks");
                  }}
                  className="p-4 rounded-xl bg-pink-50 hover:bg-pink-100 border-2 border-dashed border-pink-350 cursor-pointer transition-all hover:scale-102 flex items-center gap-3"
                  id="dash-continue-listen"
                >
                  <span className="text-3xl">🎧</span>
                  <div className="text-left font-body">
                    <span className="text-[10px] uppercase font-bold text-pink-500 block leading-none">Lullaby Lounge</span>
                    <span className="font-extrabold text-xs block text-slate-700 mt-1">Continue Listening to Audiobooks</span>
                  </div>
                </div>
              </div>

              {/* Recommended For You Section */}
              <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 mt-4 text-left font-body">
                <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">🌟 Recommended Content for {parentConfig.childName || "you"}</span>
                <p className="text-xs text-emerald-900 mt-1 font-semibold leading-relaxed">
                  Based on your affinity for <strong>{parentConfig.favoriteTopics?.join(" & ") || "learning videos & moral tales"}</strong>, Milo recommends checking out <strong>Story Wizard 🪄</strong> to create a personalized fairy tale containing astronauts and friendly lions!
                </p>
              </div>
            </div>

            {/* BEDTIME MODE BANNER WARNING */}
            {bedtimeMode && (
              <div className="bg-indigo-950 border-2 border-indigo-400 p-5 rounded-xl text-center shadow-lg relative overflow-hidden flex flex-col items-center">
                <span className="text-5xl animate-bounce">😴💤</span>
                <h3 className="text-2xl font-black text-indigo-200 mt-2 font-heading">Sleepy Bedtime Mode Active</h3>
                <p className="text-xs text-indigo-300 max-w-md mt-1 leading-relaxed font-body">
                  We've dimmed the lights, switched on soft lullaby winds, and queued sleepy bedside stories with slow, calming narration! Time to rest your eyes soon.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setActiveTab("audiobooks");
                      handleAddStars(10);
                    }}
                    className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-xs shadow-md font-button"
                  >
                    🧸 Listen Bedtime Story
                  </button>
                </div>
              </div>
            )}

            {/* MAGICAL HERO SECTION */}
            <div
              className={`rounded-xl border-4 relative overflow-hidden p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 justify-between ${
                bedtimeMode
                  ? "bg-gradient-to-br from-[#1e1b4b] to-[#311042] border-indigo-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  : "bg-gradient-to-br from-sky-400 via-sky-300 to-amber-200 border-yellow-200 shadow-xl"
              }`}
              id="hero-banner"
            >
              {/* Flying Clouds in daytime */}
              {!bedtimeMode && (
                <div className="absolute inset-x-0 top-0 overflow-hidden h-32 pointer-events-none select-none">
                  <div className="text-4xl absolute left-8 top-4 opacity-40 animate-clouds-slow">☁️</div>
                  <div className="text-6xl absolute right-16 top-2 opacity-30 animate-clouds-slow">☁️</div>
                  <div className="text-4xl absolute left-1/3 top-8 opacity-25 animate-clouds-slow">☁️</div>
                  <span className="absolute top-2 left-[45%] text-2xl opacity-60 animate-bounce">🎈</span>
                </div>
              )}

              {/* Day/Night visual characters */}
              <div className="space-y-4 max-w-lg relative z-10 text-center md:text-left">
                <div className="inline-block bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-black uppercase text-amber-500 bg-white font-body">
                  {bedtimeMode ? "🌌 Sleepy Wonderkids" : "☀️ Fun Morning Playground"}
                </div>
                <h1
                  className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                    bedtimeMode ? "text-purple-100" : "text-slate-900"
                  }`}
                >
                  Explore a Magical World of Fun!
                </h1>
                <p className={`text-sm font-semibold max-w-md font-body ${bedtimeMode ? "text-purple-300" : "text-sky-800"}`}>
                  Read stories created with AI fairy dust, play balloon games, color a turtle, or sleep peacefully with custom narrated audiobooks.
                </p>

                {/* Hero CTAs */}
                <div className="flex gap-2 justify-center md:justify-start flex-wrap pt-2">
                  <button
                    id="btn-hero-read-stories"
                    onClick={() => setActiveTab("stories")}
                    className="py-3 px-5 rounded-lg bg-[#3b82f6] text-white hover:bg-sky-600 font-button font-black shadow-md border-b-4 border-sky-800 active:border-b-0 transition-transform active:translate-y-1 text-xs"
                  >
                    📖 Read Stories
                  </button>
                  <button
                    id="btn-hero-ai-gen"
                    onClick={() => setActiveTab("ai")}
                    className="py-3 px-5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-button font-black shadow-md border-b-4 border-violet-800 active:border-b-0 transition-transform active:translate-y-1 text-xs"
                  >
                    🪄 Generate Story
                  </button>
                  <button
                    id="btn-hero-audiobooks"
                    onClick={() => setActiveTab("audiobooks")}
                    className="py-3 px-5 rounded-lg bg-[#ec4899] text-white hover:bg-pink-600 font-button font-black shadow-md border-b-4 border-pink-800 active:border-b-0 transition-transform active:translate-y-1 text-xs"
                  >
                    🎧 Listen Books
                  </button>
                  <button
                    id="btn-hero-games"
                    onClick={() => setActiveTab("games")}
                    className="py-3 px-5 rounded-lg bg-[#ea580c] text-white hover:bg-orange-600 font-button font-black shadow-md border-b-4 border-orange-800 active:border-b-0 transition-transform active:translate-y-1 text-xs"
                  >
                    🎮 Play Games
                  </button>
                </div>
              </div>

              {/* Hero mascot visual container */}
              <div className="relative shrink-0 select-none hidden md:block">
                <div className="text-9xl animate-bounce">🦊✨</div>
                <div className="absolute top-1 right-2 text-2xl animate-spin [animation-duration:15s]">⭐</div>
              </div>
            </div>

            {/* DAILY LEARNING AREA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body" id="daily-learning-section">
              {/* Word of the Day */}
              <div className="bg-white p-5 rounded-xl border-4 border-sky-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-sky-100 text-sky-800 font-black px-2.5 py-1 rounded-lg uppercase leading-none block w-max font-body">
                    Word of the Day 🔠
                  </span>
                  <h4 className="text-2xl font-black text-[#1e293b] mt-3 font-heading">{currentChallenge.wordOfTheDay.word}</h4>
                  <p className="text-xs text-slate-500 font-medium italic mt-1 bg-sky-50 rounded-lg p-2 border font-body">
                    Meaning: {currentChallenge.wordOfTheDay.meaning}
                  </p>
                  <p className="text-xs text-slate-700 italic font-bold mt-2 leading-relaxed font-body">
                    "{currentChallenge.wordOfTheDay.sentence}"
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleAddStars(10);
                    setChallengeIdx((prev) => (prev + 1) % DAILY_WORDS.length);
                  }}
                  className="mt-4 text-xs font-bold text-sky-600 flex items-center gap-1 hover:underline font-button"
                >
                  Learn next word →
                </button>
              </div>

              {/* Riddle of the Day */}
              <div className="bg-white p-5 rounded-xl border-4 border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-amber-100 text-amber-800 font-black px-2.5 py-1 rounded-lg uppercase leading-none block w-max font-body">
                    Riddle of the Day 🧠
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-3 leading-relaxed font-body">
                    ❓ "{currentChallenge.riddle.question}"
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 font-body">Hint: {currentChallenge.riddle.hint}</p>

                  {revealAnswer ? (
                    <div className="mt-3 p-2 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-black rounded-lg font-body">
                      🎉 Answer is: "{currentChallenge.riddle.answer}"!
                    </div>
                  ) : (
                    <button
                      id="btn-reveal-riddle-answer"
                      onClick={() => {
                        setRevealAnswer(true);
                        handleAddStars(15);
                      }}
                      className="mt-3 py-1.5 w-full bg-amber-400 hover:bg-amber-500 text-white font-extrabold rounded-lg text-xs transition font-button"
                    >
                      Click to Reveal Answer! 💡
                    </button>
                  )}
                </div>
                {revealAnswer && (
                  <button
                    onClick={() => {
                      setRevealAnswer(false);
                      setChallengeIdx((prev) => (prev + 1) % DAILY_WORDS.length);
                    }}
                    className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline font-button"
                  >
                    Try next riddle →
                  </button>
                )}
              </div>

              {/* Fun Fact */}
              <div className="bg-white p-5 rounded-xl border-4 border-pink-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-pink-100 text-pink-850 font-black px-2.5 py-1 rounded-lg uppercase leading-none block w-max font-body">
                    Awesome Fun Fact 🐝
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-3 leading-relaxed font-body">
                    "{currentChallenge.funFact}"
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs font-bold text-slate-400 border-t pt-2.5 font-body">
                  <span className="text-[10px]">Stars prize unlocked!</span>
                  <span className="text-emerald-500 font-black text-xs font-body">⭐ +25 Clasp</span>
                </div>
              </div>
            </div>

            {/* LIVING CARTOON WONDERLAND */}
            <CartoonWonderland
              onAddStars={handleAddStars}
              bedtimeMode={bedtimeMode}
            />

            {/* INTERACTIVE CARTOON CHASE PLAYGROUND */}
            <RunningCartoons 
              onAddStars={handleAddStars} 
              bedtimeMode={bedtimeMode} 
              childName={parentConfig.childName} 
            />

            {/* BRIGHT CATEGORIES GRID */}
            <div className="space-y-4 font-body" id="categories-grid-section">
              <h3 className="text-2xl font-black text-[#1e293b] font-heading">Choose Your Next Adventure</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-heading">
                <div
                  id="card-feat-stories"
                  onClick={() => setActiveTab("stories")}
                  className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🧚‍♀️</span>
                  <span className="font-extrabold text-sm block">Fairy Tales</span>
                </div>
                <div
                  id="card-feat-ai"
                  onClick={() => setActiveTab("ai")}
                  className="bg-[#e9d5ff] hover:bg-purple-200 text-purple-900 p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🪄</span>
                  <span className="font-extrabold text-sm block">AI Stories</span>
                </div>
                <div
                  id="card-feat-audio"
                  onClick={() => setActiveTab("audiobooks")}
                  className="bg-[#fbcfe8] hover:bg-pink-200 text-pink-900 p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🐢</span>
                  <span className="font-extrabold text-sm block">Bedtime Audio</span>
                </div>
                <div
                  id="card-feat-cartoons"
                  onClick={() => setActiveTab("cartoons")}
                  className="bg-[#fed7aa] hover:bg-orange-200 text-orange-950 p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🦖</span>
                  <span className="font-extrabold text-sm block font-heading">Fun Cartoons</span>
                </div>
                <div
                  id="card-feat-games"
                  onClick={() => setActiveTab("games")}
                  className="bg-[#fef08a] hover:bg-yellow-200 text-amber-950 p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🎮</span>
                  <span className="font-extrabold text-sm block font-heading">Game Arcade</span>
                </div>
                <div
                  id="card-feat-paint"
                  onClick={() => setActiveTab("paint")}
                  className="bg-[#a7f3d0] hover:bg-emerald-200 text-emerald-950 p-4 rounded-xl border-4 border-white shadow-md text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <span className="text-4xl block mb-2">🎨</span>
                  <span className="font-extrabold text-sm block font-heading">Creative Paint</span>
                </div>
              </div>
            </div>

            {/* TRIVIA / POEMS AREA & KARAOKE */}
            <div className="bg-gradient-to-br from-lime-50 to-emerald-50 p-6 rounded-xl border-4 border-emerald-200 shadow-xl" id="poems-area font-body">
              <h3 className="text-2xl font-black text-emerald-800 mb-2 flex items-center gap-1.5 font-heading">
                <span>🎵</span> Kids Poems, Rhymes & Karaoke
              </h3>
              <p className="text-emerald-700 text-xs font-semibold mb-4 font-body">
                Pick a classic kids poem, sing along while our karaoke mode highlights matching lines!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
                {SEED_POEMS.map((poem) => (
                  <div
                    key={poem.id}
                    id={`poem-card-${poem.id}`}
                    className={`p-5 rounded-xl border-4 shadow-sm relative flex flex-col justify-between ${poem.colorBg}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs bg-white/30 backdrop-blur px-2 py-0.5 rounded-lg font-bold font-body">
                          {poem.category}
                        </span>
                        <span className="text-2xl">{poem.emoji}</span>
                      </div>
                      <h4 className="font-extrabold text-md mb-2 font-heading">{poem.title}</h4>
                      <div className="space-y-1 bg-black/5 p-3 rounded-xl border border-black/5 text-xs h-32 overflow-y-auto no-scrollbar font-body select-none">
                        {poem.lyrics.map((line, lidx) => (
                          <p key={lidx} className="font-extrabold opacity-95">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                    <button
                      id={`btn-narrate-poem-${poem.id}`}
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        const synth = window.speechSynthesis;
                        if (synth) {
                          const utterance = new SpeechSynthesisUtterance(poem.lyrics.join(". "));
                          utterance.rate = 1.0;
                          synth.speak(utterance);
                        }
                        handleAddStars(15);
                      }}
                      className="mt-4 w-full py-1.5 text-center bg-white text-slate-900 border font-extrabold rounded-lg text-xs hover:bg-slate-50 font-button"
                    >
                      🔊 Narration sing-along
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* EARNED COIN BADGES LIST */}
            <div className="bg-white p-6 rounded-xl border-4 border-purple-200 shadow-sm" id="badges-showcase">
              <h3 className="text-xl font-black text-purple-900 flex items-center gap-1.5 font-heading">
                <Award className="text-yellow-500 fill-yellow-250 animate-bounce" /> Award Showcase & Badges
              </h3>
              <p className="text-slate-400 text-xs font-bold mb-4 font-body">
                Solve puzzles, paint drawings and complete math games to unlock premium award badges!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-body">
                {STATIC_BADGES.map((b) => {
                  const unlocked = badges.some((eb) => eb.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        unlocked ? `${b.color} scale-103 shadow-md` : "border-slate-100 bg-slate-50/50 opacity-45"
                      }`}
                    >
                      <span className="text-4xl block mb-1">{b.emoji}</span>
                      <span className="text-xs font-black truncate block font-heading">{b.title}</span>
                      <span className="text-[9px] font-bold tracking-tight block text-slate-500 mt-0.5 max-h-8 overflow-hidden font-body">
                        {unlocked ? "🏆 Unlocked!" : "🔒 Locked"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ACTIVE MODULE SUB-SCREENS */}

        {activeTab === "stories" && (
          <StoriesReader
            customStories={customStories}
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
            blockedCategories={parentConfig.blockCategoryList}
          />
        )}

        {activeTab === "ai" && (
          <AIStoryGenerator
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
            onStoryCreated={handleStoryCreated}
          />
        )}

        {activeTab === "audiobooks" && (
          <AudioBookPlayer
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
          />
        )}

        {activeTab === "cartoons" && (
          <CartoonsStream
            onAddStars={handleAddStars}
            blockedCategories={parentConfig.blockCategoryList}
          />
        )}

        {activeTab === "games" && (
          <GameZone
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
            onAddCoins={handleAddCoins}
          />
        )}

        {activeTab === "puzzle" && (
          <PuzzleZone
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
            onAddCoins={handleAddCoins}
          />
        )}

        {activeTab === "paint" && (
          <DrawingCanvas
            onEarnBadge={handleEarnBadge}
            onAddStars={handleAddStars}
          />
        )}

        {activeTab === "parent" && (
          <ParentDashboard
            parentConfig={parentConfig}
            setParentConfig={setParentConfig}
            stars={stars}
            coins={coins}
            badges={badges}
            onAddStars={handleAddStars}
            onAddCoins={handleAddCoins}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-center text-xs font-extrabold text-slate-400 max-w-7xl mx-auto border-t border-slate-100 pt-6">
        <p>© 2026 WonderKids World. Safe child-mode enabled 🛡️</p>
        <span className="text-[10px] text-slate-300 block mt-0.5">
          "Make Learning fun, beautiful & secure for every little explorer."
        </span>
      </footer>
    </div>
  );
}
