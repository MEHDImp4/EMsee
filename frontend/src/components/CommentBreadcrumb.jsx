import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './css/CommentBreadcrumb.css';

const CommentBreadcrumb = ({ post, path, currentComment }) => {
  const navigate = useNavigate();

  if (!post && (!path || path.length === 0)) {
    return null;
  }

  return (
    <div className="comment-breadcrumb">
      {/* Post link */}
      {post && (
        <>
          <button
            className="breadcrumb-item breadcrumb-post"
            onClick={() => navigate(`/posts/${post.id}`)}
            title="View post"
          >
            <span className="breadcrumb-label">Post</span>
            <span className="breadcrumb-author">@{post.user?.username}</span>
          </button>
          {(path && path.length > 0) && <ChevronRight size={16} className="breadcrumb-separator" />}
        </>
      )}

      {/* Path of parent comments */}
      {path && path.length > 0 && path.map((comment, index) => (
        <React.Fragment key={comment.id}>
          <button
            className="breadcrumb-item breadcrumb-comment"
            onClick={() => navigate(`/comments/${comment.id}`)}
            title={`Go to ${comment.user?.full_name}'s comment`}
          >
            <span className="breadcrumb-label">Comment</span>
            <span className="breadcrumb-author">@{comment.user?.username}</span>
          </button>
          {index < path.length - 1 && <ChevronRight size={16} className="breadcrumb-separator" />}
        </React.Fragment>
      ))}

      {/* Current comment */}
      {currentComment && (
        <>
          {(path && path.length > 0) && <ChevronRight size={16} className="breadcrumb-separator" />}
          <div className="breadcrumb-item breadcrumb-current">
            <span className="breadcrumb-label">Comment</span>
            <span className="breadcrumb-author">@{currentComment.user?.username}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CommentBreadcrumb;
