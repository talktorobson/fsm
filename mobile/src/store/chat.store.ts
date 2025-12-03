/**
 * Yellow Grid Mobile - Chat Store
 * Zustand store for managing chat state
 */

import { create } from 'zustand';
import type {
  Conversation,
  ChatMessage,
  ChatState,
} from '../types/chat.types';

interface ChatStore extends ChatState {
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (messageId: string) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount?: number) => void;
  setLoading: (isLoading: boolean) => void;
  setSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  markConversationRead: (conversationId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,

  // Actions
  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
    // Calculate total unread
    const totalUnread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    );
    set({ unreadCount: totalUnread });
  },

  addConversation: (conversation: Conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations.filter(c => c.id !== conversation.id)],
    }));
  },

  setActiveConversation: (conversation: Conversation | null) => {
    set({ activeConversation: conversation });
    if (conversation) {
      set({ messages: conversation.messages || [] });
    } else {
      set({ messages: [] });
    }
  },

  setMessages: (messages: ChatMessage[]) => {
    set({ messages });
  },

  addMessage: (message: ChatMessage) => {
    set((state) => {
      // Add to messages array (newest at end for chronological display)
      const newMessages = [...state.messages, message];
      
      // Update active conversation's last message
      const activeConv = state.activeConversation;
      if (activeConv && activeConv.id === message.conversationId) {
        return {
          messages: newMessages,
          activeConversation: {
            ...activeConv,
            lastMessageAt: message.createdAt,
            lastMessagePreview: message.content.substring(0, 200),
          },
        };
      }
      
      return { messages: newMessages };
    });

    // Also update in conversations list
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              lastMessageAt: message.createdAt,
              lastMessagePreview: message.content.substring(0, 200),
            }
          : c
      ),
    }));
  },

  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    }));
  },

  removeMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isDeleted: true, content: 'Message deleted' } : m
      ),
    }));
  },

  prependMessages: (messages: ChatMessage[]) => {
    set((state) => ({
      messages: [...messages, ...state.messages],
    }));
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  decrementUnreadCount: (amount = 1) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - amount),
    }));
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setSending: (isSending: boolean) => {
    set({ isSending });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  markConversationRead: (conversationId: string) => {
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      const unreadToRemove = conv?.unreadCount || 0;

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
        activeConversation:
          state.activeConversation?.id === conversationId
            ? { ...state.activeConversation, unreadCount: 0 }
            : state.activeConversation,
        unreadCount: Math.max(0, state.unreadCount - unreadToRemove),
      };
    });
  },

  clearChat: () => {
    set({
      conversations: [],
      activeConversation: null,
      messages: [],
      unreadCount: 0,
      isLoading: false,
      isSending: false,
      error: null,
    });
  },
}));
