/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import authRouter from "./src/routes/authRoutes";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/auth", authRouter);

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Mock backup database for custom stories generated during the session
interface CustomStoryBackup {
  id: string;
  title: string;
  category: string;
  ageGroup: string;
  coverUrl: string;
  summary: string;
  pages: { pageNumber: number; text: string; illustration: string }[];
  isCustom: boolean;
}

const customStoriesDB: CustomStoryBackup[] = [];

// KIDS VIDEO DATA CATALOG & INAPPROPRIATE PHRASES
interface CartoonVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  rating: string;
  views: string;
  category: string;
  thumbnailEmoji: string;
  thumbnailBg: string;
  description: string;
  ageGroup: string;
  tags: string[];
  thumbnailUrl?: string;
  isSavedOffline?: boolean;
}

const SEED_CARTOONS_CATALOG: CartoonVideo[] = [
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
    thumbnailBg: "from-red-100 to-yellow-100",
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
    thumbnailBg: "from-teal-100 to-yellow-100",
    description: "Learn how to fold simple colored paper into beautiful flapping birds and fluttering butterflies. Perfect for beginners!",
    ageGroup: "9-12 years",
    tags: ["crafts", "origami", "diy", "art for kids", "creative zone"]
  }
];

const INAPPROPRIATE_BLOCKWORDS = [
  "scary", "horror", "gore", "bloody", "kill", "murder", "dead", "fight", "weapon", "war", "cursed", 
  "creepypasta", "swear", "profanity", "demon", "ghost", "violence", "blood", "stab", "gun", "knife", "punch",
  "mature", "adult", "sexy", "nsfw", "terror", "zombie", "monster", "evil", "thriller", "bloodier", "killings",
  "abuse", "assault", "combat", "warfare", "suicide", "scare", "jumpscare"
];

// Helper to filter inappropriate videos and title/description sanity checks
function isKidSafe(title: string, description: string): boolean {
  const normTitle = title.toLowerCase();
  const normDesc = description.toLowerCase();
  for (const blockword of INAPPROPRIATE_BLOCKWORDS) {
    if (normTitle.includes(blockword) || normDesc.includes(blockword)) {
      return false;
    }
  }
  return true;
}

// API: Check status

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!apiKey,
    databaseSize: customStoriesDB.length,
  });
});

// API: Get custom stories
app.get("/api/custom-stories", (req, res) => {
  res.json(customStoriesDB);
});

// API: Generate unique kids story with Gemini
app.post("/api/generate-story", async (req, res) => {
  try {
    const { character, theme, adventure, endingStyle, ageGroup } = req.body;

    if (!ai) {
      // Return a wonderful mocked story if API key is not yet set
      const backupStoryId = `generated-${Date.now()}`;
      const backupStoryObj = {
        id: backupStoryId,
        title: `The Adventures of ${character || "Sparky"} in the land of ${theme || "Candy"}`,
        category: "Magic Stories",
        ageGroup: ageGroup || "3-5 years",
        coverUrl: "🧙‍♂️🍧",
        summary: `A sweet adventure about ${character || "Sparky"} searching for the ${adventure || "Lost Crystal"} with a ${endingStyle || "Funny"} ending.`,
        pages: [
          {
            pageNumber: 1,
            text: `Once upon a time, in ${theme || "the Candy Kingdom"}, lived ${character || "a cute bunny"}. Everyone knew they loved exploring.`,
            illustration: "🐇🍭🔮"
          },
          {
            pageNumber: 2,
            text: `Today, they went on an amazing trip to find the ${adventure || "glowing rainbow map"}. Along the way, they met a singing teapot!`,
            illustration: "✨☕🗺️"
          },
          {
            pageNumber: 3,
            text: `After hopping through licorice fields, they reached the ending. It was so ${endingStyle || "funny and happy"}! They danced till bedtime.`,
            illustration: "🕺🍿😴"
          }
        ],
        isCustom: true
      };
      customStoriesDB.push(backupStoryObj);
      return res.status(200).json(backupStoryObj);
    }

    const systemPrompt = `You are an expert children's content creator, storyteller, and educator like Disney, PBS Kids, and Duolingo.
Your task is to write a highly engaging, delightful, custom illustrated story for a kid aged ${ageGroup || "3-5 years"}.
The story parameters:
- Core Character: ${character || "a playful little explorer"}
- Setting/Theme: ${theme || "a floating cloud paradise"}
- Adventure/Goal: ${adventure || "finding a missing sparkle wand"}
- Ending style: ${endingStyle || "heartwarming and sleepy for bedtime"}

Create a story consisting of a Title, a brief engaging parent Summary, and exactly 3 to 4 sequential pages. For each page, write 2 to 3 playful, age-appropriate sentences and specify 2 to 3 emojis that would work as an outstanding graphical illustration.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Tell a story based on my specs.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A funny and whimsical title of the children's story"
            },
            summary: {
              type: Type.STRING,
              description: "A 1-sentence synopsis for parent/child explorer"
            },
            pages: {
              type: Type.ARRAY,
              description: "An array of exactly 3 to 4 pages detailing the story",
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.INTEGER },
                  text: { type: Type.STRING, description: "2 to 3 colorful sentences suitable for kids reading" },
                  illustrationEmoji: { type: Type.STRING, description: "Exactly 2 to 4 cute illustrative emojis for child visual display" }
                },
                required: ["pageNumber", "text", "illustrationEmoji"]
              }
            }
          },
          required: ["title", "summary", "pages"]
        }
      }
    });

    const val = JSON.parse(response.text?.trim() || "{}");

    // Format to standard custom story
    const customStoryId = `generated-${Date.now()}`;
    const generatedStory = {
      id: customStoryId,
      title: val.title || "My Magical Adventure",
      category: "Magic Stories",
      ageGroup: ageGroup || "3-5 years",
      coverUrl: val.pages?.[0]?.illustrationEmoji || "🪄🐨✨",
      summary: val.summary || "A fantastic tale created by your imagination and built with AI magic!",
      pages: (val.pages || []).map((p: any) => ({
        pageNumber: p.pageNumber,
        text: p.text,
        illustration: p.illustrationEmoji
      })),
      isCustom: true
    };

    customStoriesDB.push(generatedStory);
    res.json(generatedStory);

  } catch (error: any) {
    console.error("Gemini Story Generation failed:", error);
    res.status(500).json({
      error: "Story generation encountered a small star-storm. Let's try again in a moment!",
      details: error.message
    });
  }
});

// API: Children's Text-to-Speech using gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "kore" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text specified for speech." });
    }

    if (!ai) {
      // Simulated response in case API key is missing
      return res.json({
        audio: null,
        message: "TTS is running in offline preview mode! Voice narration simulated successfully."
      });
    }

    // Voice mapping: Available prebuilt options: 'Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'
    const voiceMap: Record<string, string> = {
      puck: "Puck",
      zephyr: "Zephyr",
      kore: "Kore",
      charon: "Charon",
      fenrir: "Fenrir"
    };

    const targetVoice = voiceMap[voice.toLowerCase()] || "Kore";

    // Call TTS model
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Read this story passage cheerfully, with an engaging animation voice for children: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: targetVoice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: "Failed to extract spoken audio from cosmic winds." });
    }

  } catch (error: any) {
    console.error("Gemini TTS failed:", error);
    res.status(500).json({
      error: "Our voice system is catching its breath! Audio simulated overlay active.",
      details: error.message
    });
  }
});

// API: Kids Video Search and Safe YouTube API Proxy
app.get("/api/videos/search", async (req, res) => {
  try {
    const query = (req.query.query as string || "").trim();
    const category = (req.query.category as string || "").trim();
    const ageGroup = (req.query.ageGroup as string || "").trim();

    // STRICT SERVER-SIDE INPUT SANITIZATION
    if (query && !isKidSafe(query, "")) {
      console.warn(`[Safety Shield] Blocked search query containing inappropriate language: "${query}"`);
      return res.status(400).json({ 
        error: "Search term blocked by child safety filter.",
        details: "The search query contained words that do not pass our family-friendly guidelines." 
      });
    }

    const ytApiKey = process.env.YOUTUBE_API_KEY;
    if (ytApiKey) {
      try {
        const maskedKey = ytApiKey.length > 10 
          ? `${ytApiKey.substring(0, 6)}...${ytApiKey.substring(ytApiKey.length - 4)}` 
          : "[short-key]";
        
        // Append kids safe filters to search queries to prioritize clean content on YouTube APIs
        const safeQuery = `${query ? query : (category ? category : "kids cartoons")} kids safe learning educational`;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(safeQuery)}&key=${ytApiKey}&maxResults=15&videoEmbeddable=true&type=video&safeSearch=strict`;
        const maskedUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(safeQuery)}&key=${maskedKey}&maxResults=15&videoEmbeddable=true&type=video&safeSearch=strict`;

        console.log(`[YouTube API Proxy] Invoking YouTube endpoint: ${maskedUrl}`);
        const ytRes = await fetch(url);
        
        console.log(`[YouTube API Proxy] Response Status: ${ytRes.status} ${ytRes.statusText}`);

        if (ytRes.ok) {
          const data = await ytRes.json() as any;
          const rawItems = data.items || [];
          
          console.log(`[YouTube API Proxy] Successfully fetched JSON response from Google. "items" array size: ${rawItems.length}`);
          
          if (rawItems.length === 0) {
            console.warn("[YouTube API Proxy] WARNING: YouTube API returned an EMPTY 'items' array. This means no search matches were found, or the query may be overly restrictive.");
          }

          const mappedVideos: any[] = [];
          
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            const title = item.snippet?.title || "";
            const desc = item.snippet?.description || "";
            const videoId = item.id?.videoId || "";
            const isSafe = isKidSafe(title, desc);
            
            console.log(`  -> Item #${i + 1} [VideoID: ${videoId}]: "${title}" (Safe-Status: ${isSafe ? "APPROVED" : "BLOCKED"})`);
            
            if (isSafe && videoId) {
              mappedVideos.push({
                id: videoId,
                title: title,
                duration: "5:30",
                videoUrl: `https://www.youtube.com/embed/${videoId}`,
                rating: `⭐⭐⭐⭐⭐ ${(4.7 + (i % 4) * 0.1).toFixed(1)}`,
                views: `${(35 + i * 95)}k Views`,
                category: category || "Fun & Entertainment",
                thumbnailEmoji: "📺",
                thumbnailBg: "from-sky-100 to-indigo-150",
                description: desc || "An awesome video filled with knowledge, giggles, and magic!",
                ageGroup: ageGroup || "6-8 years",
                tags: [category, "youtube-api"],
                thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url
              });
            }
          }

          if (mappedVideos.length > 0) {
            console.log(`[YouTube API Proxy] Successfully parsed and returned ${mappedVideos.length} / ${rawItems.length} safe videos.`);
            return res.json(mappedVideos);
          } else {
            console.warn("[YouTube API Proxy] No videos passed the child safety filters or no valid videoId was found in the search results.");
          }
        } else {
          const errText = await ytRes.text();
          console.error(`[YouTube API Proxy] ERROR - YouTube Data API call failed. HTTP Status: ${ytRes.status}. Raw Error Body received:`, errText);
        }
      } catch (ytErr) {
        console.error("[YouTube API Proxy] EXCEPTION - An error occurred trying to connect or fetch from the YouTube API:", ytErr);
      }
    } else {
      console.log("[YouTube API Proxy] NOTICE: YOUTUBE_API_KEY environment variable is not configured; running in off-line catalog mode with local backup video list.");
    }

    // Fallback static list filtering
    let filteredList = [...SEED_CARTOONS_CATALOG];

    if (category) {
      filteredList = filteredList.filter(
        (v) => v.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (ageGroup) {
      const ageFiltered = filteredList.filter(
        (v) => v.ageGroup.toLowerCase() === ageGroup.toLowerCase()
      );
      // RELAXED AGE FALLBACK: If we have no matches for this specific age + category combination, 
      // do not return empty! Show other age categories' videos for this topic so screen is never blank.
      if (ageFiltered.length > 0) {
        filteredList = ageFiltered;
      } else {
        console.log(`[Video System Flow] No exact age matches for "${ageGroup}" under "${category}". Falling back to other age groups to avoid empty screen.`);
      }
    }

    if (query) {
      const qNorm = query.toLowerCase();
      filteredList = filteredList.filter(
        (v) =>
          v.title.toLowerCase().includes(qNorm) ||
          v.description.toLowerCase().includes(qNorm) ||
          v.tags.some((tag) => tag.toLowerCase().includes(qNorm))
      );
    }

    res.json(filteredList);
  } catch (error: any) {
    console.error("Kids Video search error:", error);
    res.status(500).json({ error: "Could not retrieve safe videos. Please try again soon!" });
  }
});

// API: AI Recommendations for Kids using Gemini
app.post("/api/videos/recommendations", async (req, res) => {
  try {
    const { ageGroup = "6-8 years", favoriteCategory = "Story Time", childName = "Junior" } = req.body;

    if (!ai) {
      const recList = SEED_CARTOONS_CATALOG.filter(
        (v) => v.ageGroup === ageGroup || v.category === favoriteCategory
      ).slice(0, 3);

      return res.json({
        coachSpeech: `Woohoo, ${childName}! Mascot Todd and the AI Wizard has handpicked 3 wonderful episodes just for your super smart brain! Let's explore "${favoriteCategory}" to find new secrets!`,
        recommendedVideos: recList
      });
    }

    const systemPrompt = `You are Mascot Todd, a friendly, hyper-energetic talking Fox coach who guides kids in their learning adventure.
Your task is to write a short, highly motivating recommendation message for a child named ${childName} (age group: ${ageGroup}) who loves the category "${favoriteCategory}".
Keep it under 3 sentences, very friendly, with sweet animal sounds like 'Yippee!' or 'Woohoo!'. Make them feel like a super star explorer! Speak directly to the child.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Encourage ${childName} who is ${ageGroup} years old and loves ${favoriteCategory}.`,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const aiSpeechText = response.text?.trim() || `Yippee! Let's watch some amazing cartoons together!`;

    // Filter 3 matching videos to return
    let candidateVideos = SEED_CARTOONS_CATALOG.filter(
      (v) => v.ageGroup === ageGroup || v.category.toLowerCase() === favoriteCategory.toLowerCase()
    );

    if (candidateVideos.length < 3) {
      candidateVideos = SEED_CARTOONS_CATALOG.slice(0, 3);
    } else {
      candidateVideos = candidateVideos.slice(0, 3);
    }

    res.json({
      coachSpeech: aiSpeechText,
      recommendedVideos: candidateVideos
    });

  } catch (err: any) {
    console.error("AI recommendations failed:", err);
    res.status(500).json({ error: "AI recommendation balloon got tangled in cloud branches!" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WonderKids Backend] Running locally on port ${PORT}`);
  });
}

startServer();
