const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');

const prisma = new PrismaClient();

/**
 * Vote on a poll
 * @route POST /api/polls/:pollId/vote
 */
const votePoll = asyncHandler(async (req, res) => {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
        where: { id: parseInt(pollId) },
        include: { options: true }
    });

    if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has ended
    if (poll.endsAt && new Date() > new Date(poll.endsAt)) {
        return res.status(400).json({ error: 'Poll has ended' });
    }

    // Check if option exists
    const optionExists = poll.options.some(opt => opt.id === parseInt(optionId));
    if (!optionExists) {
        return res.status(400).json({ error: 'Invalid poll option' });
    }

    // Check if user has already voted
    const existingVote = await prisma.pollVote.findUnique({
        where: {
            pollId_userId: {
                pollId: parseInt(pollId),
                userId
            }
        }
    });

    if (existingVote) {
        // Update vote
        await prisma.pollVote.update({
            where: { id: existingVote.id },
            data: { optionId: parseInt(optionId) }
        });
    } else {
        // Create new vote
        await prisma.pollVote.create({
            data: {
                pollId: parseInt(pollId),
                optionId: parseInt(optionId),
                userId
            }
        });
    }

    // Return updated poll results
    const updatedPoll = await prisma.poll.findUnique({
        where: { id: parseInt(pollId) },
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } }
                }
            },
            _count: { select: { votes: true } }
        }
    });

    res.json(updatedPoll);
});

/**
 * Get poll results
 * @route GET /api/polls/:pollId
 */
const getPollResults = asyncHandler(async (req, res) => {
    const { pollId } = req.params;
    const currentUserId = req.user?.id;

    const poll = await prisma.poll.findUnique({
        where: { id: parseInt(pollId) },
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } }
                }
            },
            votes: currentUserId ? { where: { userId: currentUserId } } : false,
            _count: { select: { votes: true } }
        }
    });

    if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
});

module.exports = {
    votePoll,
    getPollResults
};
