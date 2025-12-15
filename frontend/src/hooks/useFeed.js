import { useEffect, useRef, useState } from 'react';
import PostService from '../services/post.service';
import { uploadImages } from '../services/media.service';

const useFeed = () => {
    const [activeTab, setActiveTab] = useState('foryou');
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [replyPermission, setReplyPermission] = useState('EVERYONE');
    const [showPermissionMenu, setShowPermissionMenu] = useState(false);
    const permissionMenuRef = useRef(null);
    
    // Media states
    const [mediaFiles, setMediaFiles] = useState([]);
    const [codeSnippet, setCodeSnippet] = useState(null);
    const [pollData, setPollData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);



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
        setLoading(true);
        try {
            const response = activeTab === 'class'
                ? await PostService.getClassPosts()
                : await PostService.getAllPosts();

            // Handle paginated response ({ data, meta }) or legacy array
            const postsData = response.data ? response.data : response;
            setPosts(postsData || []);
        } catch (error) {
            console.error('Failed to load posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const handlePostSubmit = async () => {
        if (!newPostContent.trim() && !mediaFiles.length && !codeSnippet && !pollData) return;

        setIsUploading(true);
        try {
            let uploadedImageUrls = [];
            
            // Upload images if present
            if (mediaFiles.length > 0) {
                const files = mediaFiles.map(img => img.file);
                uploadedImageUrls = await uploadImages(files);
            }

            // Build media array for backend
            const media = [];
            
            // Add uploaded images
            if (uploadedImageUrls.length > 0) {
                uploadedImageUrls.forEach(url => {
                    media.push({ type: 'IMAGE', url });
                });
            }

            // Add code snippet
            if (codeSnippet?.code) {
                media.push({
                    type: 'CODE',
                    code: codeSnippet.code,
                    language: codeSnippet.language
                });
            }

            // Create post with media and poll
            const newPost = await PostService.createPost(
                newPostContent,
                replyPermission,
                media.length > 0 ? media : undefined,
                pollData
            );
            
            const optimizedPost = {
                ...newPost,
                _count: { likes: 0, comments: 0, reposts: 0 },
                isLiked: false,
                isReposted: false
            };
            setPosts((prev) => [optimizedPost, ...prev]);
            
            // Reset form
            setNewPostContent('');
            setReplyPermission('EVERYONE');
            setMediaFiles([]);
            setCodeSnippet(null);
            setPollData(null);
        } catch (error) {
            console.error('Failed to create post', error);
            const errorMessage = error.message || 'Erreur lors de la création du post';
            alert(errorMessage);
        } finally {
            setIsUploading(false);
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
        handleDeletePost,
        // Media states
        mediaFiles,
        setMediaFiles,
        codeSnippet,
        setCodeSnippet,
        pollData,
        setPollData,
        isUploading
    };
};

export default useFeed;
