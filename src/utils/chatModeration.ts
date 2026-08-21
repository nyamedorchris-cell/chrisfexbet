// Real-Time Chat Moderation Engine & Emoji Catalog for CHRISFIXBET

// Prohibited terms for sports betting community safety
const PROHIBITED_WORDS = [
  'fixed match',
  'fixed games',
  'fixed score',
  'sure odds on whatsapp',
  'dm me on whatsapp',
  'contact telegram',
  't.me/',
  'whatsapp.com',
  'wa.me',
  'free crypto giveaway',
  'doubler scheme',
  'scammer',
  'scam',
  'fuck',
  'bitch',
  'nigger',
  'cunt',
  'asshole',
  'bastard',
  'idiot',
  'foolish',
  'stfu',
  'kill yourself',
  'suicide',
];

export interface ModerationResult {
  isClean: boolean;
  action: 'allow' | 'censor' | 'reject';
  sanitizedText: string;
  reason?: string;
}

/**
 * Validates and moderates a message before publishing.
 */
export function moderateMessage(rawText: string): ModerationResult {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return {
      isClean: false,
      action: 'reject',
      sanitizedText: '',
      reason: 'Message cannot be empty.',
    };
  }

  if (trimmed.length > 300) {
    return {
      isClean: false,
      action: 'reject',
      sanitizedText: '',
      reason: 'Message exceeds maximum limit of 300 characters.',
    };
  }

  // Anti-spam repeated character flood (e.g. "aaaaa...")
  const repeatRegex = /(.)\1{7,}/i;
  if (repeatRegex.test(trimmed)) {
    return {
      isClean: false,
      action: 'reject',
      sanitizedText: '',
      reason: 'Excessive repeated characters detected (anti-spam filter).',
    };
  }

  const lower = trimmed.toLowerCase();

  // Severe match-fixing scam or external phishing rejection
  const scamKeywords = ['fixed match', 'fixed score', 'dm on whatsapp', 't.me/', 'wa.me', 'sure odds on whatsapp', 'crypto giveaway'];
  for (const scam of scamKeywords) {
    if (lower.includes(scam)) {
      return {
        isClean: false,
        action: 'reject',
        sanitizedText: '',
        reason: 'Violation: Match-fixing promotions and external contact solicitations are strictly prohibited.',
      };
    }
  }

  // Profanity auto-censorship with asterisks
  let censored = trimmed;
  let hasProfanity = false;

  for (const word of PROHIBITED_WORDS) {
    const wordRegex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
    if (wordRegex.test(censored)) {
      hasProfanity = true;
      censored = censored.replace(wordRegex, (match) => '*'.repeat(match.length));
    }
  }

  if (hasProfanity) {
    return {
      isClean: false,
      action: 'censor',
      sanitizedText: censored,
      reason: 'Message was auto-moderated to maintain community standards.',
    };
  }

  return {
    isClean: true,
    action: 'allow',
    sanitizedText: trimmed,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Emoji Categories
export const CHAT_EMOJIS = {
  quick: ['🔥', '⚽', '🏆', '🇬🇭', '💰', '🚀', '👏', '😱', '⚡', '💯'],
  sports: [
    '⚽', '🏀', '🎾', '🥊', '🏈', '⚾', '🏆', '🥇', '🥈', '🥉',
    '🎯', '⚡', '🚀', '💰', '💵', '📈', '🎲', '🎰', '🧤', '👟',
  ],
  celebrate: [
    '🔥', '🥳', '🎉', '👑', '👏', '🤝', '💯', '🤩', '🌟', '🥂',
    '💪', '💥', '🤯', '💃', '🕺', '🍿', '🍾', '🙌', '✨', '🕺',
  ],
  ghana: [
    '🇬🇭', '🦁', '🦅', '☀️', '⭐', '🌍', '🌴', '🥁', '👑', '💛',
  ],
  reactions: [
    '👍', '👎', '🤞', '👀', '🤔', '🤫', '🥶', '🥵', '💸', '🤑',
    '🙏', '❤️', '💔', '🤣', '😭', '😎', '🫡', '🚨', '💣', '💥',
  ],
};

// Preset Ghanaian Punter Usernames & Badges for vibrant live banter
export const SAMPLE_PUNTER_PROFILES = [
  { name: 'Kojo_AccraBet', badge: '🔥 Top Punter', avatarColor: 'from-orange-500 to-amber-600' },
  { name: 'Kwame_Sniper', badge: '⚡ Pro Tipper', avatarColor: 'from-yellow-500 to-red-600' },
  { name: 'Abena_Kumasi', badge: '🇬🇭 Ghana VIP', avatarColor: 'from-green-500 to-emerald-600' },
  { name: 'Nana_OddsMaster', badge: '👑 High Roller', avatarColor: 'from-purple-500 to-indigo-600' },
  { name: 'Esi_GoalHunter', badge: '🎯 Parlay King', avatarColor: 'from-blue-500 to-cyan-600' },
  { name: 'Yaw_Takoradi', badge: '⚡ Speed Cashout', avatarColor: 'from-teal-500 to-blue-600' },
];
