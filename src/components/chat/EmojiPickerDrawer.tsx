import React, { useState } from 'react';
import { CHAT_EMOJIS } from '../../utils/chatModeration';
import { X, Sparkles, Flame } from 'lucide-react';

interface EmojiPickerDrawerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPickerDrawer: React.FC<EmojiPickerDrawerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CHAT_EMOJIS>('quick');

  const categories: { id: keyof typeof CHAT_EMOJIS; label: string; icon: string }[] = [
    { id: 'quick', label: 'Quick', icon: '⚡' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'celebrate', label: 'Hype', icon: '🔥' },
    { id: 'ghana', label: 'Ghana', icon: '🇬🇭' },
    { id: 'reactions', label: 'Reactions', icon: '👍' },
  ];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-40 bg-[#150d06] border border-orange-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 text-white select-none">
      {/* Category Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-orange-500/20">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'bg-black/40 text-gray-400 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-[11px]">{cat.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors ml-2 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1">
        {CHAT_EMOJIS[activeCategory].map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            onClick={() => onSelectEmoji(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-xl hover:bg-orange-500/20 hover:scale-125 active:scale-95 transition-all cursor-pointer bg-black/30 border border-transparent hover:border-orange-500/40"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
