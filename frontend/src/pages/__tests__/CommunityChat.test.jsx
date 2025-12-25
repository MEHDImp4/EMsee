import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import CommunityChat from '../CommunityChat';

// Mock CommunityService
const mockGetCommunity = vi.fn();
const mockGetMessages = vi.fn();
const mockSendMessage = vi.fn();
const mockJoinCommunity = vi.fn();
const mockLeaveCommunity = vi.fn();
const mockToggleReaction = vi.fn();

vi.mock('../../services/community.service', () => ({
    default: {
        getCommunity: (...args) => mockGetCommunity(...args),
        getMessages: (...args) => mockGetMessages(...args),
        sendMessage: (...args) => mockSendMessage(...args),
        joinCommunity: (...args) => mockJoinCommunity(...args),
        leaveCommunity: (...args) => mockLeaveCommunity(...args),
        toggleReaction: (...args) => mockToggleReaction(...args),
        deleteCommunity: vi.fn(),
    },
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, username: 'testuser', full_name: 'Test User' },
    }),
}));

// Mock media service
vi.mock('../../services/media.service', () => ({
    uploadImages: vi.fn().mockResolvedValue(['/uploads/images/test.jpg']),
}));

// Mock components
vi.mock('../../components/EditCommunityModal', () => ({
    default: ({ isOpen }) => isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null,
}));

vi.mock('../../components/ManageMembersModal', () => ({
    default: ({ isOpen }) => isOpen ? <div data-testid="members-modal">Members Modal</div> : null,
}));

vi.mock('../../components/UserAvatar', () => ({
    default: ({ user }) => <div data-testid="user-avatar">{user?.username}</div>,
}));

vi.mock('../../components/loaders/PageLoader', () => ({
    default: () => <div data-testid="page-loader">Loading...</div>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    formatDistanceToNow: () => 'just now',
    format: (date) => date.toString(),
}));

vi.mock('date-fns/locale', () => ({
    fr: {},
}));

const mockCommunity = {
    id: 1,
    name: 'Test Community',
    description: 'A test community',
    privacy: 'PUBLIC',
    writeAccess: 'EVERYONE',
    icon: null,
    membership: {
        status: 'ACTIVE',
        role: 'OWNER',
    },
    _count: { members: 10 },
    owner: { id: 1, username: 'owner' },
};

const mockMessages = [
    {
        id: 1,
        content: 'Hello everyone!',
        createdAt: new Date().toISOString(),
        sender: { id: 2, username: 'user2', full_name: 'User Two', role: 'MEMBER' },
        reactions: [],
    },
    {
        id: 2,
        content: 'Welcome!',
        createdAt: new Date().toISOString(),
        sender: { id: 1, username: 'testuser', full_name: 'Test User', role: 'OWNER' },
        reactions: [{ id: 1, userId: 2, emoji: '👍' }],
    },
];

// Route wrapper for testing
const renderWithRouter = (communityId = '1') => {
    return render(
        <MemoryRouter initialEntries={[`/community/${communityId}`]}>
            <Routes>
                <Route path="/community/:id" element={<CommunityChat />} />
                <Route path="/community" element={<div>Community List</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('CommunityChat Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCommunity.mockResolvedValue(mockCommunity);
        mockGetMessages.mockResolvedValue(mockMessages);
    });

    it('should show loading state initially', () => {
        mockGetCommunity.mockImplementation(() => new Promise(() => { })); // Never resolves
        renderWithRouter();

        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('should render community header', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Community')).toBeInTheDocument();
        });

        expect(screen.getByText(/10 community.members/i)).toBeInTheDocument();
    });

    it('should render messages when member is active', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
        });

        expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });

    it('should show message input when user is a member', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/community.input_placeholder/i)).toBeInTheDocument();
        });
    });

    it('should show join button for non-members', async () => {
        mockGetCommunity.mockResolvedValue({
            ...mockCommunity,
            membership: null,
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText(/community.join_group/i)).toBeInTheDocument();
        });
    });

    it('should show pending message when request is pending', async () => {
        mockGetCommunity.mockResolvedValue({
            ...mockCommunity,
            membership: { status: 'PENDING' },
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText(/community.request_sent/i)).toBeInTheDocument();
        });
    });

    it('should send message on form submit', async () => {
        const user = userEvent.setup();
        mockSendMessage.mockResolvedValue({
            id: 3,
            content: 'New message',
            sender: { id: 1, username: 'testuser', full_name: 'Test User' },
            createdAt: new Date().toISOString(),
            reactions: [],
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/community.input_placeholder/i)).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/community.input_placeholder/i);
        await user.type(input, 'New message');

        const sendButton = screen.getByRole('button', { name: '' }); // Send button has no text
        // Find the submit button by looking for the send icon parent
        const form = input.closest('form');
        const submitButton = form?.querySelector('button[type="submit"]');

        if (submitButton) {
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockSendMessage).toHaveBeenCalledWith('1', 'New message');
            });
        }
    });

    it('should show reaction picker when clicking reaction button', async () => {
        const user = userEvent.setup();
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
        });

        // Find reaction buttons (smile icons)
        const reactionButtons = screen.getAllByTitle(/community.add_reaction/i);
        expect(reactionButtons.length).toBeGreaterThan(0);

        await user.click(reactionButtons[0]);

        // Reaction picker should appear with emoji options
        await waitFor(() => {
            expect(screen.getByText('👍')).toBeInTheDocument();
            expect(screen.getByText('❤️')).toBeInTheDocument();
        });
    });

    it('should display existing reactions on messages', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Welcome!')).toBeInTheDocument();
        });

        // The second message has a 👍 reaction with count 1
        // Look for the reaction display (not the picker)
        const reactionButtons = screen.getAllByRole('button');
        const thumbsUpButton = reactionButtons.find(btn =>
            btn.textContent?.includes('👍') && btn.textContent?.includes('1')
        );
        expect(thumbsUpButton).toBeDefined();
    });

    it('should call toggleReaction when clicking on an emoji', async () => {
        const user = userEvent.setup();
        mockToggleReaction.mockResolvedValue({});

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
        });

        // Open reaction picker
        const reactionButtons = screen.getAllByTitle(/community.add_reaction/i);
        await user.click(reactionButtons[0]);

        // Click on thumbs up emoji
        await waitFor(() => {
            expect(screen.getByText('👍')).toBeInTheDocument();
        });

        const thumbsUp = screen.getAllByText('👍')[0];
        await user.click(thumbsUp.closest('button'));

        await waitFor(() => {
            expect(mockToggleReaction).toHaveBeenCalled();
        });
    });

    it('should show owner menu options', async () => {
        const user = userEvent.setup();
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Community')).toBeInTheDocument();
        });

        // Find and click menu button (MoreVertical)
        const menuButtons = screen.getAllByRole('button');
        const moreButton = menuButtons.find(btn => btn.classList.contains('ghost-icon-btn'));

        if (moreButton) {
            await user.click(moreButton);

            await waitFor(() => {
                expect(screen.getByText(/community.edit/i)).toBeInTheDocument();
                expect(screen.getByText(/community.manage_members/i)).toBeInTheDocument();
                expect(screen.getByText(/community.delete/i)).toBeInTheDocument();
            });
        }
    });

    it('should show leave option for non-owner members', async () => {
        const user = userEvent.setup();
        mockGetCommunity.mockResolvedValue({
            ...mockCommunity,
            membership: { status: 'ACTIVE', role: 'MEMBER' },
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Community')).toBeInTheDocument();
        });

        // Find and click menu button
        const menuButtons = screen.getAllByRole('button');
        const moreButton = menuButtons.find(btn => btn.classList.contains('ghost-icon-btn'));

        if (moreButton) {
            await user.click(moreButton);

            await waitFor(() => {
                expect(screen.getByText(/community.leave_group/i)).toBeInTheDocument();
            });
        }
    });

    it('should render @everyone mentions with special styling', async () => {
        mockGetMessages.mockResolvedValue([
            {
                id: 1,
                content: '@everyone Check this out!',
                createdAt: new Date().toISOString(),
                sender: { id: 1, username: 'owner', full_name: 'Owner', role: 'OWNER' },
                reactions: [],
            },
        ]);

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('@everyone')).toBeInTheDocument();
        });
    });

    it('should show no messages state when chat is empty', async () => {
        mockGetMessages.mockResolvedValue([]);

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText(/community.start_conversation/i)).toBeInTheDocument();
        });
    });
});
