import React, { useState, useRef } from 'react';
import { Image, Code, BarChart2, X } from 'lucide-react';
import './css/MediaPicker.css';
import { useTranslation } from 'react-i18next';

const MediaPicker = ({ onMediaChange, onPollChange }) => {
    const [activeMode, setActiveMode] = useState(null); // 'image', 'code', 'poll'
    const [images, setImages] = useState([]);
    const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'javascript' });
    const [poll, setPoll] = useState({ question: '', options: ['', ''] });
    const fileInputRef = useRef(null);
    const { t } = useTranslation();

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: 'IMAGE'
        }));
        
        const updatedImages = [...images, ...newImages].slice(0, 4); // Max 4 images
        setImages(updatedImages);
        onMediaChange(updatedImages);
    };

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onMediaChange(updated);
    };

    const handleCodeChange = (field, value) => {
        const updated = { ...codeSnippet, [field]: value };
        setCodeSnippet(updated);
        onMediaChange([{ type: 'CODE', code: updated.code, language: updated.language }]);
    };

    const handlePollChange = (field, value, index) => {
        if (field === 'question') {
            const updated = { ...poll, question: value };
            setPoll(updated);
            onPollChange(updated);
        } else {
            const updated = { ...poll };
            updated.options[index] = value;
            setPoll(updated);
            onPollChange(updated);
        }
    };

    const addPollOption = () => {
        if (poll.options.length < 4) {
            const updated = { ...poll, options: [...poll.options, ''] };
            setPoll(updated);
            onPollChange(updated);
        }
    };

    const removePollOption = (index) => {
        if (poll.options.length > 2) {
            const updated = { ...poll, options: poll.options.filter((_, i) => i !== index) };
            setPoll(updated);
            onPollChange(updated);
        }
    };

    const resetMode = () => {
        setActiveMode(null);
        setImages([]);
        setCodeSnippet({ code: '', language: 'javascript' });
        setPoll({ question: '', options: ['', ''] });
        onMediaChange([]);
        onPollChange(null);
    };

    return (
        <div className="media-picker">
            {/* Mode Buttons */}
            <div className="media-picker-buttons">
                    <button
                    type="button"
                    className={`media-btn ${activeMode === 'image' ? 'active' : ''}`}
                    onClick={() => {
                        if (activeMode === 'image') resetMode();
                        else {
                            resetMode();
                            setActiveMode('image');
                            fileInputRef.current?.click();
                        }
                    }}
                    title={t('media_picker.title_images', 'Ajouter des images')}
                >
                    <Image size={20} />
                </button>
                <button
                    type="button"
                    className={`media-btn ${activeMode === 'code' ? 'active' : ''}`}
                    onClick={() => {
                        if (activeMode === 'code') resetMode();
                        else {
                            resetMode();
                            setActiveMode('code');
                        }
                    }}
                    title={t('media_picker.title_code', 'Ajouter un code')}
                >
                    <Code size={20} />
                </button>
                <button
                    type="button"
                    className={`media-btn ${activeMode === 'poll' ? 'active' : ''}`}
                    onClick={() => {
                        if (activeMode === 'poll') resetMode();
                        else {
                            resetMode();
                            setActiveMode('poll');
                        }
                    }}
                    title={t('media_picker.title_poll', 'Créer un sondage')}
                >
                    <BarChart2 size={20} />
                </button>
            </div>

            {/* Image Upload */}
            {activeMode === 'image' && (
                <div className="media-content">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <div className="image-preview-grid">
                        {images.map((img, index) => (
                            <div key={index} className="image-preview-item">
                                <img src={img.preview} alt={`Preview ${index}`} />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => removeImage(index)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        {images.length < 4 && (
                            <button
                                type="button"
                                className="add-image-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image size={24} />
                                <span>{t('media_picker.add', 'Ajouter')}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Code Snippet */}
            {activeMode === 'code' && (
                <div className="media-content code-editor">
                    <select
                        value={codeSnippet.language}
                        onChange={(e) => handleCodeChange('language', e.target.value)}
                        className="language-select"
                    >
                        <option value="javascript">{t('media.languages.javascript', 'JavaScript')}</option>
                        <option value="python">{t('media.languages.python', 'Python')}</option>
                        <option value="java">{t('media.languages.java', 'Java')}</option>
                        <option value="cpp">{t('media.languages.cpp', 'C++')}</option>
                        <option value="php">{t('media.languages.php', 'PHP')}</option>
                        <option value="html">{t('media.languages.html', 'HTML')}</option>
                        <option value="css">{t('media.languages.css', 'CSS')}</option>
                        <option value="sql">{t('media.languages.sql', 'SQL')}</option>
                    </select>
                    <textarea
                        placeholder={t('media_picker.code_placeholder', 'Paste your code here...')}
                        value={codeSnippet.code}
                        onChange={(e) => handleCodeChange('code', e.target.value)}
                        className="code-textarea"
                        rows="8"
                    />
                </div>
            )}

            {/* Poll Creator */}
            {activeMode === 'poll' && (
                <div className="media-content poll-creator">
                    <input
                        type="text"
                        placeholder={t('media_picker.poll_question', 'Poll question')}
                        value={poll.question}
                        onChange={(e) => handlePollChange('question', e.target.value)}
                        className="poll-question-input"
                    />
                    <div className="poll-options">
                        {poll.options.map((option, index) => (
                            <div key={index} className="poll-option-row">
                                    <input
                                    type="text"
                                    placeholder={t('media_picker.poll_option', `Option ${index + 1}`)}
                                    value={option}
                                    onChange={(e) => handlePollChange('option', e.target.value, index)}
                                    className="poll-option-input"
                                />
                                {poll.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removePollOption(index)}
                                        className="remove-option-btn"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {poll.options.length < 4 && (
                        <button
                            type="button"
                            onClick={addPollOption}
                            className="add-option-btn"
                        >
                            {t('media_picker.add_poll_option', '+ Ajouter une option')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaPicker;
