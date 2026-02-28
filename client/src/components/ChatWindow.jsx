import React, { useEffect, useRef, useState, useCallback } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { getSocket } from '../socket/socket';
import MessageBubble from './MessageBubble';

const ChatWindow = () => {
  const { activeConversation, messages, fetchMessages, sendMessage, loadingMessages, setTyping, isTyping } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const bottomRef = useRef(null);

  const other = activeConversation?.participants?.find((p) => p._id !== user._id);

  // Fetch messages and join the socket room when conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    fetchMessages(activeConversation._id);

    const socket = getSocket();
    socket.emit('join conversation', activeConversation._id);

    return () => {
      socket.emit('leave conversation', activeConversation._id);
    };
  }, [activeConversation, fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;

    const socket = getSocket();
    socket.emit('stop typing', { conversationId: activeConversation._id });

    const message = await sendMessage(activeConversation._id, input.trim());
    setInput('');

    if (message) {
      socket.emit('new message', {
        ...message,
        conversationId: activeConversation._id,
      });
    }
  };

  const handleTyping = useCallback(
    (e) => {
      setInput(e.target.value);
      if (!activeConversation) return;

      const socket = getSocket();
      socket.emit('typing', {
        conversationId: activeConversation._id,
        senderName: user.name,
      });

      clearTimeout(typingTimeout);
      const t = setTimeout(() => {
        socket.emit('stop typing', { conversationId: activeConversation._id });
      }, 2000);
      setTypingTimeout(t);
    },
    [activeConversation, typingTimeout, user.name]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  if (!activeConversation) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-inner">
          <div className="chat-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2>No conversation selected</h2>
          <p>Pick a chat from the sidebar or start a new one.</p>
        </div>
      </div>
    );
  }

  const typingName = isTyping[activeConversation._id];

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <p className="chat-header-name">{other?.name}</p>
          <div className="chat-header-tabs">
            <button className="chat-tab active">Messages</button>
            <button className="chat-tab">Participants</button>
          </div>
        </div>
        <button className="chat-more-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loadingMessages ? (
          <p className="messages-loading">Loading…</p>
        ) : (
          <>
            {messages.length === 0 && (
              <p className="messages-empty">No messages yet. Say hello! 👋</p>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg._id} message={msg} />
            ))}
            {typingName && (
              <p className="typing-text">••• {typingName} is typing</p>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSend}>
        <button type="button" className="input-icon-btn" title="Attach">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <textarea
          className="chat-input"
          placeholder="Write your message..."
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button type="button" className="input-icon-btn" title="Emoji">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>
        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim()}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
