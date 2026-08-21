import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSportsbook } from '../../context/SportsbookContext';
import { EmojiPickerDrawer } from './EmojiPickerDrawer';
import { CommunityRulesModal } from './CommunityRulesModal';
import { ReportMessageModal } from './ReportMessageModal';
import { CHAT_EMOJIS, SAMPLE_PUNTER_PROFILES } from '../../utils/chatModeration';
import {
  MessageSquare,
  Send,
  Smile,
  ShieldCheck,
  Flag,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
  Flame,
  Users,
  Trophy,
  Sparkles,
  Ticket,
  ChevronDown,
  UserCheck,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';

interface LiveMatchChatRoomProps {
  embedded?: boolean; // When rendered inline on Live Betting page
  defaultMatchId?: string;
  onClose?: () => void;
}

export const LiveMatchChatRoom: React.FC<LiveMatchChatRoomProps> = ({
  embedded = false,
  defaultMatchId,
  onClose,
}) => {
  const {
    currentRoomId,
    setCurrentRoomId,
    messages,
    activeUsersCount,
    isConnected,
    sendMessage,
    addReaction,
    currentUser,
    updateUserProfile,
    slowModeRemaining,
    chatSoundEnabled,
    setChatSoundEnabled,
    setIsRulesModalOpen,
    setReportingMessageId,
    setIsReportModalOpen,
  } = useChat();

  const { matches, addBetSelection, betSlipItems } = useSportsbook();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [showEmojiDrawer, setShowEmojiDrawer] = useState<boolean>(false);
  const [showQuickReactionsForMsg, setShowQuickReactionsForMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);
  const [newNick, setNewNick] = useState<string>(currentUser.userName);
  const [newBadge, setNewBadge] = useState<string>(currentUser.userBadge);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter all currently active live matches
  const liveMatches = matches.filter((m) => m.status === 'live');

  // Set default match room if provided
  useEffect(() => {
    if (defaultMatchId) {
      setCurrentRoomId(defaultMatchId);
    }
  }, [defaultMatchId, setCurrentRoomId]);

  // Auto-scroll to bottom of message list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    setErrorMessage(null);
    const res = sendMessage(inputMessage);
    if (res.success) {
      setInputMessage('');
      setShowEmojiDrawer(false);
    } else {
      setErrorMessage(res.error || 'Failed to send message.');
    }
  };

  const handleShareCurrentBet = () => {
    if (betSlipItems.length === 0) {
      setErrorMessage('Add a pick to your Bet Slip first to share it!');
      return;
    }
    const item = betSlipItems[0];
    const sharedText = `🔥 My Pick: ${item.outcomeName} (${item.odds.toFixed(2)}) for ${item.matchTitle}! Who is rolling with me? 💰🚀`;
    const res = sendMessage(sharedText, {
      matchTitle: item.matchTitle,
      marketName: item.marketName,
      outcomeName: item.outcomeName,
      odds: item.odds,
      stake: item.stake,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to share bet.');
    }
  };

  const handleCopyBetToSlip = (sharedBet: NonNullable<(typeof messages)[0]['sharedBet']>) => {
    // Find target match or create standard item
    const targetMatch = matches.find((m) => m.homeTeam.name + ' vs ' + m.awayTeam.name === sharedBet.matchTitle);
    addBetSelection(
      {
        id: `copied-bet-${Date.now()}`,
        matchId: targetMatch?.id || 'live-shared',
        matchTitle: sharedBet.matchTitle,
        league: targetMatch?.league || 'Live Betting',
        sport: targetMatch?.sport || 'soccer',
        marketId: 'copied-market',
        marketName: sharedBet.marketName,
        outcomeId: 'copied-outcome',
        outcomeName: sharedBet.outcomeName,
        odds: sharedBet.odds,
        isLive: true,
      },
      sharedBet.stake || 25
    );
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNick.trim()) {
      updateUserProfile(newNick, newBadge);
      setShowProfileEditor(false);
    }
  };

  // Find info about active match room if currently in one
  const activeRoomMatch = liveMatches.find((m) => m.id === currentRoomId);

  return (
    <div
      id="chrisfixbet-live-chat"
      className={`flex flex-col bg-[#120a04] border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl text-white select-none ${
        embedded ? 'w-full h-[520px] sm:h-[580px]' : 'w-full max-w-lg h-[600px]'
      }`}
    >
      {/* 1. TOP HEADER & ROOM SELECTOR */}
      <div className="bg-gradient-to-r from-[#1c0f06] via-[#150b03] to-[#1c0f06] border-b border-orange-500/30 p-3 sm:p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                <MessageSquare className="w-4 h-4 fill-black" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#120a04] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-tight text-white flex items-center space-x-1.5">
                  <span>CHRISFIX Live Chat</span>
                  <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono font-bold border border-orange-500/30">
                    GH 🇬🇭
                  </span>
                </h3>
              </div>
              <p className="text-[10px] text-gray-400 font-mono flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">{activeUsersCount} punters live</span>
                <span>•</span>
                <span className="text-gray-500">{isConnected ? 'Real-time WebSocket' : 'Connecting...'}</span>
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setChatSoundEnabled(!chatSoundEnabled)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                chatSoundEnabled
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-black/40 border-gray-800 text-gray-500'
              }`}
              title={chatSoundEnabled ? 'Mute Chat Sound FX' : 'Enable Chat Sound FX'}
            >
              {chatSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="p-1.5 rounded-lg bg-black/40 border border-gray-800 text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer"
              title="Community Moderation Guidelines"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-black/40 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Room Switcher Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setCurrentRoomId('global-live')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              currentRoomId === 'global-live'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                : 'bg-black/50 text-gray-400 border border-gray-800 hover:border-orange-500/40 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 fill-current" />
            <span>Global Lounge</span>
          </button>

          {liveMatches.map((match) => {
            const isActive = currentRoomId === match.id;
            return (
              <button
                key={match.id}
                onClick={() => setCurrentRoomId(match.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'bg-black/50 text-gray-400 border border-gray-800 hover:border-orange-500/40 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-sans">
                  {match.homeTeam.shortName || match.homeTeam.name} vs {match.awayTeam.shortName || match.awayTeam.name}
                </span>
                <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-black/20 text-black' : 'bg-gray-800 text-orange-400'}`}>
                  {match.score.home}-{match.score.away} ({match.minute}')
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Match Status Sub-bar */}
        {activeRoomMatch && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/50 rounded-xl border border-orange-500/20 text-[11px]">
            <span className="text-gray-300 font-medium truncate">
              ⚽ Discussing: <strong className="text-white">{activeRoomMatch.homeTeam.name} vs {activeRoomMatch.awayTeam.name}</strong>
            </span>
            <span className="text-orange-400 font-mono font-bold shrink-0 ml-2">
              {activeRoomMatch.minute}' {activeRoomMatch.period}
            </span>
          </div>
        )}
      </div>

      {/* 2. MESSAGES STREAM CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0d0702]/80 scrollbar-thin scrollbar-thumb-orange-950">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-500">
            <MessageSquare className="w-10 h-10 text-orange-500/30" />
            <p className="text-xs text-gray-400">No messages in this room yet.</p>
            <p className="text-[11px] text-gray-600">Be the first Ghanaian punter to start the match banter!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUser.userId;
            const isSystem = msg.isModerator || msg.isSystemAnnouncement;

            return (
              <div
                key={msg.id}
                className={`relative group flex flex-col space-y-1 animate-in fade-in duration-200 ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Header (Username + Badge + Time) */}
                <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 px-1">
                  <span className="font-bold text-gray-300">{isMe ? 'You' : msg.userName}</span>
                  {msg.userBadge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        msg.isModerator
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}
                    >
                      {msg.userBadge}
                    </span>
                  )}
                  <span className="text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] rounded-2xl p-2.5 text-xs shadow-md transition-all ${
                    isSystem
                      ? 'bg-gradient-to-r from-amber-950/40 via-orange-950/40 to-amber-950/40 border border-amber-500/40 text-amber-100 rounded-tl-sm'
                      : isMe
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                      : 'bg-gray-900/90 border border-gray-800 text-gray-200 rounded-tl-sm hover:border-gray-700'
                  }`}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>

                  {/* Flagged moderation warning */}
                  {msg.isFlagged && (
                    <div className="mt-1 pt-1 border-t border-red-500/20 flex items-center space-x-1 text-[10px] text-red-300 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>{msg.moderationReason || 'Auto-moderated for community standards'}</span>
                    </div>
                  )}

                  {/* Embedded Shared Bet Ticket */}
                  {msg.sharedBet && (
                    <div className="mt-2 p-2 rounded-xl bg-black/60 border border-orange-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-orange-400 font-mono font-bold flex items-center space-x-1">
                          <Ticket className="w-3 h-3" />
                          <span>SHARED LIVE PICK</span>
                        </span>
                        <span className="text-white font-mono font-black">{msg.sharedBet.odds.toFixed(2)}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{msg.sharedBet.matchTitle}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-300">
                        <span>{msg.sharedBet.outcomeName}</span>
                        <span className="text-[10px] text-gray-400">{msg.sharedBet.marketName}</span>
                      </div>
                      <button
                        onClick={() => handleCopyBetToSlip(msg.sharedBet!)}
                        className="w-full mt-1 py-1 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500 border border-orange-500/40 hover:border-orange-500 text-orange-300 hover:text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Copy Pick to Slip</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Emoji Reactions Row & Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5 px-1">
                  {/* Render Existing Reactions */}
                  {msg.reactions &&
                    Object.entries(msg.reactions).map(([emoji, count]) => {
                      const hasReacted = msg.userReactions?.[emoji]?.includes(currentUser.userId);
                      return (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono flex items-center space-x-1 border transition-all cursor-pointer ${
                            hasReacted
                              ? 'bg-orange-500/20 border-orange-500 text-orange-300 scale-105'
                              : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      );
                    })}

                  {/* Add Quick Reaction Button */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowQuickReactionsForMsg((prev) => (prev === msg.id ? null : msg.id))
                      }
                      className="p-1 rounded-full text-gray-500 hover:text-orange-400 hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Add reaction"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    {/* Quick Reaction Flyout Menu */}
                    {showQuickReactionsForMsg === msg.id && (
                      <div className="absolute bottom-full left-0 mb-1 z-30 flex items-center space-x-1 p-1 rounded-full bg-gray-900 border border-orange-500/40 shadow-xl backdrop-blur-md animate-in zoom-in-95">
                        {CHAT_EMOJIS.quick.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              addReaction(msg.id, emoji);
                              setShowQuickReactionsForMsg(null);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-xs hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Report Message Trigger */}
                  {!isMe && !isSystem && (
                    <button
                      onClick={() => {
                        setReportingMessageId(msg.id);
                        setIsReportModalOpen(true);
                      }}
                      className="p-1 rounded-full text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Report message to moderators"
                    >
                      <Flag className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT AREA & CONTROLS */}
      <div className="relative bg-[#190d05] border-t border-orange-500/30 p-2.5 sm:p-3 space-y-2">
        {/* Emoji Picker Popup */}
        {showEmojiDrawer && (
          <EmojiPickerDrawer
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiDrawer(false)}
          />
        )}

        {/* Profile Editor Modal / Dropdown */}
        {showProfileEditor && (
          <div className="absolute bottom-full left-3 right-3 mb-2 z-40 bg-[#160c04] border border-orange-500/40 rounded-2xl p-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-orange-500/20">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Punter Profile Settings</span>
              </span>
              <button
                onClick={() => setShowProfileEditor(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2.5 text-xs">
              <div>
                <label className="text-gray-300 font-medium">Your Nickname</label>
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  maxLength={20}
                  className="w-full mt-1 bg-black/60 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-gray-300 font-medium">Select Punter Badge</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {SAMPLE_PUNTER_PROFILES.map((p) => (
                    <button
                      key={p.badge}
                      type="button"
                      onClick={() => setNewBadge(p.badge)}
                      className={`p-1.5 rounded-lg border text-[11px] font-mono text-left transition-all ${
                        newBadge === p.badge
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-black/40 border-gray-800 text-gray-400'
                      }`}
                    >
                      {p.badge}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black uppercase tracking-wider rounded-xl text-xs"
              >
                Save Punter Profile
              </button>
            </form>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 rounded-xl flex items-center justify-between text-[11px] text-red-200">
            <div className="flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white ml-2">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Emoji Bar & Shortcut Tools */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
            {CHAT_EMOJIS.quick.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-orange-500/20 hover:scale-125 transition-all text-sm cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-2">
            {betSlipItems.length > 0 && (
              <button
                type="button"
                onClick={handleShareCurrentBet}
                className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 border border-orange-500/30 text-orange-300 hover:text-black font-mono font-bold text-[10px] flex items-center space-x-1 transition-all cursor-pointer"
                title="Share current selection in chat"
              >
                <Ticket className="w-3 h-3" />
                <span>Share Slip</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowProfileEditor(!showProfileEditor)}
              className="text-[10px] text-gray-400 hover:text-orange-300 font-mono flex items-center space-x-1"
            >
              <span>{currentUser.userName}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Main Message Form */}
        <form onSubmit={handleSend} className="relative flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setShowEmojiDrawer(!showEmojiDrawer)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showEmojiDrawer
                ? 'bg-orange-500 text-black border-orange-500'
                : 'bg-black/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
            title="Emoji drawer"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={
              slowModeRemaining > 0
                ? `Slowmode cooldown: ${slowModeRemaining}s`
                : `Discuss ${activeRoomMatch ? activeRoomMatch.homeTeam.name : 'live match'} in Ghana Cedis...`
            }
            maxLength={300}
            disabled={slowModeRemaining > 0}
            className="flex-1 bg-black/70 border border-orange-500/30 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || slowModeRemaining > 0}
            className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-black font-black rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Slowmode timer bar */}
        {slowModeRemaining > 0 && (
          <div className="w-full bg-gray-900 rounded-full h-1 overflow-hidden">
            <div className="bg-orange-500 h-full w-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Modals */}
      <CommunityRulesModal />
      <ReportMessageModal />
    </div>
  );
};
