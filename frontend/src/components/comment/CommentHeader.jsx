import React from 'react';
import { ArrowLeft } from 'lucide-react';

const CommentHeader = ({ title, onBack }) => (
  <div className="comment-page-header">
    <button className="back-button" onClick={onBack}>
      <ArrowLeft size={20} />
    </button>
    <h2>{title}</h2>
    <div style={{ width: '36px' }} />
  </div>
);

export default CommentHeader;