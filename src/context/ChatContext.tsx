import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatRoom, Match } from '../types';
import { moderateMessage, CHAT_EMOJIS, SAMPLE_PUNTER_PROFILES } from '../utils/chatModeration';
import { soundFx } from '../utils/audioEffects';

interface ChatContextType {
  currentRoomId: string;
  setCurrentRoomId: (roomId: string) => void;
  messages: ChatMessage[];
  activeUsersCount: number;
  isConnected: boolean;
  sendMessage: (text: string, sharedBet?: ChatMessage['sharedBet']) => { success: boolean; error?: string };
  addReaction: (messageId: string, emoji: string) => void;
  reportMessage: (messageId: string, reason: string, details?: string) => void;
  currentUser: {
    userId: string;
    userName: string;
    userBadge: string;
  };
  updateUserProfile: (name: string, badge?: string) => void;
  slowModeRemaining: number;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isChatMinimized: boolean;
  setIsChatMinimized: (minimized: boolean) => void;
  chatSoundEnabled: boolean;
  setChatSoundEnabled: (enabled: boolean) => void;
  isRulesModalOpen: boolean;
  setIsRulesModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportingMessageId: string | null;
  setReportingMessageId: (id: string | null) => void;
  unreadCount: number;
  resetUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const LOCAL_STORAGE_PUNTER_USER = 'chrisfixbet_chat_user_v1';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoomId, setCurrentRoomId] = useState<string>('global-live');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(38);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [slowModeRemaining, setSlowModeRemaining] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isChatMinimized, setIsChatMinimized] = useState<boolean>(false);
  const [chatSoundEnabled, setChatSoundEnabled] = useState<boolean>(true);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // User Profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PUNTER_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const randomProfile = SAMPLE_PUNTER_PROFILES[Math.floor(Math.random() * SAMPLE_PUNTER_PROFILES.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    return {
      userId: `gh-punter-${Date.now().toString(36)}`,
      userName: `${randomProfile.name.split('_')[0]}_${randomNum}`,
      userBadge: randomProfile.badge,
    };
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slowModeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateUserProfile = useCallback((name: string, badge?: string) => {
    const updated = {
      ...currentUser,
      userName: name.trim() || currentUser.userName,
      userBadge: badge || currentUser.userBadge,
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_PUNTER_USER, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'join_room',
          roomId: currentRoomId,
          userId: updated.userId,
          userName: updated.userName,
          userBadge: updated.userBadge,
        })
      );
    }
  }, [currentUser, currentRoomId]);

  // Connect to WebSocket Server
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/chat`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(
          JSON.stringify({
            type: 'join_room',
            roomId: currentRoomId,
            userId: currentUser.userId,
            userName: currentUser.userName,
            userBadge: currentUser.userBadge,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'room_history': {
              if (data.roomId === currentRoomId) {
                setMessages(data.messages || []);
                if (data.activeCount) setActiveUsersCount(data.activeCount);
              }
              break;
            }

            case 'new_message': {
              if (data.message) {
                setMessages((prev) => {
                  // Guard against duplicates
                  if (prev.some((m) => m.id === data.message.id)) return prev;
                  return [...prev, data.message];
                });

                if (!isChatOpen) {
                  setUnreadCount((c) => c + 1);
                }

                if (chatSoundEnabled) {
                  soundFx.playBetPlaced();
                }
              }
              break;
            }

            case 'reaction_updated': {
              if (data.messageId && data.reactions) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === data.messageId
                      ? { ...msg, reactions: data.reactions, userReactions: data.userReactions }
                      : msg
                  )
                );
              }
              break;
            }

            case 'presence_update': {
              if (data.roomId === currentRoomId && data.activeCount) {
                setActiveUsersCount(data.activeCount);
              }
              break;
            }

            case 'report_confirmed': {
              setIsReportModalOpen(false);
              setReportingMessageId(null);
              break;
            }
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch {
      setIsConnected(false);
    }
  }, [currentRoomId, currentUser, isChatOpen, chatSoundEnabled]);

  // Initial connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (slowModeTimerRef.current) {
        clearInterval(slowModeTimerRef.current);
      }
    };
  }, [connectWebSocket]);

  // Room switch handler
  useEffect(() => {
    // Fetch room history via REST as immediate fallback
    fetch(`/api/chat/messages/${encodeURIComponent(currentRoomId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'join_room',
          roomId: currentRoomId,
          userId: currentUser.userId,
          userName: currentUser.userName,
          userBadge: currentUser.userBadge,
        })
      );
    }
  }, [currentRoomId, currentUser]);

  // Send Message with Local Moderation Validation & Cooldown
  const sendMessage = useCallback(
    (text: string, sharedBet?: ChatMessage['sharedBet']): { success: boolean; error?: string } => {
      if (slowModeRemaining > 0) {
        return { success: false, error: `Slow mode: Please wait ${slowModeRemaining}s before sending another message.` };
      }

      const modResult = moderateMessage(text);
      if (modResult.action === 'reject') {
        return { success: false, error: modResult.reason || 'Message violates CHRISFIXBET community moderation guidelines.' };
      }

      const payload = {
        type: 'send_message',
        roomId: currentRoomId,
        userId: currentUser.userId,
        userName: currentUser.userName,
        userBadge: currentUser.userBadge,
        text: modResult.sanitizedText,
        sharedBet,
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        // Fallback to REST API
        fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setMessages((prev) => [...prev, data.message]);
            }
          })
          .catch(() => {});
      }

      // Start 2-second anti-spam slow mode timer
      setSlowModeRemaining(2);
      if (slowModeTimerRef.current) clearInterval(slowModeTimerRef.current);
      slowModeTimerRef.current = setInterval(() => {
        setSlowModeRemaining((prev) => {
          if (prev <= 1) {
            if (slowModeTimerRef.current) clearInterval(slowModeTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return { success: true };
    },
    [currentRoomId, currentUser, slowModeRemaining]
  );

  // Add Emoji Reaction
  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = { ...(msg.reactions || {}) };
          const userReactions = { ...(msg.userReactions || {}) };
          const users = [...(userReactions[emoji] || [])];
          const idx = users.indexOf(currentUser.userId);

          if (idx >= 0) {
            users.splice(idx, 1);
            reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
            if (reactions[emoji] === 0) delete reactions[emoji];
          } else {
            users.push(currentUser.userId);
            reactions[emoji] = (reactions[emoji] || 0) + 1;
          }
          userReactions[emoji] = users;

          return { ...msg, reactions, userReactions };
        })
      );

      const payload = {
        type: 'add_reaction',
        roomId: currentRoomId,
        messageId,
        emoji,
        userId: currentUser.userId,
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        fetch('/api/chat/react', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    },
    [currentRoomId, currentUser.userId]
  );

  // Report message to moderation
  const reportMessage = useCallback(
    (messageId: string, reason: string, details?: string) => {
      const payload = {
        type: 'report_message',
        roomId: currentRoomId,
        messageId,
        reporterUserId: currentUser.userId,
        reason,
        details,
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        fetch('/api/chat/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      setIsReportModalOpen(false);
      setReportingMessageId(null);
    },
    [currentRoomId, currentUser.userId]
  );

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        currentRoomId,
        setCurrentRoomId,
        messages,
        activeUsersCount,
        isConnected,
        sendMessage,
        addReaction,
        reportMessage,
        currentUser,
        updateUserProfile,
        slowModeRemaining,
        isChatOpen,
        setIsChatOpen,
        isChatMinimized,
        setIsChatMinimized,
        chatSoundEnabled,
        setChatSoundEnabled,
        isRulesModalOpen,
        setIsRulesModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        reportingMessageId,
        setReportingMessageId,
        unreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
