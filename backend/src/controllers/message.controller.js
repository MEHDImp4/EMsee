const messageService = require('../services/message.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { getIo } = require('../services/socketService');

/**
 * @desc Get all conversations for current user
 * @route GET /api/messages/conversations
 * @access Private
 */
exports.getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const result = await messageService.getUserConversations(
    userId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result.conversations,
    pagination: result.pagination
  });
});

/**
 * @desc Create or get conversation with a user
 * @route POST /api/messages/conversations
 * @access Private
 */
exports.createConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = req.body;

  if (recipientId === userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot create conversation with yourself'
    });
  }

  const conversation = await messageService.getOrCreateConversation(userId, recipientId);

  res.status(200).json({
    success: true,
    data: conversation
  });
});

/**
 * @desc Get conversation by ID
 * @route GET /api/messages/conversations/:id
 * @access Private
 */
exports.getConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = parseInt(req.params.id);

  const conversation = await messageService.getConversationById(conversationId, userId);

  res.status(200).json({
    success: true,
    data: conversation
  });
});

/**
 * @desc Get messages in a conversation
 * @route GET /api/messages/conversations/:id/messages
 * @access Private
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = parseInt(req.params.id);
  const { page = 1, limit = 50 } = req.query;

  const result = await messageService.getConversationMessages(
    conversationId,
    userId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result.messages,
    pagination: result.pagination
  });
});

/**
 * @desc Send message in a conversation
 * @route POST /api/messages/conversations/:id/messages
 * @access Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = parseInt(req.params.id);
  const { content } = req.body;
  const file = req.file;

  let mediaUrl = null;
  let mediaType = null;

  if (file) {
    mediaUrl = `/uploads/images/${file.filename}`;
    mediaType = file.mimetype.startsWith('image/') ? 'image' : 'file';
  }

  const message = await messageService.sendMessage(conversationId, userId, content, mediaUrl, mediaType);

  // Emit socket event to conversation participants
  const io = getIo();
  const conversation = await messageService.getConversationById(conversationId, userId);

  conversation.participants.forEach(participant => {
    if (participant.userId !== userId) {
      io.to(`user_${participant.userId}`).emit('newMessage', {
        conversationId,
        message
      });
    }
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

/**
 * @desc Mark conversation as read
 * @route PATCH /api/messages/conversations/:id/read
 * @access Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = parseInt(req.params.id);

  await messageService.markConversationAsRead(conversationId, userId);

  // Emit read event
  const io = getIo();
  // Notify other participants that this user read the conversation
  const conversation = await messageService.getConversationById(conversationId, userId);
  conversation.participants.forEach(participant => {
    if (participant.userId !== userId) {
      io.to(`user_${participant.userId}`).emit('messagesRead', {
        conversationId,
        readByUserId: userId
      });
    }
  });

  res.status(200).json({
    success: true,
    message: 'Conversation marked as read'
  });
});
