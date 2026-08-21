import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { LiveMatchChatRoom } from './LiveMatchChatRoom';
import { MessageSquare, X, Flame, ShieldAlert, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export const FloatingChatButton: React.FC = () => {
  const { isChatOpen, setIsChatOpen, unreadCount, resetUnreadCount, activeUsersCount, currentRoomId } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (!isChatOpen) {
      setIsChatOpen(true);
      setIsMinimized(false);
      resetUnreadCount();
    } else {
      setIsChatOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isChatOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            id="floating-live-chat-btn"
            onClick={handleToggle}
            className="group relative flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.5)] border border-orange-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 fill-black" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-black animate-pulse" />
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-[12px] leading-none">Live Fan Chat</span>
                <span className="text-[10px]">🇬🇭</span>
              </div>
              <span className="text-[9px] text-black/80 font-mono font-bold leading-none">
                {activeUsersCount} online
              </span>
            </div>

            {unreadCount > 0 && (
              <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-black shadow-lg animate-bounce ring-2 ring-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Floating Pop-up Chat Window */}
      {isChatOpen && (
        <div
          id="floating-chat-window-container"
          className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] shadow-[0_10px_50px_rgba(0,0,0,0.8)] rounded-2xl animate-in zoom-in-95 duration-200"
        >
          {isMinimized ? (
            <div className="bg-[#120a04] border border-orange-500/40 rounded-2xl p-3 flex items-center justify-between shadow-2xl text-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center text-black font-black">
                  <MessageSquare className="w-4 h-4 fill-black" />
                </div>
                <div>
                  <span className="font-bold text-xs">CHRISFIX Live Chat</span>
                  <span className="ml-2 text-[10px] text-emerald-400 font-mono font-bold">
                    🟢 {activeUsersCount} punters
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  title="Expand"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <LiveMatchChatRoom onClose={() => setIsChatOpen(false)} />
            </div>
          )}
        </div>
      )}
    </>
  );
};
