const { z } = require('zod');

const mediaSchema = z.object({
    type: z.enum(['IMAGE', 'CODE']),
    url: z.string().optional(),
    code: z.string().optional(),
    language: z.string().optional()
});

const pollOptionSchema = z.object({
    text: z.string().min(1, 'Option text required')
});

const pollSchema = z.object({
    question: z.string().min(1, 'Poll question required'),
    options: z.array(z.string()).min(2, 'At least 2 options required').max(4, 'Maximum 4 options'),
    endsAt: z.string().datetime().optional()
});

const createPostSchema = z.object({
    body: z.object({
        content: z.string().max(1000, 'Le post est trop long').optional().default(''),
        replyPermission: z.enum(['EVERYONE', 'FOLLOWERS', 'MENTIONED', 'NO_ONE']).optional().default('EVERYONE'),
        media: z.array(mediaSchema).max(4, 'Maximum 4 media items').optional(),
        poll: pollSchema.optional()
    })
}).refine(
    (data) => {
        // At least one of: content, media, or poll must be present
        const hasContent = data.body.content && data.body.content.trim().length > 0;
        const hasMedia = data.body.media && data.body.media.length > 0;
        const hasPoll = data.body.poll && data.body.poll.question;
        
        return hasContent || hasMedia || hasPoll;
    },
    {
        message: 'Post must have content, media, or poll',
        path: ['body']
    }
);

module.exports = {
    createPostSchema
};
