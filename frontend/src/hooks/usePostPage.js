import { useEffect, useRef, useState } from 'react';
import PostService from '../services/post.service';



const usePostPage = ({ id, socket }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postData = await PostService.getPostById(id);
                setPost(postData);
            } catch (error) {
                console.error('Failed to load post', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPost();
    }, [id]);

    return {
        post,
        loading
    };
};

export default usePostPage;
