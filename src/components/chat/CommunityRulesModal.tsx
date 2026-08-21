import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ShieldCheck, X, AlertTriangle, CheckCircle2, MessageSquare, Flame } from 'lucide-react';

export const CommunityRulesModal: React.FC = () => {
  const { isRulesModalOpen, setIsRulesModalOpen } = useChat();

  if (!isRulesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#130b04] border border-orange-500/40 rounded-2xl p-5 text-white shadow-[0_0_50px_rgba(249,115,22,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight text-white">
                CHRISFIXBET Community Standards
              </h3>
              <p className="text-[10px] text-orange-400 font-mono">Live Match Chatroom Rules 🇬🇭</p>
            </div>
          </div>
          <button
            onClick={() => setIsRulesModalOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Body */}
        <div className="py-4 space-y-3 text-xs text-gray-300">
          <div className="p-3 bg-black/50 rounded-xl border border-gray-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-orange-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. Positive Sports Banter</span>
            </div>
            <p className="text-[11px] text-gray-400 pl-5">
              Cheer on your teams, share match predictions, celebrate wins, and engage respectfully with other Ghanaian punters.
            </p>
          </div>

          <div className="p-3 bg-black/50 rounded-xl border border-gray-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>2. Zero Tolerance for Match-Fixing Scams</span>
            </div>
            <p className="text-[11px] text-gray-400 pl-5">
              Promoting WhatsApp numbers, Telegram links, or selling "fixed games" leads to an immediate permanent IP & account ban.
            </p>
          </div>

          <div className="p-3 bg-black/50 rounded-xl border border-gray-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>3. Anti-Spam & Automated Moderation</span>
            </div>
            <p className="text-[11px] text-gray-400 pl-5">
              Messages are filtered in real-time. Repeated character flooding, hate speech, and abusive language are automatically blocked.
            </p>
          </div>

          <div className="p-3 bg-black/50 rounded-xl border border-gray-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-green-400 font-bold">
              <Flame className="w-4 h-4 shrink-0" />
              <span>4. Responsible Gaming 18+</span>
            </div>
            <p className="text-[11px] text-gray-400 pl-5">
              Never bet more than you can afford to lose. Sports betting is entertainment.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-2">
          <button
            onClick={() => setIsRulesModalOpen(false)}
            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
