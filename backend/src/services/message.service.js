const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageService {
  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(userId1, userId2) {
    // Find existing conversation between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        messages: true
      }
    });

    return newConversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                full_name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(p => p.userId === userId);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: participant.lastReadAt
              ? { gt: participant.lastReadAt }
              : undefined
          }
        });

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null
        };
      })
    );

    const total = await prisma.conversation.count({
      where: {
        participants: {
          some: { userId }
        }
      }
    });

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.message.count({
      where: { conversationId }
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, senderId, content, mediaUrl = null, mediaType = null) {
    // Verify sender is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId
      }
    });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        mediaUrl,
        mediaType
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId, userId) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() }
    });

    return { success: true };
  }

  /**
   * Get conversation by ID with participants info
   */
  async getConversationById(conversationId, userId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                role: true,
                bio: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    return conversation;
  }
}

module.exports = new MessageService();
