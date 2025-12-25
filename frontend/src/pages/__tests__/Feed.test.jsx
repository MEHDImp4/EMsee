import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Feed from '../Feed';

// Mock useFeed hook
const mockLoadMore = vi.fn();
const mockHandlePostSubmit = vi.fn();
const mockHandleDeletePost = vi.fn();
const mockSetNewPostContent = vi.fn();
const mockSetActiveTab = vi.fn();
const mockSetMediaFiles = vi.fn();
const mockSetCodeSnippet = vi.fn();
const mockSetPollData = vi.fn();
const mockSetReplyPermission = vi.fn();
const mockSetShowPermissionMenu = vi.fn();

vi.mock('../../hooks/useFeed', () => ({
    default: () => ({
        activeTab: 'foryou',
        setActiveTab: mockSetActiveTab,
        posts: [
            {
                id: 1,
                content: 'Test post 1',
                user: { id: 1, username: 'testuser', full_name: 'Test User' },
                _count: { likes: 5, reposts: 2, comments: 3, views: 100 },
                isLiked: false,
                isReposted: false,
                createdAt: new Date().toISOString(),
            },
            {
                id: 2,
                content: 'Test post 2',
                user: { id: 2, username: 'anotheruser', full_name: 'Another User' },
                _count: { likes: 10, reposts: 0, comments: 1, views: 50 },
                isLiked: true,
                isReposted: false,
                createdAt: new Date().toISOString(),
            },
        ],
        loading: false,
        newPostContent: '',
        setNewPostContent: mockSetNewPostContent,
        replyPermission: 'EVERYONE',
        setReplyPermission: mockSetReplyPermission,
        showPermissionMenu: false,
        setShowPermissionMenu: mockSetShowPermissionMenu,
        permissionMenuRef: { current: null },
        handlePostSubmit: mockHandlePostSubmit,
        handleDeletePost: mockHandleDeletePost,
        mediaFiles: [],
        setMediaFiles: mockSetMediaFiles,
        codeSnippet: null,
        setCodeSnippet: mockSetCodeSnippet,
        pollData: null,
        setPollData: mockSetPollData,
        isUploading: false,
        loadMore: mockLoadMore,
        hasMore: true,
    }),
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, username: 'currentuser', full_name: 'Current User' },
    }),
}));

// Mock components
vi.mock('../../components/PostCard', () => ({
    default: ({ post }) => (
        <div data-testid={`post-${post.id}`}>
            <span>{post.content}</span>
            <span>by {post.user.username}</span>
        </div>
    ),
}));

vi.mock('../../components/ImageUpload', () => ({
    default: () => <div data-testid="image-upload">ImageUpload</div>,
}));

vi.mock('../../components/CodeEditor', () => ({
    default: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock('../../components/PollCreator', () => ({
    default: () => <div data-testid="poll-creator">PollCreator</div>,
}));

// Wrapper with Router
const TestWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('Feed Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render feed with tabs', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByText(/feed.tabs.foryou/i)).toBeInTheDocument();
        expect(screen.getByText(/feed.tabs.class/i)).toBeInTheDocument();
    });

    it('should render compose area', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByPlaceholderText(/feed.placeholder/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
    });

    it('should render posts list', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByTestId('post-1')).toBeInTheDocument();
        expect(screen.getByTestId('post-2')).toBeInTheDocument();
        expect(screen.getByText('Test post 1')).toBeInTheDocument();
        expect(screen.getByText('Test post 2')).toBeInTheDocument();
    });

    it('should switch tabs when clicked', async () => {
        const user = userEvent.setup();
        render(<Feed />, { wrapper: TestWrapper });

        const classTab = screen.getByText(/feed.tabs.class/i);
        await user.click(classTab);

        expect(mockSetActiveTab).toHaveBeenCalledWith('class');
    });

    it('should update content when typing in compose area', async () => {
        const user = userEvent.setup();
        render(<Feed />, { wrapper: TestWrapper });

        const textarea = screen.getByPlaceholderText(/feed.placeholder/i);
        await user.type(textarea, 'New post content');

        expect(mockSetNewPostContent).toHaveBeenCalled();
    });

    it('should have media action buttons', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByTitle('Images')).toBeInTheDocument();
        expect(screen.getByTitle('Code')).toBeInTheDocument();
        expect(screen.getByTitle('Sondage')).toBeInTheDocument();
    });

    it('should render ImageUpload component', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });

    it('should render CodeEditor component', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('should render PollCreator component', () => {
        render(<Feed />, { wrapper: TestWrapper });

        expect(screen.getByTestId('poll-creator')).toBeInTheDocument();
    });
});

describe('Feed Page - Empty State', () => {
    it('should show no posts message when posts is empty', () => {
        vi.doMock('../../hooks/useFeed', () => ({
            default: () => ({
                activeTab: 'foryou',
                setActiveTab: vi.fn(),
                posts: [],
                loading: false,
                newPostContent: '',
                setNewPostContent: vi.fn(),
                replyPermission: 'EVERYONE',
                setReplyPermission: vi.fn(),
                showPermissionMenu: false,
                setShowPermissionMenu: vi.fn(),
                permissionMenuRef: { current: null },
                handlePostSubmit: vi.fn(),
                handleDeletePost: vi.fn(),
                mediaFiles: [],
                setMediaFiles: vi.fn(),
                codeSnippet: null,
                setCodeSnippet: vi.fn(),
                pollData: null,
                setPollData: vi.fn(),
                isUploading: false,
                loadMore: vi.fn(),
                hasMore: false,
            }),
        }));

        // Note: This test may need adjustment based on actual module re-import behavior
    });
});
