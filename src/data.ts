/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story, AudioBook, CartoonVideo, Poem, AchievementBadge, DailyChallenge } from "./types";

export const SEED_STORIES: Story[] = [
  {
    id: "story-dragon-cookie",
    title: "The Dragon Who Loved Cookies",
    category: "Adventure Stories",
    ageGroup: "3-5 years",
    coverUrl: "🐲🍪",
    summary: "Sparky is a friendly little purple dragon who doesn't like to scare people. Instead, his biggest dream is to open a magical cookie bakery!",
    author: "Giggles McSweets",
    pages: [
      {
        pageNumber: 1,
        text: "Once upon a high mountain peak lived a tiny purple dragon named Sparky. Unlike other dragons who blew scary fire, Sparky only blew warm strawberry-scented puffs!",
        illustration: "🏔️🐲💖"
      },
      {
        pageNumber: 2,
        text: "Sparky's absolute favorite flavor in the world was crunchy chocolate chip cookies. Every afternoon, he used his gentle flame to bake batches of cookies on a smooth, flat stone.",
        illustration: "🐲🔥🍪"
      },
      {
        pageNumber: 3,
        text: "One day, a little squirrel named Pip came by. Pip followed the sweet aroma and was amazed. 'Wow, Mr. Dragon! These are the best cookies in the Whimsical Woods!' he squeaked.",
        illustration: "🐿️✨🍪"
      },
      {
        pageNumber: 4,
        text: "Soon, animals from all over came to Sparky's peak. Sparky didn't scare anyone; he just cheered, wore a tiny chef hat, and shared biscuits. He was the happiest baking dragon ever!",
        illustration: "🐿️🦔🐦🐲🧑‍🍳"
      }
    ]
  },
  {
    id: "story-sleepy-star",
    title: "The Sleepy Little Star",
    category: "Bedtime Stories",
    ageGroup: "3-5 years",
    coverUrl: "⭐😴",
    summary: "Luna is a tiny star who is too cozy and sleepy to stay awake during the dark night, so she finds a soft cloud crib.",
    author: "Sleepytime Sue",
    pages: [
      {
        pageNumber: 1,
        text: "Far up in the night sky, while all the other stars were stretching their arms to shine wide and bright, a tiny star named Luna was letting out a giant yawn.",
        illustration: "🌌⭐🥱"
      },
      {
        pageNumber: 2,
        text: "Luna's sparkles were soft and warm. Instead of shimmering, she felt like cuddling. She wobbled past the smiling pale Moon, looking for a perfect place to take a little nap.",
        illustration: "🌙✨🪐"
      },
      {
        pageNumber: 3,
        text: "She found a fluffy, lavender-colored cloud named Puffy. Puffy was soft like cotton candy. Luna nestled deep into the cloud crib and tucked her starry points snuggly inside.",
        illustration: "☁️😴⭐"
      },
      {
        pageNumber: 4,
        text: "As the Moon sang a quiet lullaby, Luna drifted off into sweet dreams. It is said that when you see a star softly twinkling on and off, Luna is sleepily whispering 'goodnight'.",
        illustration: "💤💤⭐🌙"
      }
    ]
  },
  {
    id: "story-ocean-adventure",
    title: "Penny the Penguin's Deep Sea Submarine",
    category: "Science Stories",
    ageGroup: "6-8 years",
    coverUrl: "🐧🛸",
    summary: "Penny build a miniature submarine out of a giant yellow bubble kelp to explore the glowing, mysterious deep-sea hydrothermal vents.",
    author: "Professor Shell",
    pages: [
      {
        pageNumber: 1,
        text: "Penny the penguin did not want to just glide on top of ice. She wanted to know what secret animals lived in the pitch-black deep zone of the ocean!",
        illustration: "🧊🐧🔍🌊"
      },
      {
        pageNumber: 2,
        text: "With help from Barnaby the beaver, she built a cute yellow submarine called the AquaPod. It had thick glass windows and bright neon headlights to cut through the dark water.",
        illustration: "🐧🦦🛥️💡"
      },
      {
        pageNumber: 3,
        text: "As they dove past two thousand meters, the water was freezing, but they reached the thermal vents! Hot, mineral-rich water sprayed out like beautiful warm geysers.",
        illustration: "🌋🦑🦐🐠"
      },
      {
        pageNumber: 4,
        text: "Penny saw glowing jellyfishes and giant bright red tube worms that survived on hot vent energy instead of sunlight. She recorded everything in her nature journal with a huge smile!",
        illustration: "📝🦑✨🐬"
      }
    ]
  },
  {
    id: "story-forest-harmony",
    title: "Leo and the Brave Little Ant",
    category: "Moral Stories",
    ageGroup: "6-8 years",
    coverUrl: "🦁🐜",
    summary: "A mighty lion named Leo realizes that friends come in all shapes and sizes when a clever little ant saves him from a tiny tricky situation.",
    author: "Aerosol Aesop",
    pages: [
      {
        pageNumber: 1,
        text: "Leo was the proudest lion in the savanna. He strutted around shaking his magnificent yellow mane. 'I am the biggest and strongest!' he roared happily.",
        illustration: "🦁👑🌾"
      },
      {
        pageNumber: 2,
        text: "One morning, a tiny ant named Andy was carrying a sugar pebble and bumped into Leo's paw. 'Watch where you're crawling, little speck!' sneered Leo.",
        illustration: "🦁🐜🍭"
      },
      {
        pageNumber: 3,
        text: "Andy looked up bravely. 'Even tiny specks can do great things, King Leo!' Leo laughed. But that afternoon, Leo stepped on a sharp thorn that went deep into his furry paw.",
        illustration: "🦁🐾💥"
      },
      {
        pageNumber: 4,
        text: "None of the bigger animals could grab it with their heavy paws. Andy crawled right between the spikes, held the thorn secure, and popped it out! Leo realized size doesn't measure kindness.",
        illustration: "🐜🦁💖🥳"
      }
    ]
  },
  {
    id: "story-science-rockets",
    title: "The Rocket Mystery of Mars",
    category: "Magic Stories",
    ageGroup: "9-12 years",
    coverUrl: "🚀🪐",
    summary: "Maya and her companion robot Sparks travel to a strange glowing canyon of Mars to see if the cosmic red dust is actually talking to them.",
    author: "Comet Cody",
    pages: [
      {
        pageNumber: 1,
        text: "Ten-year-old astronanny Maya stared at her helmet analyzer. 'Sparks, the red canyon's coordinates are whispering a musical signal in Morse code!'",
        illustration: "🚀🤖👩‍🚀"
      },
      {
        pageNumber: 2,
        text: "They stepped off their explorer rover. The gravity was very light—they could hop high in the air like zero-g kangaroos! Behind them lay Olympus Mons.",
        illustration: "🦘🪐🤖"
      },
      {
        pageNumber: 3,
        text: "Inside the deep canyon, they discovered glowing blue crystals reflecting infrared beams. The crystals vibration created safe thermal wind music!",
        illustration: "💎💎🎷👽"
      },
      {
        pageNumber: 4,
        text: "Sparks mapped the wind pattern to code: 'Welcome to Mars, young travelers.' It was a natural whispering acoustic chamber! Maya felt the universe's magic.",
        illustration: "✨🤖👩‍🚀🛰️"
      }
    ]
  }
];

export const SEED_AUDIO_BOOKS: AudioBook[] = [
  {
    id: "audio-enchanted-carpet",
    title: "The Flying Carpet's Holiday",
    category: "Fairy Tales",
    duration: "5 mins",
    narrator: "Uncle Benny",
    coverEmoji: "🧎‍♂️🔮",
    coverBg: "from-purple-400 to-pink-400",
    summary: "Follow Tassel, an old flying carpet, who escapes a grumpy museum collector to fly kids on a tour of the clouds.",
    chapters: [
      { title: "Chapter 1: The Dusty Attic", text: "Tassel had been resting in the dark corner of the collector's house, wishing for a child's playful touch to unleash his magical blue tassels." },
      { title: "Chapter 2: The Open Window", text: "A sudden gust of wind blew the attic latch open. Tassel rolled up, shivered, and dove into the cool evening sky, seeking adventure!" }
    ]
  },
  {
    id: "audio-noisy-farmhouse",
    title: "The Noisy Midnight Concert at the Farm",
    category: "Bedtime Stories",
    duration: "3.5 mins",
    narrator: "Auntie Bella",
    coverEmoji: "🐔🎻",
    coverBg: "from-amber-300 to-orange-400",
    summary: "A fun bedside story where animals try to practice their instruments without waking up the busy sleep-deprived farmer.",
    chapters: [
      { title: "The Quiet Squeak", text: "Barnaby the piglet tapped his mini-xylophone very, very softly: ting-ting-ting. The cow shook her soft tail in rhythm." },
      { title: "The Farmer Shivers", text: "Suddenly, the wooden barn door creaked! Farmer Dan rolled in his bed. 'Is that a ghost?' he mumbled, hugging his pillow tight." }
    ]
  },
  {
    id: "audio-seed-whisper",
    title: "The Seed That Forgot How to Grow",
    category: "Educational Stories",
    duration: "4 mins",
    narrator: "Dr. Greenbeans",
    coverEmoji: "🌱🌞",
    coverBg: "from-green-400 to-teal-500",
    summary: "Sammy is a little seed buried underground. He is afraid of dark soil until a friendly rain shower and soil worm teach him photosynthesis.",
    chapters: [
      { title: "Buried Deep", text: "Sammy lay curled up in a snug brown shell. 'It is too dark down here,' Sammy whimpered to direct sunlight." },
      { title: "Hello Sunlight", text: "Wiggle the worm poked his head. 'Just drink water, stretch your feet down, and raise your green hands! You are meant to be a flower!'" }
    ]
  }
];

export const SEED_CARTOONS: CartoonVideo[] = [
  {
    id: "cart-safari-party",
    title: "Silly Safari: The Hippo's Ballet Dance",
    duration: "2:15",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Standard cute placeholder
    rating: "⭐⭐⭐⭐⭐ 4.9",
    views: "1.2M Views",
    category: "Magic Toons",
    thumbnailEmoji: "🦛🩰",
    thumbnailBg: "from-pink-300 to-rose-400",
    description: "Watch Henrietta the heavy hippie hippo spin in a bright pink tutu while the forest bunnies play tiny banjos!"
  },
  {
    id: "cart-space-explorers",
    title: "Chibi Astronauts: The Marshmallow Galaxy",
    duration: "1:50",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: "⭐⭐⭐⭐⭐ 4.8",
    views: "890k Views",
    category: "Science Cartoons",
    thumbnailEmoji: "👩‍🚀🛸",
    thumbnailBg: "from-sky-300 to-indigo-400",
    description: "Our cute chibi astronauts land on a glowing asteroid made entirely of sticky pink and white marshmallows."
  },
  {
    id: "cart-abc-rhymes",
    title: "The Phonics Zoo ABC Song",
    duration: "3:05",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: "⭐⭐⭐⭐⭐ 5.0",
    views: "3.4M Views",
    category: "Nursery Rhymes Videos",
    thumbnailEmoji: "🐯🔡",
    thumbnailBg: "from-green-300 to-emerald-400",
    description: "Learn your vocabulary with happy dancing monkeys, roaring baby tigers, and jumping kangaroos!"
  }
];

export const SEED_POEMS: Poem[] = [
  {
    id: "poem-twinkle",
    title: "Twinkle, Twinkle, Little Star",
    category: "Nursery Rhymes",
    emoji: "⭐✨",
    colorBg: "bg-indigo-900 border-indigo-400 text-white",
    lyrics: [
      "Twinkle, twinkle, little star,",
      "How I wonder what you are!",
      "Up above the world so high,",
      "Like a diamond in the sky.",
      "Twinkle, twinkle, little star,",
      "How I wonder what you are!"
    ],
    audioTimerMs: 4000
  },
  {
    id: "poem-abc",
    title: "The Alphabet Song (ABC)",
    category: "ABC Songs",
    emoji: "🎒🔤",
    colorBg: "bg-amber-100 border-amber-300 text-amber-900",
    lyrics: [
      "A, B, C, D, E, F, G,",
      "H, I, J, K, L, M, N, O, P,",
      "Q, R, S, T, U, V,",
      "W, X, Y and Z,",
      "Now I know my ABCs,",
      "Next time won't you sing with me!"
    ],
    audioTimerMs: 3500
  },
  {
    id: "poem-macdonald",
    title: "Old MacDonald Had a Farm",
    category: "Animal Songs",
    emoji: "🚜🐖",
    colorBg: "bg-green-100 border-green-300 text-green-900",
    lyrics: [
      "Old MacDonald had a farm, E-I-E-I-O!",
      "And on his farm he had a cow, E-I-E-I-O!",
      "With a moo-moo here, and a moo-moo there,",
      "Here a moo, there a moo, everywhere moo-moo!",
      "Old MacDonald had a farm, E-I-E-I-O!"
    ],
    audioTimerMs: 4500
  }
];

export const STATIC_BADGES: AchievementBadge[] = [
  { id: "badge-first-story", title: "Star Reader", description: "Read your very first story!", emoji: "📖⭐", color: "bg-yellow-200 text-yellow-700 border-yellow-400" },
  { id: "badge-first-quiz", title: "Math Einstein", description: "Completed a Math Challenge!", emoji: "🧮💡", color: "bg-blue-200 text-blue-700 border-blue-400" },
  { id: "badge-first-audiobook", title: "Deep Listener", description: "Listened to an audiobook for 2 minutes!", emoji: "🎧🌳", color: "bg-purple-200 text-purple-700 border-purple-400" },
  { id: "badge-first-painting", title: "Mini Picasso", description: "Saved a coloring or drawing artwork!", emoji: "🎨🖌️", color: "bg-pink-200 text-pink-700 border-pink-400" },
  { id: "badge-puzzle-master", title: "Puzzle Solver", description: "Solved an interactive jigsaw puzzle!", emoji: "🧩🏆", color: "bg-green-200 text-green-700 border-green-400" },
  { id: "badge-story-architect", title: "Story Maker", description: "Generated a custom story with AI!", emoji: "🤖✍️", color: "bg-coral-200 text-orange-700 border-orange-400" }
];

export const DAILY_WORDS: DailyChallenge[] = [
  {
    wordOfTheDay: { word: "Curious", meaning: "Eager to know, explore, and learn new things.", sentence: "The curious little monkey wanted to know what was inside the golden treasure chest!" },
    funFact: "Honeybees can flap their wings up to 200 times per second! That's why they make a 'bzzzz' sound when they fly.",
    riddle: { question: "What is full of holes but still holds plenty of water?", answer: "A sponge", hint: "You can find me in your kitchen or bathtub!" }
  },
  {
    wordOfTheDay: { word: "Courageous", meaning: "Being brave and doing the right thing even when afraid.", sentence: "Sammy was courageous when he apologized to Pip for playing with his toys without asking." },
    funFact: "Octopuses have three hearts! Two pump blood to the gills, and one pumps to the rest of the body.",
    riddle: { question: "What has hands but cannot clap or write?", answer: "A clock", hint: "It helps you know when it's lunchtime!" }
  }
];

export const COLORING_PAGES = [
  { id: "color-animal", name: "Cheerful Turtle", emoji: "🐢", outlines: [
    { type: "circle", cx: 150, cy: 150, r: 80, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "circle", cx: 230, cy: 120, r: 30, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "rect", x: 100, y: 210, width: 30, height: 40, rx: 10, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "rect", x: 170, y: 210, width: 30, height: 40, rx: 10, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "circle", cx: 240, cy: 115, r: 5, fill: "#333" }
  ] },
  { id: "color-space", name: "Cute Rocket Ship", emoji: "🚀", outlines: [
    { type: "path", d: "M 150 50 Q 110 130 110 210 L 190 210 Q 190 130 150 50 Z", stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "circle", cx: 150, cy: 130, r: 20, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "polygon", points: "110,180 80,210 110,210", stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "polygon", points: "190,180 220,210 190,210", stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "path", d: "M 130 220 L 120 250 L 140 240 L 150 260 L 160 240 L 180 250 L 170 220 Z", stroke: "#333", strokeWidth: 4, fill: "transparent" }
  ] },
  { id: "color-princes", name: "Magic Wand & Castle", emoji: "🏰", outlines: [
    { type: "rect", x: 100, y: 120, width: 100, height: 100, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "polygon", points: "90,120 150,60 210,120", stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "rect", x: 130, y: 160, width: 40, height: 60, rx: 10, stroke: "#333", strokeWidth: 4, fill: "transparent" },
    { type: "polygon", points: "50,210 60,150 70,210", stroke: "#333", strokeWidth: 4, fill: "transparent" }
  ] }
];

export const STICKER_LIST = ["⭐️", "🌈", "🦖", "🦄", "🍪", "🍄", "🤖", "🎨", "🚀", "🍦", "🥳", "🧩"];
