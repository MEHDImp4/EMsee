const { z } = require('zod');

const createConversationSchema = z.object({
  body: z.object({
    recipientId: z.number().int().positive({
      message: 'Recipient ID must be a positive integer'
    })
  })
});

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Message content cannot be empty')
      .max(5000, 'Message content cannot exceed 5000 characters')
  })
});

const getMessagesSchema = z.object({
  query: z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 50),
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
  })
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema
};
