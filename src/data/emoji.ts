export interface EmojiEntry {
  char: string;
  label: string;
  keywords: string[];
}

export interface EmojiCategory {
  name: string;
  items: EmojiEntry[];
}

/** A curated (not exhaustive) set of emoji relevant to wedding table decoration,
 *  grouped for browsing and searchable by label/keyword. */
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Wedding & Love',
    items: [
      { char: '💍', label: 'ring', keywords: ['ring', 'engagement', 'wedding', 'diamond'] },
      { char: '💒', label: 'chapel', keywords: ['wedding', 'chapel', 'church'] },
      { char: '👰', label: 'bride', keywords: ['bride', 'wedding', 'veil'] },
      { char: '🤵', label: 'groom', keywords: ['groom', 'tuxedo', 'wedding'] },
      { char: '💐', label: 'bouquet', keywords: ['flowers', 'bouquet', 'wedding'] },
      { char: '❤️', label: 'red heart', keywords: ['love', 'heart', 'red'] },
      { char: '🧡', label: 'orange heart', keywords: ['love', 'heart', 'orange'] },
      { char: '💛', label: 'yellow heart', keywords: ['love', 'heart', 'yellow'] },
      { char: '💚', label: 'green heart', keywords: ['love', 'heart', 'green'] },
      { char: '💙', label: 'blue heart', keywords: ['love', 'heart', 'blue'] },
      { char: '💜', label: 'purple heart', keywords: ['love', 'heart', 'purple'] },
      { char: '🖤', label: 'black heart', keywords: ['love', 'heart', 'black'] },
      { char: '🤍', label: 'white heart', keywords: ['love', 'heart', 'white'] },
      { char: '💕', label: 'two hearts', keywords: ['love', 'hearts'] },
      { char: '💖', label: 'sparkling heart', keywords: ['love', 'heart', 'sparkle'] },
      { char: '💗', label: 'growing heart', keywords: ['love', 'heart'] },
      { char: '💞', label: 'revolving hearts', keywords: ['love', 'hearts'] },
      { char: '💘', label: 'heart with arrow', keywords: ['love', 'cupid'] },
      { char: '💝', label: 'heart with ribbon', keywords: ['love', 'gift'] },
      { char: '😍', label: 'heart eyes', keywords: ['love', 'face'] },
      { char: '🥰', label: 'smiling face with hearts', keywords: ['love', 'face'] },
      { char: '💑', label: 'couple with heart', keywords: ['couple', 'love'] },
      { char: '💏', label: 'kiss', keywords: ['couple', 'kiss'] },
    ],
  },
  {
    name: 'Celebration',
    items: [
      { char: '🎉', label: 'party popper', keywords: ['party', 'celebration'] },
      { char: '🎊', label: 'confetti ball', keywords: ['party', 'confetti'] },
      { char: '🥂', label: 'clinking glasses', keywords: ['toast', 'champagne', 'cheers'] },
      { char: '🍾', label: 'champagne', keywords: ['bottle', 'champagne', 'celebration'] },
      { char: '🎂', label: 'cake', keywords: ['cake', 'birthday', 'wedding'] },
      { char: '🎈', label: 'balloon', keywords: ['balloon', 'party'] },
      { char: '✨', label: 'sparkles', keywords: ['sparkle', 'shine', 'magic'] },
      { char: '🕊️', label: 'dove', keywords: ['dove', 'peace', 'bird'] },
      { char: '🎶', label: 'musical notes', keywords: ['music', 'notes'] },
      { char: '🎇', label: 'sparkler', keywords: ['fireworks', 'sparkle'] },
    ],
  },
  {
    name: 'Flowers & Nature',
    items: [
      { char: '🌸', label: 'cherry blossom', keywords: ['flower', 'blossom'] },
      { char: '🌺', label: 'hibiscus', keywords: ['flower'] },
      { char: '🌷', label: 'tulip', keywords: ['flower', 'tulip'] },
      { char: '🌹', label: 'rose', keywords: ['flower', 'rose'] },
      { char: '🌻', label: 'sunflower', keywords: ['flower', 'sunflower'] },
      { char: '💮', label: 'white flower', keywords: ['flower'] },
      { char: '🍀', label: 'four leaf clover', keywords: ['luck', 'clover'] },
      { char: '🌿', label: 'herb', keywords: ['leaf', 'greenery'] },
      { char: '🕯️', label: 'candle', keywords: ['candle', 'light'] },
      { char: '🌙', label: 'crescent moon', keywords: ['moon', 'night'] },
    ],
  },
  {
    name: 'Animals',
    items: [
      { char: '🦋', label: 'butterfly', keywords: ['butterfly'] },
      { char: '🐝', label: 'bee', keywords: ['bee'] },
      { char: '🐦', label: 'bird', keywords: ['bird'] },
      { char: '🦢', label: 'swan', keywords: ['swan', 'bird'] },
      { char: '🐇', label: 'rabbit', keywords: ['rabbit'] },
      { char: '🐻', label: 'bear', keywords: ['bear'] },
      { char: '🐶', label: 'dog', keywords: ['dog'] },
      { char: '🐱', label: 'cat', keywords: ['cat'] },
    ],
  },
  {
    name: 'Food & Drink',
    items: [
      { char: '🍰', label: 'shortcake', keywords: ['cake', 'dessert'] },
      { char: '🧁', label: 'cupcake', keywords: ['cupcake', 'dessert'] },
      { char: '🍫', label: 'chocolate', keywords: ['chocolate'] },
      { char: '🍓', label: 'strawberry', keywords: ['fruit', 'strawberry'] },
      { char: '🍇', label: 'grapes', keywords: ['fruit', 'grapes'] },
      { char: '🍷', label: 'wine glass', keywords: ['wine', 'drink'] },
      { char: '🍸', label: 'cocktail', keywords: ['cocktail', 'drink'] },
      { char: '☕', label: 'coffee', keywords: ['coffee', 'drink'] },
    ],
  },
  {
    name: 'Symbols & Numbers',
    items: [
      { char: '⭐', label: 'star', keywords: ['star'] },
      { char: '🌟', label: 'glowing star', keywords: ['star', 'glow'] },
      { char: '🔔', label: 'bell', keywords: ['bell'] },
      { char: '🎀', label: 'ribbon', keywords: ['ribbon', 'bow'] },
      { char: '💫', label: 'dizzy', keywords: ['sparkle', 'star'] },
      { char: '👑', label: 'crown', keywords: ['crown', 'royal'] },
      { char: '🔑', label: 'key', keywords: ['key'] },
      { char: '1️⃣', label: 'one', keywords: ['number', 'one', '1'] },
      { char: '2️⃣', label: 'two', keywords: ['number', 'two', '2'] },
      { char: '3️⃣', label: 'three', keywords: ['number', 'three', '3'] },
      { char: '4️⃣', label: 'four', keywords: ['number', 'four', '4'] },
      { char: '5️⃣', label: 'five', keywords: ['number', 'five', '5'] },
      { char: '6️⃣', label: 'six', keywords: ['number', 'six', '6'] },
      { char: '7️⃣', label: 'seven', keywords: ['number', 'seven', '7'] },
      { char: '8️⃣', label: 'eight', keywords: ['number', 'eight', '8'] },
      { char: '9️⃣', label: 'nine', keywords: ['number', 'nine', '9'] },
      { char: '🔟', label: 'ten', keywords: ['number', 'ten', '10'] },
    ],
  },
];
