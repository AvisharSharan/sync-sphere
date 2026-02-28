import React, { useState, useRef } from 'react';
import api from '../api/axiosInstance';
import useChatStore from '../store/useChatStore';

const AVATAR_COLORS = [
  '#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const UserSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { startOrOpenConversation } = useChatStore();
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/users/search?query=${encodeURIComponent(value)}`);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelect = async (userId) => {
    await startOrOpenConversation(userId);
    onClose();
  };

  return (
    <div className="user-search">
      <div className="user-search-header">
        <h3>New Conversation</h3>
        <button className="sb-icon-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search by name or email…"
        value={query}
        onChange={handleChange}
        autoFocus
      />

      <div className="search-results">
        {searching && <p className="search-hint">Searching…</p>}
        {!searching && query && results.length === 0 && (
          <p className="search-hint">No users found</p>
        )}
        {results.map((u) => (
          <button
            key={u._id}
            className="search-result-item"
            onClick={() => handleSelect(u._id)}
          >
            <div
              className="result-avatar"
              style={{ background: avatarColor(u.name) }}
            >
              {u.name[0].toUpperCase()}
              {u.name.split(' ')[1]?.[0]?.toUpperCase() || ''}
            </div>
            <div>
              <p className="result-name">{u.name}</p>
              <p className="result-email">{u.email}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
