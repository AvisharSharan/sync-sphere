const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// GET /api/conversations — all conversations for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/conversations — start or fetch existing one-on-one conversation
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    if (conversation) {
      return res.json(conversation);
    }

    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
    });

    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      '-password'
    );

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
