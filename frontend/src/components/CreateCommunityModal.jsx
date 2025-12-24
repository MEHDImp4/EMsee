import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Users, Lock } from 'lucide-react';
import CommunityService from '../services/community.service';
import './css/CreateCommunityModal.css';

const CreateCommunityModal = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('PUBLIC');
    const [writeAccess, setWriteAccess] = useState('EVERYONE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await CommunityService.createCommunity({
                name,
                description,
                privacy,
                writeAccess
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    // Use Portal to render outside of any parent stacking contexts (overflow, transforms, etc.)
    return ReactDOM.createPortal(
        <div
            className="modal-overlay"
            style={{ zIndex: 99999 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Créer une communauté</h2>
                    <button className="close-btn" type="button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label className="input-label">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ex: Fans de Tech"
                            required
                            className="modal-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="De quoi parle ce groupe ?"
                            className="modal-input"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Confidentialité</label>
                        <div className="privacy-options">
                            <label className={`privacy-option ${privacy === 'PUBLIC' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    value="PUBLIC"
                                    checked={privacy === 'PUBLIC'}
                                    onChange={(e) => setPrivacy(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div className="radio-circle">
                                    {privacy === 'PUBLIC' && <div className="radio-dot" />}
                                </div>
                                <Users size={20} className="option-icon" />
                                <div className="option-text">
                                    <strong>Public</strong>
                                    <p>Tout le monde peut rejoindre</p>
                                </div>
                            </label>

                            <label className={`privacy-option ${privacy === 'PRIVATE' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    value="PRIVATE"
                                    checked={privacy === 'PRIVATE'}
                                    onChange={(e) => setPrivacy(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <div className="radio-circle">
                                    {privacy === 'PRIVATE' && <div className="radio-dot" />}
                                </div>
                                <Lock size={20} className="option-icon" />
                                <div className="option-text">
                                    <strong>Privé</strong>
                                    <p>Sur invitation ou demande</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Qui peut publier ?</label>
                        <select
                            value={writeAccess}
                            onChange={(e) => setWriteAccess(e.target.value)}
                            className="modal-input"
                        >
                            <option value="EVERYONE">Tout le monde</option>
                            <option value="ADMINS_ONLY">Admins uniquement (Canal d'annonce)</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="create-btn"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? 'Création...' : 'Créer le groupe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body // Target container
    );
};

export default CreateCommunityModal;
