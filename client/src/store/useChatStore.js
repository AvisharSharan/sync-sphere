import { create } from 'zustand';
import api from '../api/axiosInstance';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCounts: {}, // conversationId -> count
  isTyping: {},     // conversationId -> boolean
  loadingMessages: false,

  // ─── Conversations ────────────────────────────────────────────────────────
  fetchConversations: async () => {
    try {
      const { data } = await api.get('/conversations');
      set({ conversations: data });
    } catch (err) {
      console.error('fetchConversations error:', err);
    }
  },

  startOrOpenConversation: async (recipientId) => {
    try {
      const { data } = await api.post('/conversations', { recipientId });
      const { conversations } = get();
      const exists = conversations.find((c) => c._id === data._id);
      if (!exists) {
        set({ conversations: [data, ...conversations] });
      }
      get().setActiveConversation(data);
      return data;
    } catch (err) {
      console.error('startOrOpenConversation error:', err);
    }
  },

  setActiveConversation: (conversation) => {
    set((state) => ({
      activeConversation: conversation,
      // Clear unread count when opening the conversation
      unreadCounts: conversation
        ? { ...state.unreadCounts, [conversation._id]: 0 }
        : state.unreadCounts,
    }));
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  fetchMessages: async (conversationId) => {
    set({ loadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      set({ messages: data, loadingMessages: false });
    } catch (err) {
      console.error('fetchMessages error:', err);
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const { data } = await api.post('/messages', { conversationId, content });
      // Optimistically add to local messages list
      set((state) => ({ messages: [...state.messages, data] }));
      // Update lastMessage on the conversation in sidebar
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: data, updatedAt: data.createdAt } : c
        ),
      }));
      return data;
    } catch (err) {
      console.error('sendMessage error:', err);
    }
  },

  // Called by socket listener when a new message arrives from another user
  receiveMessage: (message) => {
    const { activeConversation, unreadCounts } = get();

    // If the message belongs to the currently open conversation, append it
    if (activeConversation && activeConversation._id === message.conversationId) {
      set((state) => ({ messages: [...state.messages, message] }));
    } else {
      // Increment unread badge for the other conversation
      set({
        unreadCounts: {
          ...unreadCounts,
          [message.conversationId]: (unreadCounts[message.conversationId] || 0) + 1,
        },
      });
    }

    // Update lastMessage on sidebar regardless
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === message.conversationId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c
      ),
    }));
  },

  // ─── Typing ───────────────────────────────────────────────────────────────
  setTyping: (conversationId, value) =>
    set((state) => ({
      isTyping: { ...state.isTyping, [conversationId]: value },
    })),
}));

export default useChatStore;
