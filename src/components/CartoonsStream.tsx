import React, { useState, useEffect } from "react";
import { Tv, Play, Star, Clock, Check, Heart, ShieldAlert, Sparkles, AlertTriangle, Download, ArrowRight, Activity, RotateCcw } from "lucide-react";
import { CartoonVideo } from "../types";
import { kidsSound } from "../utils/kidsSound";

interface CartoonsStreamProps {
  onAddStars: (count: number) => void;
  blockedCategories: string[];
}

// Full 9 Categories required by user specs
const VIDEO_CATEGORIES = [
  { name: "Story Time", emoji: "📖", desc: "Bedtime stories & fairy tales" },
  { name: "Learning Videos", emoji: "🎓", desc: "Alphabet & science facts" },
  { name: "Nursery Rhymes & Poems", emoji: "🎵", desc: "Preschool sing-along rhymes" },
  { name: "Adventure Cartoons", emoji: "🌴", desc: "Jungle & space trips" },
  { name: "Educational Cartoons", emoji: "🧪", desc: "Cosmos & ocean exploration" },
  { name: "Creative Zone", emoji: "🎨", desc: "Drawing & easy crafting DIYs" },
  { name: "Puzzle & Brain Games", emoji: "🧩", desc: "Memory & shape matching" },
  { name: "Islamic Kids Section", emoji: "🚢", desc: "Prophets stories & dua" },
  { name: "Fun & Entertainment", emoji: "😂", desc: "Funny animals & magic shows" }
];

const LOCAL_BLOCKWORDS = [
  "scary", "horror", "gore", "fight", "dead", "blood", "kill", "murder", "weapon"
];

// Fallback static list in client in case of backend endpoint / network errors
const BACKUP_CARTOONS_CATALOG: CartoonVideo[] = [
  {
    id: "yt-story1",
    title: "Toy Storyteller: The Magic Toy Chest",
    duration: "4:15",
    videoUrl: "https://www.youtube.com/embed/6GgD-C_H99Y",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "2.4M Views",
    category: "Story Time",
    thumbnailEmoji: "🧙‍♂️🧸",
    thumbnailBg: "from-purple-200 to-indigo-300",
    description: "Enjoy a sleepy animated story about a toy lion who wakes up to save a starry bunny from falling clouds.",
    ageGroup: "3-5 years",
    tags: ["bedtime", "fairy", "story", "stories", "kids bedtime stories", "princess"]
  },
  {
    id: "yt-story2",
    title: "The Golden Turtle's Hidden Pearl",
    duration: "6:30",
    videoUrl: "https://www.youtube.com/embed/g78p3p3n0Z0",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "1.1M Views",
    category: "Story Time",
    thumbnailEmoji: "🐢✨",
    thumbnailBg: "from-teal-100 to-emerald-200",
    description: "A wonderful moral tale about a slow-moving but persistent turtle who discovers teamwork is the truest pearl.",
    ageGroup: "6-8 years",
    tags: ["moral", "turtle", "story", "animal", "teamwork", "educational"]
  },
  {
    id: "yt-learn1",
    title: "Phonics Alphabet Sound Adventure ABC",
    duration: "3:05",
    videoUrl: "https://www.youtube.com/embed/HQ-yL9Gg994",
    rating: "⭐⭐⭐⭐⭐ 5.0",
    views: "8.9M Views",
    category: "Learning Videos",
    thumbnailEmoji: "🔡🍎",
    thumbnailBg: "from-yellow-100 to-orange-200",
    description: "Sing along and match letter sounds with dancing monkeys, bouncing apples, and smart dolphins!",
    ageGroup: "3-5 years",
    tags: ["abc", "numbers", "vocabulary", "english", "phonics", "reading"]
  },
  {
    id: "yt-learn2",
    title: "How Do Rockets Fly? Science for Kids",
    duration: "4:50",
    videoUrl: "https://www.youtube.com/embed/lY_7v7zXpX8",
    rating: "⭐⭐⭐⭐⭐ 4.7",
    views: "950k Views",
    category: "Learning Videos",
    thumbnailEmoji: "🚀🛰️",
    thumbnailBg: "from-sky-200 to-indigo-300",
    description: "A friendly dynamic cartoon explaining gravity, fuel, and outer space missions in simple terms for smart kids.",
    ageGroup: "9-12 years",
    tags: ["science", "rocket", "geography", "facts", "experiments", "space"]
  },
  {
    id: "yt-rhyme1",
    title: "Baby Shark Dance and Ocean Friends",
    duration: "2:16",
    videoUrl: "https://www.youtube.com/embed/XqZsoesa55w",
    rating: "⭐⭐⭐⭐⭐ 5.0",
    views: "15B Views",
    category: "Nursery Rhymes & Poems",
    thumbnailEmoji: "🦈🎵",
    thumbnailBg: "from-cyan-100 to-sky-200",
    description: "Get up, wiggle your fins, and sing the super famous nursery chorus along with baby, mommy, and daddy shark!",
    ageGroup: "3-5 years",
    tags: ["nursery", "rhyme", "poem", "baby shark", "counting", "action song"]
  },
  {
    id: "yt-rhyme2",
    title: "The Wheels on the Bus Go Round and Round",
    duration: "3:10",
    videoUrl: "https://www.youtube.com/embed/yWytxF77loY",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "3.2M Views",
    category: "Nursery Rhymes & Poems",
    thumbnailEmoji: "🚌🎶",
    thumbnailBg: "from-yellow-100 to-amber-250",
    description: "Ride through Cartoon Town as the wipers go swish, horns go beep, and children wave from windows!",
    ageGroup: "3-5 years",
    tags: ["bus", "preschool", "wheels on the bus", "animated rhymes", "songs"]
  },
  {
    id: "yt-adv1",
    title: "Detective Dino and the Missing Chocolate Cookie",
    duration: "5:20",
    videoUrl: "https://www.youtube.com/embed/T_shAAL4Z1g",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "520k Views",
    category: "Adventure Cartoons",
    thumbnailEmoji: "🔎🦖",
    thumbnailBg: "from-green-100 to-emerald-250",
    description: "Follow Detective Dino Rex as he looks for crumbs, solves patterns, and unlocks a funny vault of sweets.",
    ageGroup: "6-8 years",
    tags: ["adventure", "detective", "dino", "jungle", "treasure hunt", "pirate"]
  },
  {
    id: "yt-edu1",
    title: "Exploring the Deep Blue Whale Ecosystem",
    duration: "7:10",
    videoUrl: "https://www.youtube.com/embed/gW3nZ7uXQ5g",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "1.4M Views",
    category: "Educational Cartoons",
    thumbnailEmoji: "🐳🌊",
    thumbnailBg: "from-blue-150 to-indigo-300",
    description: "Dive past coral reefs to see how massive whales sing, breathe, and keep the majestic ocean safe and happy.",
    ageGroup: "6-8 years",
    tags: ["ocean", "science", "animals", "nature", "exploration", "history"]
  },
  {
    id: "yt-creative1",
    title: "How to Draw a Magical Castle Step-by-Step",
    duration: "8:05",
    videoUrl: "https://www.youtube.com/embed/7E_Z_t7x5Q0",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "640k Views",
    category: "Creative Zone",
    thumbnailEmoji: "🏰🎨",
    thumbnailBg: "from-pink-100 to-fuchsia-200",
    description: "Grab a crayon! A friendly host guides children to draw towers, colorful flags, and twinkling stars.",
    ageGroup: "6-8 years",
    tags: ["drawing", "coloring", "diy", "crafts", "origami", "art"]
  },
  {
    id: "yt-puzzle1",
    title: "Ultimate Animal Spot the Difference Challenge",
    duration: "5:15",
    videoUrl: "https://www.youtube.com/embed/8y_zYwP-21A",
    rating: "⭐⭐⭐⭐⭐ 4.7",
    views: "210k Views",
    category: "Puzzle & Brain Games",
    thumbnailEmoji: "🧩🧠",
    thumbnailBg: "from-violet-100 to-purple-200",
    description: "Train your quick mind! Spot five small differences in beautiful cartoon scenery of jungle parties and space bases.",
    ageGroup: "9-12 years",
    tags: ["puzzle", "brain", "match", "logic", "games", "challenge"]
  },
  {
    id: "yt-islam1",
    title: "The Story of Prophet Noah and the Beautiful Ark",
    duration: "9:40",
    videoUrl: "https://www.youtube.com/embed/h403vD6hWcI",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "2.8M Views",
    category: "Islamic Kids Section",
    thumbnailEmoji: "🚢🦒",
    thumbnailBg: "from-lime-100 to-green-250",
    description: "Watch a gorgeous animated cartoon illustrating the values of faith, saving animal couples, and the peaceful rainbow rain.",
    ageGroup: "6-8 years",
    tags: ["prophets", "islamic", "quran stories", "noah", "nasheed", "dua"]
  },
  {
    id: "yt-fun1",
    title: "Giggles with Gary the Grumpy Grizzly",
    duration: "2:40",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: "⭐⭐⭐⭐⭐ 4.6",
    views: "1.2M Views",
    category: "Fun & Entertainment",
    thumbnailEmoji: "🐻😂",
    thumbnailBg: "from-rose-100 to-pink-250",
    description: "Gary the bear keeps dropping his sleeping bag in funny ways. A delightfully giggle-inducing family cartoon!",
    ageGroup: "3-5 years",
    tags: ["funny", "cartoons", "animal", "clumsy", "magic show", "talent"]
  },
  {
    id: "yt-rhyme3",
    title: "Preschool Colors & Counting Balloon Pop",
    duration: "4:02",
    videoUrl: "https://www.youtube.com/embed/y8_zYwP-21A",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "4.1M Views",
    category: "Nursery Rhymes & Poems",
    thumbnailEmoji: "🎈🔢",
    thumbnailBg: "from-red-100 to-yellow-105",
    description: "Learn counting and bright watercolor names as cute kittens pop floating rainbow birthday balloons!",
    ageGroup: "3-5 years",
    tags: ["colors", "balloon", "counting", "nursery rhymes for kids", "preschool"]
  },
  {
    id: "yt-learn3",
    title: "Solar System Song: Meet the Planets!",
    duration: "3:45",
    videoUrl: "https://www.youtube.com/embed/F2prtmPEjOc",
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "3.6M Views",
    category: "Learning Videos",
    thumbnailEmoji: "🪐☄️",
    thumbnailBg: "from-indigo-200 to-purple-300",
    description: "Sing with Mercury, shiny Venus, green Earth, and red Mars to remember all the planets in our solar system!",
    ageGroup: "6-8 years",
    tags: ["space", "learning", "planets", "science for kids", "geography"]
  },
  {
    id: "yt-adv2",
    title: "Space Rangers: Mystery of the Lost Space Cookie",
    duration: "5:12",
    videoUrl: "https://www.youtube.com/embed/T_shAAL4Z1g",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "890k Views",
    category: "Adventure Cartoons",
    thumbnailEmoji: "🛸💫",
    thumbnailBg: "from-sky-300 to-amber-200",
    description: "Two smart kids ride a shiny rocket to find who ate the glowing raspberry moon biscuit!",
    ageGroup: "9-12 years",
    tags: ["adventure", "space adventures", "space cartoon for kids", "detective"]
  },
  {
    id: "yt-creative2",
    title: "Origami Paper Birds and Butterflies",
    duration: "6:20",
    videoUrl: "https://www.youtube.com/embed/tP-2lRzQWeg",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "720k Views",
    category: "Creative Zone",
    thumbnailEmoji: "🐦🦋",
    thumbnailBg: "from-teal-100 to-yellow-101",
    description: "Learn how to fold simple colored paper into beautiful flapping birds and fluttering butterflies. Perfect for beginners!",
    ageGroup: "9-12 years",
    tags: ["crafts", "origami", "diy", "art for kids", "creative zone"]
  }
];

export default function CartoonsStream({ onAddStars, blockedCategories }: CartoonsStreamProps) {
  // Master lists
  const [videos, setVideos] = useState<CartoonVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<CartoonVideo | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Story Time");
  const [activeAgeGroup, setActiveAgeGroup] = useState<"3-5 years" | "6-8 years" | "9-12 years">("6-8 years");
  const [safetyAlarm, setSafetyAlarm] = useState(false);

  // Interactive Saved Playlists
  const [favorites, setFavorites] = useState<CartoonVideo[]>(() => {
    const saved = localStorage.getItem("wonderkids-video-favs");
    return saved ? JSON.parse(saved) : [];
  });

  const [watchLater, setWatchLater] = useState<CartoonVideo[]>(() => {
    const saved = localStorage.getItem("wonderkids-video-later");
    return saved ? JSON.parse(saved) : [];
  });

  const [offlineVideos, setOfflineVideos] = useState<CartoonVideo[]>(() => {
    const saved = localStorage.getItem("wonderkids-video-offline");
    return saved ? JSON.parse(saved) : [];
  });

  const [continueWatching, setContinueWatching] = useState<CartoonVideo[]>(() => {
    const saved = localStorage.getItem("wonderkids-video-continue");
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<CartoonVideo[]>(() => {
    const saved = localStorage.getItem("wonderkids-video-recent");
    return saved ? JSON.parse(saved) : [];
  });

  // AI Recommendation Engine States
  const [aiSpeech, setAiSpeech] = useState("");
  const [aiRecList, setAiRecList] = useState<CartoonVideo[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active view tab inside the theater
  const [deckTab, setDeckTab] = useState<"all" | "favorites" | "later" | "offline" | "continue">("all");

  // Fetch videos dynamically from backend search API
  const fetchVideos = async (cat: string, age: string, query: string) => {
    setLoading(true);
    setSafetyAlarm(false);

    // Client-side sanitity check before querying back
    const queryNorm = query.toLowerCase();
    const hasBadWord = LOCAL_BLOCKWORDS.some((w) => queryNorm.includes(w));
    if (hasBadWord) {
      setSafetyAlarm(true);
      setLoading(false);
      kidsSound.speakPhrase("Oops, that word was blocked by our child safety shield! Let's choose a friendly search term!");
      return;
    }

    let loadedVideos: CartoonVideo[] = [];
    let fetchSuccess = false;

    try {
      const url = `/api/videos/search?category=${encodeURIComponent(cat)}&ageGroup=${encodeURIComponent(age)}&query=${encodeURIComponent(query)}`;
      console.log(`[Client Video Flow] Launching API request: ${url} (Category: "${cat}", AgeGroup: "${age}", Query: "${query}")`);
      
      const res = await fetch(url);
      console.log(`[Client Video Flow] Received backend response status: ${res.status} ${res.statusText}`);
      
      if (res.ok) {
        loadedVideos = await res.json() as CartoonVideo[];
        fetchSuccess = true;
        console.log(`[Client Video Flow] Successfully retrieved ${loadedVideos.length} videos from the server.`);
        if (loadedVideos.length === 0) {
          console.warn("[Client Video Flow] Server returned an empty list of videos. This could indicate active child filters removed all results, or the YouTube API returned empty items.");
        }
      } else {
        const errorText = await res.text();
        console.error(`[Client Video Flow] Server query failed with error: ${res.status}. Payload:`, errorText);
      }
    } catch (e) {
      console.error("[Client Video Flow] Exception caught during video fetch sequence:", e);
    }

    // Apply local client fallback if the API fetch failed or returned empty catalog
    if (!fetchSuccess || loadedVideos.length === 0) {
      console.log(`[Client Video Flow] Applying local client-side catalog backup offline list. (FetchSuccess: ${fetchSuccess}, Recieved Count: ${loadedVideos.length})`);
      let filtered = BACKUP_CARTOONS_CATALOG;

      if (cat) {
        filtered = filtered.filter(
          (v) => v.category.toLowerCase() === cat.toLowerCase()
        );
      }

      if (age) {
        const ageFiltered = filtered.filter(
          (v) => v.ageGroup.toLowerCase() === age.toLowerCase()
        );
        // RELAXED AGE FALLBACK: keep category videos of any age if exact match is empty
        if (ageFiltered.length > 0) {
          filtered = ageFiltered;
        } else {
          console.log(`[Client Video Flow] No exact age matches for "${age}" under "${cat}". Sharing other ages to prevent empty screen.`);
        }
      }

      if (query) {
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(queryNorm) ||
            v.description.toLowerCase().includes(queryNorm) ||
            v.tags?.some((tag) => tag.toLowerCase().includes(queryNorm))
        );
      }

      loadedVideos = filtered;
    }

    // Filter those blocked by parent settings
    const allowed = loadedVideos.filter((v) => !blockedCategories.includes(v.category));
    setVideos(allowed);

    // Sync active video selection
    if (allowed.length > 0) {
      const stillActive = allowed.some((v) => v.id === activeVideo?.id);
      if (!stillActive || !activeVideo) {
        setActiveVideo(allowed[0]);
      }
    } else {
      setActiveVideo(null);
    }

    setLoading(false);
  };

  // Trigger loading catalog on filters update
  useEffect(() => {
    fetchVideos(activeCategory, activeAgeGroup, searchQuery);
  }, [activeCategory, activeAgeGroup, searchQuery, blockedCategories]);

  // Persist State loops
  useEffect(() => {
    localStorage.setItem("wonderkids-video-favs", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("wonderkids-video-later", JSON.stringify(watchLater));
  }, [watchLater]);

  useEffect(() => {
    localStorage.setItem("wonderkids-video-offline", JSON.stringify(offlineVideos));
  }, [offlineVideos]);

  useEffect(() => {
    localStorage.setItem("wonderkids-video-continue", JSON.stringify(continueWatching));
  }, [continueWatching]);

  useEffect(() => {
    localStorage.setItem("wonderkids-video-recent", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Handle active video clicks and save context to track progress/continue watching
  const handlePlayVideo = (video: CartoonVideo) => {
    setActiveVideo(video);
    kidsSound.playGenericPop();
    onAddStars(5);

    // Save/Update Continue Watching
    setContinueWatching((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      return [video, ...filtered].slice(0, 5); // keep last 5
    });

    // Save to Recent
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      return [video, ...filtered].slice(0, 10);
    });
  };

  // Toggle favorite helper
  const toggleFavorite = (video: CartoonVideo) => {
    kidsSound.playMagicChime();
    setFavorites((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      if (exists) {
        return prev.filter((v) => v.id !== video.id);
      } else {
        onAddStars(10);
        return [...prev, video];
      }
    });
  };

  // Toggle Watch Later helper
  const toggleWatchLater = (video: CartoonVideo) => {
    kidsSound.playGenericPop();
    setWatchLater((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      if (exists) {
        return prev.filter((v) => v.id !== video.id);
      } else {
        return [...prev, video];
      }
    });
  };

  // Simulated Save Offline Support
  const [offlinePendingId, setOfflinePendingId] = useState<string | null>(null);
  const handleSaveOffline = (video: CartoonVideo) => {
    if (offlineVideos.some((v) => v.id === video.id)) {
      kidsSound.speakPhrase("Video already cached offline!");
      return;
    }

    setOfflinePendingId(video.id);
    kidsSound.playPageFlip();
    
    // Simulate high speed buffering
    setTimeout(() => {
      setOfflineVideos((prev) => [...prev, { ...video, isSavedOffline: true }]);
      setOfflinePendingId(null);
      onAddStars(15);
      kidsSound.playTreasureChest();
      kidsSound.speakPhrase("Awesome! Video saved successfully to offline memory!");
    }, 1800);
  };

  // Get AI recommendations from Gemini endpoint
  const handleGetAiRecommendations = async () => {
    setIsAiLoading(true);
    setAiSpeech("");
    setAiRecList([]);
    kidsSound.playMagicChime();

    try {
      let savedChildName = "Junior";
      try {
        const savedConfig = localStorage.getItem("wonderkids-parent-config");
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          if (parsed.childName) savedChildName = parsed.childName;
        }
      } catch (ex) {}

      const response = await fetch("/api/videos/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: activeAgeGroup,
          favoriteCategory: activeCategory,
          childName: savedChildName
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiSpeech(result.coachSpeech || "I found some marvelous clips for you!");
        setAiRecList(result.recommendedVideos || []);
        kidsSound.speakPhrase(result.coachSpeech);
      } else {
        setAiSpeech("Mascot Todd's advice ballon sailed too high into the cloud branches. Let's try again in a moment!");
      }
    } catch (e) {
      console.error("AI recommendations fetching issue:", e);
      setAiSpeech("Oops! It looks like our AI spelling book fell into the pool. Let's shake it clean and retry!");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Determine current active cards list to present
  const getDisplayCatalog = () => {
    switch (deckTab) {
      case "favorites":
        return favorites;
      case "later":
        return watchLater;
      case "offline":
        return offlineVideos;
      case "continue":
        return continueWatching;
      default:
        return videos;
    }
  };

  const displayList = getDisplayCatalog();

  return (
    <div
      className="bg-gradient-to-br from-[#eff6ff] via-sky-50 to-[#ecfccb] p-5 rounded-2xl border-4 border-sky-300 shadow-xl font-body"
      id="kids-theatre-root"
    >
      {/* Title HUD Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-sky-100 pb-4 mb-5">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a8a] flex items-center gap-2 font-heading">
            <Tv className="text-sky-500 fill-sky-200 animate-pulse" />
            WonderKids Safe Video Station
          </h2>
          <p className="text-[#3b82f6] text-xs font-bold font-body">
            Watch fully curated, kid-appropriate video categories inside a beautiful sandbox player.
          </p>
        </div>

        {/* Dynamic Toddler/Junior/Genius age categorization */}
        <div className="flex bg-white p-1 rounded-xl border-2 border-sky-200 font-button">
          {(["3-5 years", "6-8 years", "9-12 years"] as const).map((age) => (
            <button
              key={age}
              onClick={() => {
                setActiveAgeGroup(age);
                kidsSound.playGenericPop();
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeAgeGroup === age
                  ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow"
                  : "text-slate-500 hover:text-sky-600"
              }`}
            >
              {age === "3-5 years" ? "🧸 3-5 (Toddler)" : age === "6-8 years" ? "🚀 6-8 (Junior)" : "🎓 9-12 (Genius)"}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Alert Screen for Censored word searches */}
      {safetyAlarm && (
        <div className="bg-amber-50 border-4 border-amber-400 p-4 rounded-xl flex items-center gap-3 mb-5 border-dashed animate-bounce">
          <ShieldAlert className="text-amber-500 shrink-0" size={32} />
          <div>
            <h4 className="text-sm font-black text-amber-900 font-heading">Safety Shield Engaged! 🛡️</h4>
            <p className="text-xs text-amber-700 font-bold font-body">
              Oh! That search query had words not safe for our little angels! We've automatically safely swept the screen. Try search 'dinosaur ABC song', 'bedtime tales' or 'diy paper crafts'!
            </p>
          </div>
        </div>
      )}

      {/* Primary Video Deck Player Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT / CENTER: Safe Player screen and Video Meta Details */}
        <div className="lg:col-span-2 space-y-4">
          {activeVideo ? (
            <div className="bg-white rounded-2xl border-4 border-yellow-300 overflow-hidden shadow-md">
              <div className="aspect-video w-full bg-slate-950 relative">
                {/* Embedded Safe YouTube sandbox iframe */}
                <iframe
                  id="sandbox-youtube-player-frame"
                  title={activeVideo.title}
                  src={activeVideo.videoUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Underlying Details, Custom Offline Buttons and stats */}
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-black px-2.5 py-1 rounded-lg uppercase">
                    📁 {activeVideo.category}
                  </span>
                  
                  <span className="text-xs text-amber-500 font-black">
                     Recommended Age: {activeVideo.ageGroup}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-[#1e293b] leading-tight font-heading">
                      {activeVideo.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 block">
                      {activeVideo.description}
                    </p>
                  </div>

                  {/* Operational Interaction Options */}
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {/* Add to Favorites */}
                    <button
                      id="stream-fav-toggle"
                      onClick={() => toggleFavorite(activeVideo)}
                      className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                        favorites.some((v) => v.id === activeVideo.id)
                          ? "bg-rose-100 text-rose-650 border-rose-300"
                          : "bg-white text-slate-400 border-slate-200 hover:text-rose-400"
                      }`}
                      title="Toggle Favorite status"
                    >
                      <Heart size={18} fill={favorites.some((v) => v.id === activeVideo.id) ? "currentColor" : "none"} />
                    </button>

                    {/* Add to Watch Later */}
                    <button
                      id="stream-later-toggle"
                      onClick={() => toggleWatchLater(activeVideo)}
                      className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer text-xs font-bold ${
                        watchLater.some((v) => v.id === activeVideo.id)
                          ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                      title="Save to Watch Later"
                    >
                      <Clock size={16} className="inline mr-1" />
                      {watchLater.some((v) => v.id === activeVideo.id) ? "In Later ✅" : "Watch Later"}
                    </button>

                    {/* Offline Save support */}
                    <button
                      id="stream-offline-cache-btn"
                      disabled={offlinePendingId === activeVideo.id}
                      onClick={() => handleSaveOffline(activeVideo)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        offlineVideos.some((v) => v.id === activeVideo.id)
                          ? "bg-emerald-100 border-emerald-300 text-emerald-800 cursor-not-allowed"
                          : "bg-amber-400 hover:bg-amber-500 border-amber-600 text-white shadow-sm"
                      }`}
                    >
                      <Download size={14} />
                      {offlinePendingId === activeVideo.id ? (
                        <div className="flex items-center gap-1">
                          <span className="animate-spin text-white">🔄</span> Loading...
                        </div>
                      ) : offlineVideos.some((v) => v.id === activeVideo.id) ? (
                        "Saved Offline 💾"
                      ) : (
                        "Save Offline"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 p-20 rounded-2xl border-4 border-sky-100 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-7xl animate-bounce">🍿🦖</span>
              <h3 className="text-lg font-black text-slate-700 font-heading">Safe Child Theatre Player</h3>
              <p className="text-slate-400 text-xs max-w-sm">
                Get ready for a magical viewing! Click on any video card in the list to trigger the play screen.
              </p>
            </div>
          )}

          {/* DYNAMIC AI RECOMMENDATIONS PANEL */}
          <div className="bg-gradient-to-r from-violet-100 via-purple-50 to-fuchsia-50 rounded-2xl border-4 border-purple-200 p-4 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-15 select-none pointer-events-none">🦊✨</div>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="text-4xl">🦊</div>
              <div className="space-y-1.5">
                <span className="text-[10px] bg-purple-200 text-purple-900 font-black px-2 py-0.5 rounded-lg font-heading">
                  🤖 TALKING MASCOT RECOM-ENGINE
                </span>
                <h4 className="text-sm font-black text-purple-900 font-heading">Ask Mascot Todd for custom suggestions!</h4>
                <p className="text-xs text-slate-600 font-medium">
                  Click below and Todd the Fox will analyze your favorites to generate custom animated video playlists with AI guidance!
                </p>

                {aiSpeech && (
                  <div className="bg-white p-3 rounded-xl border border-purple-250 italic text-xs font-bold text-slate-800 leading-tight">
                    " {aiSpeech} "
                  </div>
                )}

                {/* Grid of Recommended videos from AI call */}
                {aiRecList.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {aiRecList.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => handlePlayVideo(rec)}
                        className="p-1 px-2 bg-purple-100 rounded-lg border border-purple-200 text-left text-[11px] font-bold hover:bg-purple-200 text-purple-950 transition truncate block"
                      >
                        📺 {rec.title}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  id="recommend-ai-button"
                  disabled={isAiLoading}
                  onClick={handleGetAiRecommendations}
                  className="mt-2.5 py-1.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-extrabold rounded-lg text-xs shadow hover:scale-103 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles size={13} className="animate-spin" />
                  {isAiLoading ? "Todd is thinking..." : "Magic Recommendations ✨"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic categories and full catalog side shelf */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          
          {/* Dynamic Safe Search Input */}
          <div className="bg-white p-3 rounded-xl border-2 border-sky-100 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">🔒 Safe Keyword Finder:</span>
            <input
              type="text"
              placeholder="Search eg. ABC, story, space..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-lg border-2 border-slate-150 focus:border-sky-300 focus:outline-none"
            />
          </div>

          {/* Interactive Categories list scroll */}
          <div className="bg-white p-3 rounded-xl border-2 border-sky-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">🎈 9 Kid-Safe Categories:</span>
            <div className="space-y-1 max-h-52 overflow-y-auto no-scrollbar">
              {VIDEO_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    kidsSound.playGenericPop();
                  }}
                  className={`w-full text-left p-1.5 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                    activeCategory === cat.name
                      ? "bg-sky-50 text-sky-800 border-l-4 border-sky-500 font-black scale-102"
                      : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">
                    {cat.emoji} {cat.name}
                  </span>
                  <ArrowRight size={11} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Tab Selector inside the theater shelf catalog */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border text-[11px] font-extrabold font-button">
            <button
              onClick={() => setDeckTab("all")}
              className={`flex-1 py-1 rounded-lg text-center cursor-pointer ${deckTab === "all" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"}`}
            >
              All Matches
            </button>
            <button
              onClick={() => setDeckTab("favorites")}
              className={`flex-1 py-1 rounded-lg text-center cursor-pointer flex justify-center items-center gap-0.5 ${deckTab === "favorites" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}
            >
              ❤️ ({favorites.length})
            </button>
            <button
              onClick={() => setDeckTab("later")}
              className={`flex-1 py-1 rounded-lg text-center cursor-pointer flex justify-center items-center gap-0.5 ${deckTab === "later" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}
            >
              ⏱️ ({watchLater.length})
            </button>
            <button
              onClick={() => setDeckTab("offline")}
              className={`flex-1 py-1 rounded-lg text-center cursor-pointer flex justify-center items-center gap-0.5 ${deckTab === "offline" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}
            >
              💾 ({offlineVideos.length})
            </button>
          </div>

          {/* Videos interactive column display */}
          <div className="bg-white p-3 rounded-2xl border-2 border-sky-100 h-[380px] overflow-y-auto space-y-2 no-scrollbar">
            {loading ? (
              <div className="text-center py-10 font-bold text-slate-400 text-xs">
                <span className="animate-spin block mb-2 text-2xl">⚡</span>
                Assembling safe streaming lines...
              </div>
            ) : displayList.length > 0 ? (
              <div className="space-y-2">
                {displayList.map((video) => {
                  const isSelected = activeVideo?.id === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => handlePlayVideo(video)}
                      id={`theatre-v-card-${video.id}`}
                      className={`w-full text-left p-2 rounded-xl border-2 transition-all active:scale-97 flex gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-sky-50 border-sky-400 shadow-sm text-sky-950 font-black scale-102"
                          : "border-slate-100 text-slate-700 hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Image Thumbnail with YouTube fallback or cute animated emoji cover */}
                      <div className="w-20 h-14 rounded-lg bg-slate-100 border relative overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${video.thumbnailBg} flex items-center justify-center text-2xl`}>
                            {video.thumbnailEmoji}
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 bg-black/75 rounded text-[8px] text-white px-1 font-bold">
                          {video.duration}
                        </span>
                      </div>

                      <div className="overflow-hidden flex flex-col justify-center text-xs">
                        <span className="text-[9px] text-[#2563eb] font-black uppercase tracking-wide leading-none">
                          {video.category}
                        </span>
                        <span className="font-extrabold text-[#1e293b] truncate block leading-snug mt-1 font-heading">
                          {video.title}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          ⭐️ Recommended for ages {video.ageGroup.replace(" years", "")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
                <span>🏜️ Empty Toybox</span>
                <p className="font-medium text-[10px] text-slate-350 px-4">
                  No videos found for this filter tab. Clean the criteria to find more awesome cartoons!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("Story Time");
                    setDeckTab("all");
                  }}
                  className="py-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[10px] text-slate-500 font-button"
                >
                  Refresh Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
