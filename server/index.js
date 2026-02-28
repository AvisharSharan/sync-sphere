const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.send('SyncSphere API is running'));

// ─── Socket.io ────────────────────────────────────────────────────────────────
// maps userId (string) -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // Client calls this right after connecting, passing their userId
  socket.on('setup', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);          // personal room
    socket.emit('connected');
    console.log(`User ${userId} connected (socket: ${socket.id})`);
  });

  // Join the room for a specific conversation
  socket.on('join conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('leave conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Broadcast a new message to everyone in the conversation room
  socket.on('new message', (messageData) => {
    const { conversationId } = messageData;
    // Emit to all sockets in the conversation room (sender receives it too via REST)
    socket.to(conversationId).emit('message received', messageData);
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, senderName }) => {
    socket.to(conversationId).emit('typing', { conversationId, senderName });
  });

  socket.on('stop typing', ({ conversationId }) => {
    socket.to(conversationId).emit('stop typing', { conversationId });
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`User ${key} disconnected`);
      }
    });
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
