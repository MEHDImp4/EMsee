import { useEffect, useRef, useState } from 'react';
import PostService from '../services/post.service';

const useFeed = () => {
    const [activeTab, setActiveTab] = useState('foryou');
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [replyPermission, setReplyPermission] = useState('EVERYONE');
    const [showPermissionMenu, setShowPermissionMenu] = useState(false);
    const permissionMenuRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (permissionMenuRef.current && !permissionMenuRef.current.contains(event.target)) {
                setShowPermissionMenu(false);
            }
        };

        if (showPermissionMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPermissionMenu]);

    const fetchPosts = async () => {
        try {
            const data = await PostService.getAllPosts();
            setPosts(data || []);
        } catch (error) {
            console.error('Failed to load posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async () => {
        if (!newPostContent.trim()) return;

        try {
            const newPost = await PostService.createPost(newPostContent, replyPermission);
            const optimizedPost = {
                ...newPost,
                _count: { likes: 0, comments: 0, reposts: 0 },
                isLiked: false,
                isReposted: false
            };
            setPosts((prev) => [optimizedPost, ...prev]);
            setNewPostContent('');
            setReplyPermission('EVERYONE');
        } catch (error) {
            console.error('Failed to create post', error);
        }
    };

    const handleDeletePost = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    };

    return {
        activeTab,
        setActiveTab,
        posts,
        loading,
        newPostContent,
        setNewPostContent,
        replyPermission,
        setReplyPermission,
        showPermissionMenu,
        setShowPermissionMenu,
        permissionMenuRef,
        handlePostSubmit,
        handleDeletePost
    };
};

export default useFeed;
