import { useEffect, useMemo, useState } from 'react';
import PostService from '../services/post.service';
import UserService from '../services/user.service';
import { BASE_URL } from '../services/api';

const useProfilePage = ({ targetUsername, authUser }) => {
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const isOwner = authUser?.username === targetUsername;

    useEffect(() => {
        if (!targetUsername) return;
        fetchProfileData();
        fetchUserPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUsername]);

    const fetchProfileData = async () => {
        setLoadingProfile(true);
        try {
            const data = await UserService.getUserByHandle(targetUsername);
            setProfileData(data);
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const posts = await PostService.getUserPosts(targetUsername);
            setUserPosts(posts || []);
        } catch (error) {
            console.error('Failed to fetch user posts', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDeletePost = (postId) => {
        setUserPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    };

    const toggleFollow = async () => {
        if (!profileData) return;
        try {
            const res = await UserService.followUser(profileData.id);
            setProfileData((prev) => ({
                ...prev,
                isFollowing: res.following,
                followersCount: res.following ? prev.followersCount + 1 : prev.followersCount - 1
            }));
        } catch (error) {
            console.error('Failed to toggle follow', error);
        }
    };

    const userView = useMemo(() => {
        if (!profileData) return null;
        return {
            name: profileData.full_name || profileData.username || 'User',
            handle: `@${profileData.username || 'user'}`,
            role: profileData.role || 'student',
            level: profileData.year,
            class: profileData.studentClass || 'N/A',
            filiere: profileData.filiere,
            email: profileData.email,
            location: profileData.location || 'Rabat, Maroc',
            bio: profileData.bio || '',
            joinDate: profileData.created_at || profileData.createdAt,
            avatar: profileData.avatar ? `${BASE_URL}${profileData.avatar}` : null,
            banner: profileData.banner ? `${BASE_URL}${profileData.banner}` : null,
            stats: {
                posts: userPosts?.length || 0,
                followers: profileData.followersCount || 0,
                following: profileData.followingCount || 0
            }
        };
    }, [profileData, userPosts?.length]);

    return {
        profileData,
        userPosts,
        loadingPosts,
        loadingProfile,
        isOwner,
        userView,
        handleDeletePost,
        toggleFollow
    };
};

export default useProfilePage;
