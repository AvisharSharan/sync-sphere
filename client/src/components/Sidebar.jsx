import React, { useState } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import UserSearch from './UserSearch';

const AVATAR_COLORS = [
  '#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const Sidebar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { conversations, activeConversation, setActiveConversation, unreadCounts, isTyping } = useChatStore();
  const { user, logout } = useAuthStore();

  const getOtherParticipant = (conversation) =>
    conversation.participants.find((p) => p._id !== user._id);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand-bar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="sidebar-brand-name">SyncSphere</span>
      </div>

      {/* User profile */}
      <div className="sidebar-profile">
        <div
          className="sidebar-avatar"
          style={{ background: avatarColor(user?.name) }}
        >
          {user?.name?.[0].toUpperCase()}{user?.name?.split(' ')[1]?.[0]?.toUpperCase() || ''}
        </div>
        <div className="sidebar-profile-info">
          <p className="sidebar-profile-name">{user?.name}</p>
          <div className="sidebar-status">
            <span className="status-dot" />
            <span className="status-text">available</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search-wrap">
        <svg className="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input className="sidebar-search-input" type="text" placeholder="Search" readOnly
          onClick={() => setShowSearch(true)} />
      </div>

      {/* Last chats header */}
      <div className="sidebar-chats-header">
        <span className="sidebar-chats-label">Last chats</span>
        <div className="sidebar-chats-actions">
          <button className="sb-icon-btn" title="New conversation" onClick={() => setShowSearch(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="sb-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <ul className="conversation-list">
        {conversations.length === 0 && (
          <li className="no-conversations">No conversations yet.<br />Click + to start one!</li>
        )}
        {conversations.map((conv) => {
          const other = getOtherParticipant(conv);
          if (!other) return null;
          const unread = unreadCounts[conv._id] || 0;
          const isActive = activeConversation?._id === conv._id;
          const isOtherTyping = isTyping[conv._id];

          return (
            <li key={conv._id}>
              <button
                className={`conv-item${isActive ? ' active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div
                  className="conv-avatar"
                  style={{ background: avatarColor(other.name) }}
                >
                  {other.name[0].toUpperCase()}
                  {other.name.split(' ')[1]?.[0]?.toUpperCase() || ''}
                </div>
                <div className="conv-info">
                  <div className="conv-row-top">
                    <span className="conv-name">{other.name}</span>
                    <span className="conv-time">{formatTime(conv.updatedAt)}</span>
                  </div>
                  <div className="conv-row-bottom">
                    {isOtherTyping ? (
                      <span className="conv-typing">typing...</span>
                    ) : (
                      <span className="conv-last">
                        {conv.lastMessage
                          ? conv.lastMessage.content?.substring(0, 32) +
                            (conv.lastMessage.content?.length > 32 ? '…' : '')
                          : 'No messages yet'}
                      </span>
                    )}
                    {unread > 0 && (
                      <span className="unread-badge">{unread > 9 ? '9+' : unread}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom nav */}
      <div className="sidebar-bottom-nav">
        <button className="nav-btn active" title="Chats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
        <button className="nav-btn" title="Stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        <button className="nav-btn" title="Video">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>
        <button className="nav-btn" title="Logout" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* User search modal */}
      {showSearch && (
        <div className="modal-overlay" onClick={() => setShowSearch(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserSearch onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
