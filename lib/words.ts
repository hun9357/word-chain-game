// 365 starting words for daily puzzles (one per day)
export const DAILY_WORDS = [
  "APPLE", "BRAIN", "CLOUD", "DANCE", "EAGLE", "FLAME", "GRAPE", "HOUSE", "IMAGE", "JUICE",
  "KNIFE", "LEMON", "MANGO", "NOBLE", "OCEAN", "PIANO", "QUEEN", "RIVER", "STONE", "TIGER",
  "URBAN", "VIVID", "WATER", "XENON", "YOUTH", "ZEBRA", "ANGEL", "BREAD", "CHAIR", "DREAM",
  "EARTH", "FROST", "GLOBE", "HEART", "IVORY", "JOLLY", "KNACK", "LIGHT", "MONEY", "NIGHT",
  "ORBIT", "PEACE", "QUICK", "ROYAL", "SWIFT", "TRUTH", "UNCLE", "VOICE", "WHALE", "YOUNG",
  "ABUSE", "BENCH", "CHARM", "DEVIL", "ENTRY", "FIELD", "GHOST", "HAPPY", "INDEX", "JOINT",
  "KARMA", "LOGIC", "MAGIC", "NORTH", "OPERA", "PARTY", "QUIET", "RADIO", "SMILE", "TOWER",
  "UNITY", "VIRUS", "WORLD", "YACHT", "ZONAL", "ALERT", "BOARD", "CRASH", "DEPTH", "ENERGY",
  "FOCUS", "GRAND", "HONOR", "INPUT", "JUDGE", "KNOWN", "LABOR", "MATCH", "NINTH", "ORDER",
  "POWER", "QUOTA", "RANGE", "SCALE", "TRADE", "UNION", "VALUE", "WHOLE", "YIELD", "ZONES",
  "ACTOR", "BATCH", "CABIN", "DAILY", "EMPTY", "FLOOR", "GLASS", "HABIT", "IDEAL", "JEWEL",
  "KIOSK", "LARGE", "MINOR", "NAVAL", "OLIVE", "PIANO", "QUILT", "RAISE", "SOLAR", "THICK",
  "UPPER", "VALID", "WOMAN", "YOUTH", "ADOPT", "BRAKE", "CLAIM", "DRAFT", "ELECT", "FLEET",
  "GRAIN", "HEAVY", "INNER", "JOINT", "LABEL", "MOTOR", "NOVEL", "OUTER", "PHASE", "QUEST",
  "RAPID", "SHIFT", "THROW", "UNDER", "VITAL", "WASTE", "ADULT", "BASIC", "CIVIL", "DONOR",
  "EXACT", "FIBER", "GUIDE", "HENCE", "INTRO", "LASER", "METAL", "NURSE", "ORBIT", "PLANT",
  "QUOTE", "RELAX", "SOLID", "TOTAL", "URBAN", "VISIT", "WIDTH", "ACRES", "BONUS", "CLOCK",
  "DOGMA", "EQUAL", "FRESH", "GROUP", "HUMOR", "ISSUE", "LOGIC", "MAPLE", "NOBLE", "OASIS",
  "PRIME", "QUEST", "RATIO", "SUPER", "TEMPT", "ULTRA", "VAGUE", "WORTH", "AGENT", "BLOOM",
  "CREST", "DENSE", "ELITE", "FRAME", "GRASS", "HATCH", "INLET", "JOKER", "KUDOS", "LUNAR",
  "MURAL", "NEXUS", "ONSET", "PIXEL", "QUAKE", "REBEL", "SLATE", "TANGO", "VIGOR", "WRIST",
  "ADAPT", "BLAZE", "CRAFT", "DELTA", "EPOCH", "FLOCK", "GLOOM", "HOVER", "INPUT", "JINX",
  "KNAVE", "LEACH", "MORAL", "NERVE", "OMEGA", "PRISM", "QUIRK", "ROAST", "SPARK", "TRUCE",
  "UNIFY", "VAULT", "WAGON", "YACHT", "ABIDE", "BLESS", "CHOIR", "DWELL", "EVOKE", "FORGE",
  "GRIND", "HASTE", "IRONY", "JEWEL", "KINDA", "LYNCH", "MOTEL", "NOTCH", "OPTIC", "PLANK",
  "QUALM", "RIDGE", "STEER", "TAUNT", "USHER", "VIGOR", "WRECK", "AGENT", "BURST", "CORAL",
  "DECAY", "EMBED", "FROST", "GLAZE", "HAVEN", "INGOT", "JOUST", "KNEAD", "LOTUS", "MIXER",
  "NUDGE", "OUNCE", "PLUME", "QUASH", "ROACH", "SPICE", "TREND", "VENOM", "WRATH", "ALIGN",
  "BLUNT", "CLOAK", "DWARF", "EMBER", "FROWN", "GRASP", "HAUNT", "IVORY", "JELLY", "KNEEL",
  "LATCH", "MOURN", "NOTCH", "OXIDE", "PLANK", "QUALM", "RESIN", "SCOUT", "TORSO", "VENUE",
  "WRACK", "ADORE", "BLISS", "CEDAR", "DOUGH", "ETHIC", "FLARE", "GAVEL", "HAVEN", "INDEX",
  "JASMINE", "KNOLL", "LEVER", "MARSH", "NEXUS", "OTTER", "PATCH", "QUIET", "RELISH", "SLEEK",
  "TIARA", "UNLIT", "VIGOR", "WALTZ", "ANIME", "BROIL", "CHALK", "DRAFT", "EVICT", "FLUTE",
  "GROUT", "HOIST", "INLET", "JEWEL", "KAYAK", "LINEN", "MOTTO", "NUDGE", "OCCUR", "PITCH",
  "QUILL", "REALM", "SPOKE", "THORN", "UNWED", "VOWEL", "WHEAT", "ABODE", "BRISK", "CAMEL",
  "DOWRY", "ERUPT", "FEAST", "GREET", "HAVEN", "ICICLE", "JOUST", "KUDOS", "LAPSE", "MEDAL",
  "NIECE", "OPAQUE", "PEACH", "QUART", "RINSE"
];

/**
 * Fixed launch epoch (UTC midnight). Puzzle #1 is this day.
 */
export const LAUNCH_EPOCH_UTC = Date.UTC(2024, 0, 1);

/**
 * Stable puzzle number for a given date, based on whole UTC days since launch.
 * All users worldwide share the same puzzle number on the same UTC day.
 */
export function getPuzzleNumber(date: Date = new Date()): number {
  const dayMs = 86400000;
  const dayUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((dayUTC - LAUNCH_EPOCH_UTC) / dayMs) + 1;
}

/**
 * Start word for an arbitrary puzzle number (wraps around the word list).
 * Supports past/future puzzles for friend challenges.
 */
export function getWordByPuzzleNumber(n: number): string {
  const len = DAILY_WORDS.length;
  const idx = (((n - 1) % len) + len) % len;
  return DAILY_WORDS[idx];
}

/**
 * Today's starting word (UTC-based, deterministic worldwide).
 */
export function getTodayWord(): string {
  return getWordByPuzzleNumber(getPuzzleNumber());
}

/**
 * Get formatted date string for display
 */
export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
