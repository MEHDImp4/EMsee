import React from 'react';
import { X } from 'lucide-react';
import './css/PollCreator.css';

const PollCreator = ({ poll, onPollChange, onClose }) => {
    if (!poll) return null;

    const handleQuestionChange = (value) => {
        onPollChange({ ...poll, question: value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...poll.options];
        newOptions[index] = value;
        onPollChange({ ...poll, options: newOptions });
    };

    const addOption = () => {
        if (poll.options.length < 4) {
            onPollChange({ ...poll, options: [...poll.options, ''] });
        }
    };

    const removeOption = (index) => {
        if (poll.options.length > 2) {
            const newOptions = poll.options.filter((_, i) => i !== index);
            onPollChange({ ...poll, options: newOptions });
        }
    };

    return (
        <div className="poll-creator-container">
            <div className="poll-creator-header">
                <span className="poll-title">Créer un sondage</span>
                <button type="button" onClick={onClose} className="close-poll-btn">
                    <X size={16} />
                </button>
            </div>
            
            <input
                type="text"
                value={poll.question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="Posez votre question..."
                className="poll-question-input"
            />

            <div className="poll-options">
                {poll.options.map((option, index) => (
                    <div key={index} className="poll-option-item">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="poll-option-input"
                        />
                        {poll.options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="remove-option-btn"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {poll.options.length < 4 && (
                <button type="button" onClick={addOption} className="add-option-btn">
                    + Ajouter une option
                </button>
            )}
        </div>
    );
};

export default PollCreator;
