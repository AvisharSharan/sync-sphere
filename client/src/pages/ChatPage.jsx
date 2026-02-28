import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { connectSocket, getSocket } from '../socket/socket';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { user } = useAuthStore();
  const { fetchConversations, receiveMessage, setTyping } = useChatStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect socket and setup user room
    connectSocket(user._id);
    fetchConversations();

    const socket = getSocket();

    // Incoming message from another user
    const onMessageReceived = (message) => {
      receiveMessage(message);
    };

    // Typing events
    const onTyping = ({ conversationId, senderName }) => {
      setTyping(conversationId, senderName);
    };

    const onStopTyping = ({ conversationId }) => {
      setTyping(conversationId, null);
    };

    socket.on('message received', onMessageReceived);
    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);

    return () => {
      socket.off('message received', onMessageReceived);
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
    };
  }, [user, navigate, fetchConversations, receiveMessage, setTyping]);

  if (!user) return null;

  return (
    <div className="chat-layout">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
