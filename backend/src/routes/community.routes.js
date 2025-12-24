const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
    createCommunity,
    getCommunities,
    getCommunity,
    joinCommunity,
    leaveCommunity,
    getMembers,
    manageMember,
    updateCommunity,
    deleteCommunity
} = require('../controllers/community.controller');
const {
    getCommunityMessages,
    sendCommunityMessage,
    toggleMessageReaction
} = require('../controllers/community.messages.controller');

router.use(verifyToken);

// Community Management
router.post('/', createCommunity);
router.get('/', getCommunities);
router.get('/:id', getCommunity);
router.put('/:id', updateCommunity);
router.delete('/:id', deleteCommunity);

// Membership
router.post('/:id/join', joinCommunity);
router.delete('/:id/leave', leaveCommunity);
router.get('/:id/members', getMembers);
router.put('/:id/members/:userId', manageMember);

// Messages
router.get('/:id/messages', getCommunityMessages);
router.post('/:id/messages', sendCommunityMessage);
router.post('/:id/messages/:messageId/react', toggleMessageReaction);

module.exports = router;
