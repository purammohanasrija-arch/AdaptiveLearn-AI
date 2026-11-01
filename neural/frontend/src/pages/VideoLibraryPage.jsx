import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import {
  Video, Search, Filter, Play, Pause, X, Clock, Star, BookOpen,
  Volume2, VolumeX, Subtitles, Sparkles, CheckCircle2, ArrowLeft,
  ChevronRight, Maximize2, Minimize2, Bookmark, Eye, Headphones,
  Grid, List, TrendingUp, Award
} from 'lucide-react';

// ─── Hardcoded Video Catalog ────────────────────────────────────────────────

const VIDEO_CATALOG = [
  {
    id: 'vid-cs-1',
    title: 'How the Internet Works',
    subject: 'Computer Science',
    topic: 'Networking',
    difficulty: 'easy',
    duration: '5:24',
    embedUrl: 'https://www.youtube-nocookie.com/embed/x3c1ih2NJEg',
    posterEmoji: '🌐',
    posterGradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    creator: 'Kurzgesagt – In a Nutshell',
    description: 'A beautifully animated journey through the infrastructure of the internet — from undersea cables to data packets.',
    chapters: [
      { time: '00:00', title: '1. What Is the Internet?', text: 'The internet is a global network of interconnected computers exchanging data through standardized protocols.' },
      { time: '01:15', title: '2. Packets & Protocols', text: 'Data is split into small packets, each labeled with source and destination addresses using TCP/IP.' },
      { time: '02:40', title: '3. Routers & Infrastructure', text: 'Routers guide packets across thousands of interconnected networks spanning the globe.' },
      { time: '04:00', title: '4. DNS: The Internet Phonebook', text: 'Domain Name System translates human-readable URLs into numerical IP addresses.' },
      { time: '05:00', title: '5. The Future of Connectivity', text: 'Emerging technologies like 5G and satellite internet promise faster, broader access worldwide.' },
    ],
    summaryTakeaways: [
      'The internet is a physical network of cables, routers, and servers.',
      'TCP/IP breaks data into packets and reassembles them at the destination.',
      'DNS converts domain names into IP addresses so browsers can find servers.',
    ],
  },
  {
    id: 'vid-cs-2',
    title: 'Binary Numbers Explained',
    subject: 'Computer Science',
    topic: 'Number Systems',
    difficulty: 'easy',
    duration: '4:47',
    embedUrl: 'https://www.youtube-nocookie.com/embed/LpuPe81bc2w',
    posterEmoji: '0️⃣1️⃣',
    posterGradient: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
    creator: 'Khan Academy Computing',
    description: 'Understand how computers use only two digits — 0 and 1 — to represent all information.',
    chapters: [
      { time: '00:00', title: '1. Why Binary?', text: 'Electronic circuits have two states — on and off — making base-2 the natural language of hardware.' },
      { time: '01:10', title: '2. Place Values in Binary', text: 'Each position represents a power of 2: 1, 2, 4, 8, 16, 32, and so on.' },
      { time: '02:20', title: '3. Converting Decimal to Binary', text: 'Divide by 2 repeatedly and track the remainders to find the binary representation.' },
      { time: '03:30', title: '4. Binary in Real Life', text: 'Every image, sound, and text file on your computer is stored as sequences of binary digits.' },
    ],
    summaryTakeaways: [
      'Binary is base-2: each digit (bit) is either 0 or 1.',
      'A byte is 8 bits and can represent 256 different values.',
      'All digital data — text, images, audio — is stored as binary numbers.',
    ],
  },
  {
    id: 'vid-cs-3',
    title: 'What is an Algorithm?',
    subject: 'Computer Science',
    topic: 'Algorithms',
    difficulty: 'easy',
    duration: '6:02',
    embedUrl: 'https://www.youtube-nocookie.com/embed/6hfOvs8pY1k',
    posterEmoji: '⚙️',
    posterGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    creator: 'TED-Ed',
    description: 'What exactly is an algorithm? This animated lesson breaks down the concept with everyday examples.',
    chapters: [
      { time: '00:00', title: '1. Algorithms Are Everywhere', text: 'From recipes to GPS directions, algorithms are step-by-step instructions to solve problems.' },
      { time: '01:30', title: '2. Sorting Algorithms', text: 'Bubble sort, merge sort, and quicksort are classic examples of algorithmic problem-solving.' },
      { time: '03:00', title: '3. Efficiency Matters', text: 'An algorithm that takes fewer steps to reach the answer is considered more efficient.' },
      { time: '04:30', title: '4. Algorithms in Technology', text: 'Search engines, social media feeds, and self-driving cars all depend on complex algorithms.' },
      { time: '05:30', title: '5. Thinking Algorithmically', text: 'Breaking big problems into smaller steps is the foundation of computational thinking.' },
    ],
    summaryTakeaways: [
      'An algorithm is a finite set of well-defined instructions to accomplish a task.',
      'Efficiency is measured by time complexity and space complexity.',
      'Algorithmic thinking helps solve problems across all disciplines.',
    ],
  },
  {
    id: 'vid-bio-1',
    title: 'Inside a Human Cell',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'medium',
    duration: '7:32',
    embedUrl: 'https://www.youtube-nocookie.com/embed/URUJD5NEXC8',
    posterEmoji: '🔬',
    posterGradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
    creator: 'Amoeba Sisters',
    description: 'Take a microscopic journey inside a human cell and discover the organelles that keep us alive.',
    chapters: [
      { time: '00:00', title: '1. The Cell Membrane', text: 'A phospholipid bilayer that controls what enters and exits the cell.' },
      { time: '01:45', title: '2. The Nucleus', text: 'The command center containing DNA — the blueprint for all cellular activities.' },
      { time: '03:10', title: '3. Mitochondria: The Powerhouse', text: 'Mitochondria convert glucose and oxygen into ATP, the energy currency of life.' },
      { time: '05:00', title: '4. Endoplasmic Reticulum & Golgi', text: 'The ER manufactures proteins; the Golgi apparatus packages and ships them.' },
      { time: '06:30', title: '5. Lysosomes & Recycling', text: 'Lysosomes break down waste materials and worn-out organelles for recycling.' },
    ],
    summaryTakeaways: [
      'The cell membrane is a selective barrier protecting internal structures.',
      'DNA in the nucleus directs all cell functions via gene expression.',
      'Mitochondria produce ATP through cellular respiration.',
    ],
  },
  {
    id: 'vid-bio-2',
    title: 'DNA Replication Made Simple',
    subject: 'Biology',
    topic: 'Genetics',
    difficulty: 'medium',
    duration: '6:48',
    embedUrl: 'https://www.youtube-nocookie.com/embed/TNKWgcFPHqw',
    posterEmoji: '🧬',
    posterGradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    creator: 'Crash Course Biology',
    description: 'Learn how your cells copy their entire DNA before dividing — with stunning animations.',
    chapters: [
      { time: '00:00', title: '1. Why Replicate DNA?', text: 'Every time a cell divides, it must copy all 3 billion base pairs of its genome.' },
      { time: '01:20', title: '2. Unwinding the Double Helix', text: 'Helicase enzyme unzips the DNA strands at the replication fork.' },
      { time: '02:50', title: '3. Building New Strands', text: 'DNA polymerase reads the template strand and adds complementary nucleotides (A-T, C-G).' },
      { time: '04:30', title: '4. Leading vs Lagging Strand', text: 'The leading strand is built continuously; the lagging strand is assembled in short Okazaki fragments.' },
      { time: '06:00', title: '5. Proofreading & Repair', text: 'Error-checking enzymes fix mismatched bases, achieving 99.9999% accuracy.' },
    ],
    summaryTakeaways: [
      'DNA replication is semi-conservative — each new molecule has one old and one new strand.',
      'Helicase unwinds; DNA polymerase copies; ligase seals the fragments.',
      'Proofreading enzymes ensure near-perfect replication fidelity.',
    ],
  },
  {
    id: 'vid-phy-1',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    topic: 'Classical Mechanics',
    difficulty: 'medium',
    duration: '8:15',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kKKM8Y-u7ds',
    posterEmoji: '🚀',
    posterGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    creator: 'Crash Course Physics',
    description: 'Explore the three fundamental laws that govern how objects move — from falling apples to orbiting planets.',
    chapters: [
      { time: '00:00', title: '1. First Law: Inertia', text: 'An object at rest stays at rest; an object in motion stays in motion unless acted on by a force.' },
      { time: '02:00', title: '2. Second Law: F = ma', text: 'Force equals mass times acceleration — the more massive an object, the more force needed to accelerate it.' },
      { time: '04:15', title: '3. Third Law: Action-Reaction', text: 'For every action there is an equal and opposite reaction.' },
      { time: '06:00', title: '4. Real-World Applications', text: 'From seatbelts to rocket propulsion, Newton\'s laws explain everyday phenomena.' },
      { time: '07:30', title: '5. Beyond Newton', text: 'At extreme speeds or tiny scales, Einstein\'s relativity and quantum mechanics take over.' },
    ],
    summaryTakeaways: [
      'First Law: Objects resist changes in motion (inertia).',
      'Second Law: F = ma — force, mass, and acceleration are interconnected.',
      'Third Law: Forces always come in equal and opposite pairs.',
    ],
  },
  {
    id: 'vid-phy-2',
    title: 'How Electricity Works',
    subject: 'Physics',
    topic: 'Electromagnetism',
    difficulty: 'easy',
    duration: '5:55',
    embedUrl: 'https://www.youtube-nocookie.com/embed/mc979OhitAg',
    posterEmoji: '⚡',
    posterGradient: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
    creator: 'TED-Ed',
    description: 'An illuminating look at electrons, voltage, current, and how they power our world.',
    chapters: [
      { time: '00:00', title: '1. What Is Electricity?', text: 'Electricity is the flow of electrons through a conductive material like copper wire.' },
      { time: '01:20', title: '2. Voltage, Current & Resistance', text: 'Voltage is the push, current is the flow rate, and resistance opposes the flow (Ohm\'s Law).' },
      { time: '02:50', title: '3. Circuits: Series & Parallel', text: 'Series circuits have one path; parallel circuits provide multiple paths for current.' },
      { time: '04:10', title: '4. AC vs DC', text: 'Alternating current reverses direction; direct current flows one way — both power different devices.' },
      { time: '05:20', title: '5. Electrical Safety', text: 'Understanding circuits helps prevent short circuits, overloads, and electrical hazards.' },
    ],
    summaryTakeaways: [
      'Electricity is the movement of electrons through conductors.',
      'Ohm\'s Law: Voltage = Current × Resistance (V = IR).',
      'Circuits can be wired in series (single path) or parallel (multiple paths).',
    ],
  },
  {
    id: 'vid-math-1',
    title: 'Introduction to Algebra',
    subject: 'Math',
    topic: 'Algebra',
    difficulty: 'easy',
    duration: '6:30',
    embedUrl: 'https://www.youtube-nocookie.com/embed/NybHckSEQBI',
    posterEmoji: '📐',
    posterGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    creator: 'Math Antics',
    description: 'Discover the basics of algebra — variables, expressions, and solving simple equations.',
    chapters: [
      { time: '00:00', title: '1. What Is Algebra?', text: 'Algebra uses letters (variables) to represent unknown numbers in mathematical expressions.' },
      { time: '01:30', title: '2. Variables & Constants', text: 'Variables change; constants stay the same. Together they form algebraic expressions.' },
      { time: '03:00', title: '3. Solving Simple Equations', text: 'Isolate the variable by performing the same operation on both sides of the equals sign.' },
      { time: '04:30', title: '4. Word Problems', text: 'Translate real-world scenarios into algebraic equations, then solve systematically.' },
      { time: '05:45', title: '5. Why Algebra Matters', text: 'Algebra is the gateway to advanced math, science, engineering, and programming.' },
    ],
    summaryTakeaways: [
      'Variables are symbols representing unknown values.',
      'Solve equations by isolating the variable using inverse operations.',
      'Algebra is foundational for nearly all STEM fields.',
    ],
  },
  {
    id: 'vid-math-2',
    title: 'Understanding Probability',
    subject: 'Math',
    topic: 'Statistics & Probability',
    difficulty: 'medium',
    duration: '7:10',
    embedUrl: 'https://www.youtube-nocookie.com/embed/uzkc-qNVoOk',
    posterEmoji: '🎲',
    posterGradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    creator: 'Crash Course Statistics',
    description: 'What are the chances? Learn the fundamentals of probability with fun, intuitive examples.',
    chapters: [
      { time: '00:00', title: '1. What Is Probability?', text: 'Probability measures how likely an event is to occur, from 0 (impossible) to 1 (certain).' },
      { time: '01:40', title: '2. Sample Spaces & Events', text: 'The sample space is the set of all possible outcomes; an event is a specific subset.' },
      { time: '03:00', title: '3. Independent vs Dependent Events', text: 'Independent events don\'t affect each other; dependent events change probability based on prior outcomes.' },
      { time: '04:45', title: '4. Conditional Probability', text: 'The probability of A given B narrows the sample space to only outcomes where B occurred.' },
      { time: '06:15', title: '5. Probability in Everyday Life', text: 'Weather forecasts, medical tests, and game strategies all rely on probability theory.' },
    ],
    summaryTakeaways: [
      'Probability ranges from 0 (impossible) to 1 (certain).',
      'P(A) = favorable outcomes / total outcomes for equally likely events.',
      'Independent events: P(A and B) = P(A) × P(B).',
    ],
  },
  {
    id: 'vid-hist-1',
    title: 'Ancient Civilizations Overview',
    subject: 'History',
    topic: 'Ancient History',
    difficulty: 'easy',
    duration: '9:02',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jIxPT_Ildeg',
    posterEmoji: '🏛️',
    posterGradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    creator: 'Crash Course World History',
    description: 'Travel back in time to Mesopotamia, Egypt, the Indus Valley, and China to explore the birth of civilization.',
    chapters: [
      { time: '00:00', title: '1. The Fertile Crescent', text: 'Mesopotamia, between the Tigris and Euphrates, is often called the cradle of civilization.' },
      { time: '02:00', title: '2. Ancient Egypt', text: 'The Nile flooded annually, enabling agriculture that sustained one of history\'s longest-lasting empires.' },
      { time: '04:00', title: '3. Indus Valley Civilization', text: 'Mohenjo-daro and Harappa had advanced urban planning, sewage systems, and standardized weights.' },
      { time: '06:00', title: '4. Ancient China', text: 'The Shang and Zhou dynasties introduced writing, bronze metallurgy, and the Mandate of Heaven.' },
      { time: '08:00', title: '5. Legacy & Connections', text: 'Trade routes connected these civilizations, sharing innovations in writing, math, and governance.' },
    ],
    summaryTakeaways: [
      'Civilization arose independently near major river systems providing irrigation.',
      'Writing, agriculture, and organized religion were hallmarks of early societies.',
      'Trade and cultural exchange accelerated technological progress.',
    ],
  },
  {
    id: 'vid-hist-2',
    title: 'The Renaissance Explained',
    subject: 'History',
    topic: 'European History',
    difficulty: 'medium',
    duration: '8:44',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Vufba_ZDMhY',
    posterEmoji: '🎨',
    posterGradient: 'linear-gradient(135deg, #E11D48 0%, #BE185D 100%)',
    creator: 'Crash Course European History',
    description: 'The rebirth of art, science, and humanism in 14th-17th century Europe that transformed the world.',
    chapters: [
      { time: '00:00', title: '1. What Was the Renaissance?', text: 'A cultural movement (14th-17th century) emphasizing classical learning, humanism, and artistic innovation.' },
      { time: '02:00', title: '2. Florence: Birthplace of the Renaissance', text: 'Wealthy Medici patrons funded artists like Leonardo da Vinci, Michelangelo, and Botticelli.' },
      { time: '04:00', title: '3. Art & Innovation', text: 'Linear perspective, oil painting, and anatomical accuracy revolutionized visual arts.' },
      { time: '06:00', title: '4. Scientific Revolution Seeds', text: 'Renaissance curiosity led to Copernicus, Galileo, and the beginnings of modern science.' },
      { time: '07:30', title: '5. Lasting Impact', text: 'The Renaissance laid the foundation for the Enlightenment and modern Western thought.' },
    ],
    summaryTakeaways: [
      'The Renaissance revived interest in classical Greek and Roman knowledge.',
      'Humanism placed humans — not just the divine — at the center of inquiry.',
      'Artistic techniques like perspective and chiaroscuro emerged during this era.',
    ],
  },
  {
    id: 'vid-geo-1',
    title: 'Climate Change & Global Warming',
    subject: 'Geography',
    topic: 'Environmental Science',
    difficulty: 'medium',
    duration: '7:50',
    embedUrl: 'https://www.youtube-nocookie.com/embed/G4H1N_yXBiA',
    posterEmoji: '🌡️',
    posterGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    creator: 'Kurzgesagt – In a Nutshell',
    description: 'An urgent and beautifully animated overview of climate science, greenhouse gases, and what we can do.',
    chapters: [
      { time: '00:00', title: '1. The Greenhouse Effect', text: 'Certain gases trap heat in the atmosphere, keeping Earth warm enough for life.' },
      { time: '01:45', title: '2. Human Amplification', text: 'Burning fossil fuels has increased CO₂ by 50% since the Industrial Revolution.' },
      { time: '03:30', title: '3. Observable Impacts', text: 'Rising sea levels, extreme weather, melting ice caps, and ocean acidification.' },
      { time: '05:15', title: '4. Tipping Points', text: 'Feedback loops like permafrost thaw could trigger irreversible warming.' },
      { time: '06:45', title: '5. Solutions & Hope', text: 'Renewable energy, reforestation, and policy changes can still limit warming.' },
    ],
    summaryTakeaways: [
      'The greenhouse effect is natural, but human activity has intensified it dangerously.',
      'Global average temperature has risen ~1.1°C above pre-industrial levels.',
      'Transitioning to renewable energy is critical to limiting future warming.',
    ],
  },
  {
    id: 'vid-geo-2',
    title: 'Ocean Currents Explained',
    subject: 'Geography',
    topic: 'Oceanography',
    difficulty: 'hard',
    duration: '6:22',
    embedUrl: 'https://www.youtube-nocookie.com/embed/p4pWafuvdrY',
    posterEmoji: '🌊',
    posterGradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    creator: 'TED-Ed',
    description: 'Dive deep into the global conveyor belt of ocean currents and their vital role in regulating climate.',
    chapters: [
      { time: '00:00', title: '1. Surface Currents', text: 'Wind-driven surface currents circulate warm water from the tropics toward the poles.' },
      { time: '01:30', title: '2. Thermohaline Circulation', text: 'Differences in temperature and salinity drive deep ocean currents — the global conveyor belt.' },
      { time: '03:00', title: '3. The Gulf Stream', text: 'This warm Atlantic current keeps Western Europe significantly warmer than its latitude would suggest.' },
      { time: '04:30', title: '4. El Niño & La Niña', text: 'Periodic shifts in Pacific Ocean temperatures affect global weather patterns.' },
      { time: '05:30', title: '5. Climate Regulation', text: 'Ocean currents redistribute heat globally and influence rainfall, fisheries, and ecosystems.' },
    ],
    summaryTakeaways: [
      'Ocean currents are driven by wind, temperature, salinity, and Earth\'s rotation.',
      'The thermohaline circulation acts as a global conveyor belt redistributing heat.',
      'Disruptions to ocean currents can trigger dramatic climate shifts.',
    ],
  },
  {
    id: 'vid-arts-1',
    title: 'The Power of Music in Learning',
    subject: 'Arts',
    topic: 'Music & Cognition',
    difficulty: 'easy',
    duration: '5:10',
    embedUrl: 'https://www.youtube-nocookie.com/embed/R0JKCYZ8hng',
    posterEmoji: '🎵',
    posterGradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    creator: 'TED-Ed',
    description: 'How does music affect the brain? Explore the neuroscience behind melody, rhythm, and memory.',
    chapters: [
      { time: '00:00', title: '1. Music & the Brain', text: 'Listening to music activates multiple brain areas simultaneously, unlike almost any other activity.' },
      { time: '01:15', title: '2. Memory & Melody', text: 'Songs help encode information into long-term memory through rhythm and repetition.' },
      { time: '02:30', title: '3. Emotional Regulation', text: 'Music releases dopamine and can reduce stress, anxiety, and pain perception.' },
      { time: '03:45', title: '4. The Mozart Effect?', text: 'While overstated, musical training does improve spatial reasoning and focus.' },
      { time: '04:30', title: '5. Music as a Study Tool', text: 'Background music can aid concentration — but lyrics may distract during reading tasks.' },
    ],
    summaryTakeaways: [
      'Music engages auditory, motor, and emotional brain regions simultaneously.',
      'Rhythmic patterns help encode and retrieve memories more effectively.',
      'Instrumental music can enhance focus; lyrical music may distract.',
    ],
  },
];

// Subject metadata for filtering and display
const SUBJECTS = [
  { name: 'All', emoji: '📚', color: 'var(--primary)' },
  { name: 'Computer Science', emoji: '💻', color: '#6366F1' },
  { name: 'Biology', emoji: '🧬', color: '#EC4899' },
  { name: 'Physics', emoji: '⚡', color: '#3B82F6' },
  { name: 'Math', emoji: '📐', color: '#8B5CF6' },
  { name: 'History', emoji: '🏛️', color: '#D97706' },
  { name: 'Geography', emoji: '🌍', color: '#0EA5E9' },
  { name: 'Arts', emoji: '🎵', color: '#A78BFA' },
];

const DIFFICULTY_BADGES = {
  easy: { label: 'Beginner', className: 'badge badge-emerald', color: '#10B981' },
  medium: { label: 'Intermediate', className: 'badge badge-amber', color: '#F59E0B' },
  hard: { label: 'Advanced', className: 'badge badge-primary', color: '#EF4444' },
};

// ─── Featured / Recommended IDs ────────────────────────────────────────────
const FEATURED_IDS = ['vid-cs-1', 'vid-bio-1', 'vid-phy-1', 'vid-geo-1'];

export const VideoLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playChime, speakText, isSpeaking, stopSpeech, announce, reducedMotion, dyslexicFont, textSize, highContrast } = useAccessibility();
  const toast = useToast();

  // ─── State ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeVideo, setActiveVideo] = useState(null); // expanded player
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adaptlearn_video_bookmarks') || '[]');
    } catch { return []; }
  });
  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adaptlearn_video_watched') || '[]');
    } catch { return []; }
  });
  const [continueWatchingIds, setContinueWatchingIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adaptlearn_video_continue') || '[]');
    } catch { return []; }
  });
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [playerNotes, setPlayerNotes] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');

  // Persist bookmarks & watched
  useEffect(() => {
    localStorage.setItem('adaptlearn_video_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('adaptlearn_video_watched', JSON.stringify(watchedIds));
  }, [watchedIds]);

  useEffect(() => {
    localStorage.setItem('adaptlearn_video_continue', JSON.stringify(continueWatchingIds));
  }, [continueWatchingIds]);

  // ─── Filtering ──────────────────────────────────────────────────────────
  const filteredVideos = VIDEO_CATALOG.filter((v) => {
    const matchesSubject = selectedSubject === 'All' || v.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'All' || v.difficulty === selectedDifficulty;
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  const featuredVideos = VIDEO_CATALOG.filter((v) => FEATURED_IDS.includes(v.id));
  const continueWatchingVideos = VIDEO_CATALOG.filter((v) => continueWatchingIds.includes(v.id));

  // ─── Handlers ───────────────────────────────────────────────────────────
  const openVideo = (video) => {
    playChime('click');
    setActiveVideo(video);
    setActiveChapterIndex(0);
    setPlayerNotes('');
    setPlaybackSpeed('1x');

    // Track "continue watching"
    if (!continueWatchingIds.includes(video.id)) {
      setContinueWatchingIds((prev) => [video.id, ...prev].slice(0, 6));
    }

    announce(`Now playing: ${video.title} by ${video.creator}`);
    toast.info(`Loading video: ${video.title}`);
  };

  const closeVideo = () => {
    playChime('click');
    setActiveVideo(null);
    announce('Video player closed');
  };

  const markWatched = (videoId) => {
    playChime('success');
    if (!watchedIds.includes(videoId)) {
      setWatchedIds((prev) => [...prev, videoId]);
      toast.success('Video marked as watched! 🎉');
      announce('Video marked as completed');
    }
  };

  const toggleBookmark = (e, videoId) => {
    e.stopPropagation();
    playChime('click');
    setBookmarkedIds((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
    const action = bookmarkedIds.includes(videoId) ? 'removed from' : 'added to';
    toast.info(`Video ${action} bookmarks`);
    announce(`Video ${action} bookmarks`);
  };

  const handleListenChapter = (chapter) => {
    playChime('click');
    speakText(`${chapter.title}. ${chapter.text}`);
    toast.info(`Reading aloud: ${chapter.title}`);
  };

  const handleListenAllTranscript = () => {
    if (!activeVideo) return;
    playChime('success');
    const fullText = activeVideo.chapters.map((c) => `${c.title}: ${c.text}`).join('. ');
    speakText(`Video transcript for ${activeVideo.title}. ${fullText}`);
    toast.success('Reading full transcript aloud');
  };

  const handleListenTakeaways = () => {
    if (!activeVideo) return;
    playChime('click');
    speakText(`Key takeaways from ${activeVideo.title}: ${activeVideo.summaryTakeaways.join('. ')}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedDifficulty('All');
    playChime('click');
    announce('Filters cleared');
  };

  const cyclePlaybackSpeed = () => {
    const speeds = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(next);
    playChime('click');
    announce(`Playback speed set to ${next}`);
  };

  // ─── Render Helpers ─────────────────────────────────────────────────────

  const renderVideoCard = (video, idx) => {
    const isWatched = watchedIds.includes(video.id);
    const isBookmarked = bookmarkedIds.includes(video.id);
    const diffBadge = DIFFICULTY_BADGES[video.difficulty];

    return (
      <div
        key={video.id}
        className={`card ${!reducedMotion ? 'animate-fade-in' : ''}`}
        style={{
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          overflow: 'hidden',
          animationDelay: reducedMotion ? '0ms' : `${idx * 60}ms`,
          animationFillMode: 'both',
        }}
        onClick={() => openVideo(video)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(video); } }}
        tabIndex={0}
        role="button"
        aria-label={`Play video: ${video.title} by ${video.creator}. ${video.duration} long. Difficulty: ${diffBadge.label}. Subject: ${video.subject}.`}
      >
        {/* Thumbnail */}
        <div
          style={{
            background: video.posterGradient,
            height: viewMode === 'list' ? '100px' : '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: viewMode === 'list' ? 'var(--radius-md)' : undefined,
            minWidth: viewMode === 'list' ? '160px' : undefined,
          }}
        >
          <span style={{ fontSize: viewMode === 'list' ? '2rem' : '3rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
            {video.posterEmoji}
          </span>
          {/* Play overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
            className="video-play-overlay"
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={22} color="#000" style={{ marginLeft: '2px' }} />
            </div>
          </div>
          {/* Duration badge */}
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            <Clock size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            {video.duration}
          </span>
          {/* Watched badge */}
          {isWatched && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: '#10B981',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <CheckCircle2 size={10} /> Watched
            </span>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: viewMode === 'list' ? '0.75rem 1rem' : '1rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className={diffBadge.className} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
              {diffBadge.label}
            </span>
            <span className="badge badge-sky" style={{ fontSize: '0.68rem' }}>
              {video.subject}
            </span>
          </div>
          {continueWatchingIds.includes(video.id) && !watchedIds.includes(video.id) && (
            <div style={{ marginBottom: '0.4rem' }} title="Watch progress">
              <div style={{ height: '3px', borderRadius: '2px', background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '2px',
                  background: 'var(--primary)',
                  width: `${40 + ((video.id.charCodeAt(video.id.length - 1) * 17) % 31)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--text-main)', lineHeight: 1.3 }}>
            {video.title}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {video.creator}
            </span>
            <button
              onClick={(e) => toggleBookmark(e, video.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isBookmarked ? '#F59E0B' : 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.15s ease',
              }}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this video'}
              aria-label={isBookmarked ? `Remove bookmark from ${video.title}` : `Bookmark ${video.title}`}
            >
              <Bookmark size={16} fill={isBookmarked ? '#F59E0B' : 'none'} />
            </button>
          </div>
        </div>

        {/* Inline hover style for play overlay */}
        <style>{`
          .card:hover .video-play-overlay,
          .card:focus-within .video-play-overlay {
            opacity: 1 !important;
          }
          .card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg) !important;
          }
        `}</style>
      </div>
    );
  };

  // ─── Video Player Expanded View ─────────────────────────────────────────

  const renderVideoPlayer = () => {
    if (!activeVideo) return null;
    const currentChapter = activeVideo.chapters[activeChapterIndex] || activeVideo.chapters[0];
    const diffBadge = DIFFICULTY_BADGES[activeVideo.difficulty];
    const isWatched = watchedIds.includes(activeVideo.id);

    return (
      <div
        className={!reducedMotion ? 'animate-fade-in' : ''}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: '2rem 1rem',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Video player: ${activeVideo.title}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}
        onKeyDown={(e) => { if (e.key === 'Escape') closeVideo(); }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '1.75rem',
            borderRadius: 'var(--radius-xl, var(--radius-lg))',
            position: 'relative',
            maxHeight: '95vh',
            overflowY: 'auto',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeVideo}
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, padding: '0.3rem 0.5rem' }}
            title="Close video player"
            aria-label="Close video player"
          >
            <X size={16} />
          </button>

          {/* Back button */}
          <button
            onClick={closeVideo}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
            title="Back to video library"
            aria-label="Back to video library"
          >
            <ArrowLeft size={14} /> Back to Library
          </button>

          {/* Video header */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Video size={12} /> Video Lesson
              </span>
              <span className={diffBadge.className} style={{ fontSize: '0.72rem' }}>{diffBadge.label}</span>
              <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>{activeVideo.subject}</span>
              <span className="badge badge-secondary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} /> {activeVideo.duration}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-main)' }}>
              {activeVideo.title}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              by {activeVideo.creator}
            </span>
          </div>

          {/* Accessibility controls bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setCaptionsEnabled(!captionsEnabled); playChime('click'); announce(`Captions ${!captionsEnabled ? 'enabled' : 'disabled'}`); }}
              className={`btn btn-sm ${captionsEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              title="Toggle closed captions"
              aria-label={`Toggle closed captions, currently ${captionsEnabled ? 'on' : 'off'}`}
              aria-pressed={captionsEnabled}
            >
              <Subtitles size={14} /> CC {captionsEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleListenAllTranscript}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              title="Read complete transcript aloud"
              aria-label="Read full video transcript aloud"
            >
              <Headphones size={14} /> Read Transcript
            </button>

            {isSpeaking && (
              <button
                onClick={() => { stopSpeech(); playChime('click'); }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#EF4444' }}
                title="Stop speech"
                aria-label="Stop reading aloud"
              >
                <VolumeX size={14} /> Stop
              </button>
            )}

            <button
              onClick={cyclePlaybackSpeed}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}
              title={`Playback speed: ${playbackSpeed}. Click to change.`}
              aria-label={`Change playback speed, currently ${playbackSpeed}`}
            >
              <TrendingUp size={14} /> {playbackSpeed}
            </button>

            {!isWatched && (
              <button
                onClick={() => markWatched(activeVideo.id)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', marginLeft: 'auto' }}
                title="Mark as watched"
                aria-label="Mark this video as watched"
              >
                <CheckCircle2 size={14} /> Mark Watched
              </button>
            )}
            {isWatched && (
              <span className="badge badge-emerald" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Watched
              </span>
            )}
          </div>

          {/* Two-column responsive layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}>
            {/* Left column: Video + Captions */}
            <div style={{ minWidth: 0 }}>
              {/* Embedded Video Player */}
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#000',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '1.25rem',
              border: '2px solid var(--border-color)',
            }}
          >
            <iframe
              src={`${activeVideo.embedUrl}?rel=0&modestbranding=1&cc_load_policy=${captionsEnabled ? 1 : 0}`}
              title={activeVideo.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Captions / Live subtitle bar */}
          {captionsEnabled && (
            <div
              role="status"
              aria-live="polite"
              style={{
                backgroundColor: '#1E1B24',
                color: '#FDE047',
                padding: '0.85rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '2px solid #CA8A04',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                <span className="badge badge-amber" style={{ fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
                  CC [{currentChapter.time}]
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.4 }}>
                  {currentChapter.text}
                </div>
              </div>
              <button
                onClick={() => handleListenChapter(currentChapter)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="Read this caption aloud"
                aria-label="Read current caption line aloud"
              >
                <Volume2 size={16} />
              </button>
            </div>
          )}
            </div>

            {/* Right column: Chapters + Notes */}
            <div style={{ minWidth: 0 }}>
          {/* Chapter Navigation */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Clock size={16} color="var(--primary)" />
              Chapter Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activeVideo.chapters.map((ch, idx) => {
                const isActive = activeChapterIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => { setActiveChapterIndex(idx); playChime('click'); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveChapterIndex(idx); playChime('click'); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Jump to chapter: ${ch.title} at ${ch.time}`}
                    aria-pressed={isActive}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge badge-sky" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                        {ch.time}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleListenChapter(ch); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '2px' }}
                        title={`Read chapter "${ch.title}" aloud`}
                        aria-label={`Read chapter ${ch.title} aloud`}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {ch.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                      {ch.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Takeaways */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <Sparkles size={16} color="var(--primary)" />
                Key Takeaways
              </h4>
              <button
                onClick={handleListenTakeaways}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                title="Read takeaways aloud"
                aria-label="Read key takeaways aloud"
              >
                <Volume2 size={13} /> Listen
              </button>
            </div>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {activeVideo.summaryTakeaways.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Notes area */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <BookOpen size={15} color="var(--primary)" />
              My Notes
            </h4>
            <textarea
              value={playerNotes}
              onChange={(e) => setPlayerNotes(e.target.value)}
              placeholder="Jot down key ideas, questions, or reflections while watching…"
              style={{
                width: '100%',
                minHeight: '90px',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                resize: 'vertical',
                fontFamily: dyslexicFont ? 'OpenDyslexic, sans-serif' : 'inherit',
              }}
              aria-label="Personal notes for this video"
            />
          </div>

            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-main)' }}>About this video:</strong> {activeVideo.description}
            </p>
          </div>

          {/* Related Videos */}
          {(() => {
            const related = VIDEO_CATALOG.filter(v => v.subject === activeVideo.subject && v.id !== activeVideo.id).slice(0, 3);
            if (related.length === 0) return null;
            return (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Star size={15} color="#F59E0B" />
                  You might also like
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {related.map((rv) => (
                    <div
                      key={rv.id}
                      onClick={() => openVideo(rv)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(rv); } }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Play related video: ${rv.title}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                        flex: '1 1 260px',
                        minWidth: '260px',
                      }}
                    >
                      <div style={{
                        width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                        background: rv.posterGradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{rv.posterEmoji}</span>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rv.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> {rv.duration} · {rv.creator}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  // ─── Main Page Render ───────────────────────────────────────────────────
  const hasActiveFilters = searchQuery || selectedSubject !== 'All' || selectedDifficulty !== 'All';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />

      {/* Hero Banner */}
      <div className={!reducedMotion ? 'animate-fade-in' : ''} style={{ marginBottom: '2rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl, var(--radius-lg))',
            padding: '2rem 2rem 1.75rem',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 100%)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)',
          }}
        >
          {/* Animated gradient glow border */}
          {!reducedMotion && (
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: 'inherit',
                background: 'linear-gradient(135deg, #6366F1, #EC4899, #F59E0B, #10B981, #6366F1)',
                backgroundSize: '300% 300%',
                animation: 'heroGradientShift 6s ease infinite',
                zIndex: 0,
                filter: 'blur(6px)',
                opacity: 0.5,
              }}
            />
          )}
          {/* Inner content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Video size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                  🎬 Video Learning Studio
                </h1>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', margin: '0.2rem 0 0 0', lineHeight: 1.5, maxWidth: '600px' }}>
                  Watch, learn, and master any subject with curated educational videos — fully accessible with captions, audio descriptions, and interactive chapters
                </p>
              </div>
            </div>

            {/* Quick-action row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { if (featuredVideos.length > 0) openVideo(featuredVideos[0]); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.95)', color: '#6366F1',
                  border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
                  transition: 'transform 0.15s ease',
                }}
                title="Watch the first featured video"
                aria-label="Watch featured video"
              >
                <Play size={14} /> Watch Featured
              </button>
              <button
                onClick={() => { setSelectedSubject('All'); setSelectedDifficulty('All'); setSearchQuery(''); setShowFilters(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                  backdropFilter: 'blur(4px)',
                }}
                title="View my bookmarks"
                aria-label={`My Bookmarks: ${bookmarkedIds.length}`}
              >
                <Bookmark size={14} /> My Bookmarks ({bookmarkedIds.length})
              </button>
              <span
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.82rem',
                  backdropFilter: 'blur(4px)',
                }}
                aria-label={`${watchedIds.length} videos completed`}
              >
                <CheckCircle2 size={14} /> {watchedIds.length} Completed
              </span>
            </div>

            {/* Progress indicator */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  Learning Progress
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#fff' }}>
                  {watchedIds.length}/{VIDEO_CATALOG.length} watched ({VIDEO_CATALOG.length > 0 ? Math.round((watchedIds.length / VIDEO_CATALOG.length) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, #FDE047, #10B981)',
                    width: `${VIDEO_CATALOG.length > 0 ? Math.round((watchedIds.length / VIDEO_CATALOG.length) * 100) : 0}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Video size={12} /> {VIDEO_CATALOG.length} Videos
          </span>
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} /> {watchedIds.length} Watched
          </span>
          <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bookmark size={12} /> {bookmarkedIds.length} Bookmarked
          </span>
          <span className="badge badge-sky" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} /> {SUBJECTS.length - 1} Subjects
          </span>
          <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> ~{VIDEO_CATALOG.reduce((sum, v) => { const parts = v.duration.split(':'); return sum + parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10); }, 0)} min of content
          </span>
        </div>

        {/* Animated gradient keyframes */}
        <style>{`
          @keyframes heroGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* Search & Filter Bar */}
      <div
        className={`card ${!reducedMotion ? 'animate-fade-in' : ''}`}
        style={{ padding: '1.25rem', marginBottom: '1.5rem', animationDelay: '80ms', animationFillMode: 'both' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search input */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title, subject, topic, or creator…"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
              aria-label="Search videos"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => { setShowFilters(!showFilters); playChime('click'); }}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Toggle filters"
            aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
            aria-expanded={showFilters}
          >
            <Filter size={14} /> Filters
          </button>

          {/* View mode toggles */}
          <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setViewMode('grid'); playChime('click'); }}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0, padding: '0.45rem 0.65rem', borderRight: '1px solid var(--border-color)' }}
              title="Grid view"
              aria-label="Switch to grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => { setViewMode('list'); playChime('click'); }}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0, padding: '0.45rem 0.65rem' }}
              title="List view"
              aria-label="Switch to list view"
              aria-pressed={viewMode === 'list'}
            >
              <List size={14} />
            </button>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem', color: '#EF4444' }}
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {/* Subject filter */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                Subject
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {SUBJECTS.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => { setSelectedSubject(s.name); playChime('click'); announce(`Filtering by ${s.name}`); }}
                    className={`btn btn-sm ${selectedSubject === s.name ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    aria-pressed={selectedSubject === s.name}
                    title={`Filter by ${s.name}`}
                    aria-label={`Filter by subject: ${s.name}`}
                  >
                    <span>{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty filter */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                Difficulty
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['All', 'easy', 'medium', 'hard'].map((d) => {
                  const label = d === 'All' ? 'All Levels' : DIFFICULTY_BADGES[d]?.label || d;
                  return (
                    <button
                      key={d}
                      onClick={() => { setSelectedDifficulty(d); playChime('click'); announce(`Filtering by difficulty: ${label}`); }}
                      className={`btn btn-sm ${selectedDifficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                      aria-pressed={selectedDifficulty === d}
                      title={`Filter by ${label}`}
                      aria-label={`Filter by difficulty: ${label}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Path / Subject Showcase */}
      {!hasActiveFilters && (
        <div style={{ marginBottom: '1.75rem' }} className={!reducedMotion ? 'animate-fade-in' : ''}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Explore by Subject
            </h2>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '0.5rem',
              WebkitOverflowScrolling: 'touch',
            }}
            className="hide-scrollbar"
          >
            {SUBJECTS.filter(s => s.name !== 'All').map((subj, idx) => {
              const count = VIDEO_CATALOG.filter(v => v.subject === subj.name).length;
              const gradients = [
                'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
                'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
                'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
              ];
              return (
                <div
                  key={subj.name}
                  onClick={() => { setSelectedSubject(subj.name); setShowFilters(false); playChime('click'); announce(`Filtering by ${subj.name}`); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSubject(subj.name); playChime('click'); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Browse ${subj.name} — ${count} videos`}
                  style={{
                    scrollSnapAlign: 'start',
                    minWidth: '150px',
                    padding: '1.15rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: gradients[idx % gradients.length],
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    flexShrink: 0,
                    color: '#fff',
                    boxShadow: selectedSubject === subj.name ? '0 0 0 3px var(--primary), var(--shadow-lg)' : 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.12))',
                    transform: selectedSubject === subj.name ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>{subj.emoji}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, display: 'block' }}>{subj.name}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>{count} video{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>
      )}

      {/* Continue Watching Section */}
      {continueWatchingVideos.length > 0 && !hasActiveFilters && (
        <div style={{ marginBottom: '2rem' }} className={!reducedMotion ? 'animate-fade-in' : ''}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Play size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Continue Watching
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {continueWatchingVideos.map((v, i) => renderVideoCard(v, i))}
          </div>
        </div>
      )}

      {/* Featured / Recommended Section */}
      {!hasActiveFilters && (
        <div style={{ marginBottom: '2rem' }} className={!reducedMotion ? 'animate-fade-in' : ''}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Star size={18} color="#F59E0B" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Featured & Recommended
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {featuredVideos.map((v, i) => renderVideoCard(v, i))}
          </div>
        </div>
      )}

      {/* All Videos / Filtered Results */}
      <div className={!reducedMotion ? 'animate-fade-in' : ''}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {hasActiveFilters ? 'Search Results' : 'All Videos'}
            </h2>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredVideos.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No videos found
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Try adjusting your search or filters to discover more content.
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem' }}
              title="Clear all filters"
              aria-label="Clear all search filters"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'list'
                ? '1fr'
                : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredVideos.map((v, i) => (
              <div
                key={v.id}
                style={viewMode === 'list' ? { display: 'flex', gap: 0 } : undefined}
              >
                {viewMode === 'list' ? (
                  // List view card
                  <div
                    className={`card ${!reducedMotion ? 'animate-fade-in' : ''}`}
                    style={{
                      display: 'flex',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      overflow: 'hidden',
                      width: '100%',
                      animationDelay: reducedMotion ? '0ms' : `${i * 40}ms`,
                      animationFillMode: 'both',
                    }}
                    onClick={() => openVideo(v)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(v); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Play video: ${v.title} by ${v.creator}. ${v.duration} long. ${DIFFICULTY_BADGES[v.difficulty].label}.`}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        background: v.posterGradient,
                        minWidth: '160px',
                        width: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{v.posterEmoji}</span>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#fff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        {v.duration}
                      </span>
                      {watchedIds.includes(v.id) && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            background: '#10B981',
                            color: '#fff',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ padding: '0.75rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span className={DIFFICULTY_BADGES[v.difficulty].className} style={{ fontSize: '0.65rem' }}>
                          {DIFFICULTY_BADGES[v.difficulty].label}
                        </span>
                        <span className="badge badge-sky" style={{ fontSize: '0.65rem' }}>{v.subject}</span>
                      </div>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                        {v.title}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {v.description}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {v.creator}
                      </span>
                    </div>
                    {/* Bookmark */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem' }}>
                      <button
                        onClick={(e) => toggleBookmark(e, v.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: bookmarkedIds.includes(v.id) ? '#F59E0B' : 'var(--text-muted)',
                          padding: '4px',
                        }}
                        title={bookmarkedIds.includes(v.id) ? 'Remove bookmark' : 'Bookmark video'}
                        aria-label={bookmarkedIds.includes(v.id) ? `Remove bookmark from ${v.title}` : `Bookmark ${v.title}`}
                      >
                        <Bookmark size={16} fill={bookmarkedIds.includes(v.id) ? '#F59E0B' : 'none'} />
                      </button>
                    </div>
                  </div>
                ) : (
                  renderVideoCard(v, i)
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Video Player Modal */}
      {renderVideoPlayer()}
    </div>
  );
};
