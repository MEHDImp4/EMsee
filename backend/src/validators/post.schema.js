const { z } = require('zod');

const createPostSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Le contenu ne peut pas être vide').max(1000, 'Le post est trop long'),
        replyPermission: z.enum(['EVERYONE', 'FOLLOWERS', 'MENTIONED', 'NO_ONE']).optional().default('EVERYONE')
    })
});

module.exports = {
    createPostSchema
};
