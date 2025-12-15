import React, { useState } from 'react';
import { X } from 'lucide-react';
import './css/CodeEditor.css';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' }
];

const CodeEditor = ({ code, language, onCodeChange, onClose }) => {
    if (!code && !language) return null;

    return (
        <div className="code-editor-container">
            <div className="code-editor-header">
                <select
                    value={language}
                    onChange={(e) => onCodeChange({ code, language: e.target.value })}
                    className="language-select"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
                <button type="button" onClick={onClose} className="close-code-btn">
                    <X size={16} />
                </button>
            </div>
            <textarea
                value={code}
                onChange={(e) => onCodeChange({ code: e.target.value, language })}
                placeholder="Collez votre code ici..."
                className="code-textarea"
                rows="8"
            />
        </div>
    );
};

export default CodeEditor;
