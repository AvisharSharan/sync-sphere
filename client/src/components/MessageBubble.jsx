import React from 'react';
import useAuthStore from '../store/useAuthStore';

const AVATAR_COLORS = [
  '#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const MessageBubble = ({ message }) => {
  const { user } = useAuthStore();
  const isSent = message.sender._id === user._id || message.sender === user._id;

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const senderName = typeof message.sender === 'object' ? message.sender.name : 'You';
  const initials = senderName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (isSent) {
    return (
      <div className="msg-row msg-sent">
        <div className="msg-sent-body">
          <div className="bubble-sent">{message.content}</div>
          <span className="msg-time-sent">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-row msg-received">
      <div
        className="msg-avatar"
        style={{ background: avatarColor(senderName) }}
      >
        {initials}
      </div>
      <div className="msg-recv-body">
        <div className="msg-meta">
          <span className="msg-sender-name">{senderName}</span>
          <span className="msg-time-recv">{formatTime(message.createdAt)}</span>
        </div>
        <div className="bubble-received">{message.content}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
