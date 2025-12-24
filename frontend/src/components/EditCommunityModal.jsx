import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Camera, Upload } from 'lucide-react';
import CommunityService from '../services/community.service';
import { uploadImages } from '../services/media.service';
import './css/CreateCommunityModal.css'; // Reusing the same CSS for now

const EditCommunityModal = ({ isOpen, onClose, community, onUpdate }) => {
    const [name, setName] = useState(community?.name || '');
    const [description, setDescription] = useState(community?.description || '');
    const [privacy, setPrivacy] = useState(community?.privacy || 'PUBLIC');
    const [icon, setIcon] = useState(community?.icon || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (community) {
            setName(community.name);
            setDescription(community.description || '');
            setPrivacy(community.privacy);
            setIcon(community.icon);
        }
    }, [community]);

    if (!isOpen) return null;

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            // Use media service to upload
            const urls = await uploadImages([file]);
            const url = urls[0];

            if (type === 'icon') setIcon(url);
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updated = await CommunityService.updateCommunity(community.id, {
                name, description, privacy, icon
            });
            onUpdate(updated);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5001${path}`;
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Modifier la communauté</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: icon ? `url(${getImageUrl(icon)}) center/cover` : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                border: '1px solid var(--border)'
                            }}
                            onClick={() => document.getElementById('edit-icon-upload').click()}
                        >
                            <input
                                type="file"
                                id="edit-icon-upload"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'icon')}
                            />
                            {!icon && <span style={{ fontSize: '2rem', color: 'white' }}>{name.substring(0, 2).toUpperCase()}</span>}
                            <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--bg-card)', padding: '4px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                <Camera size={16} color="var(--text-main)" />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Nom</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Description</label>
                        <textarea
                            className="modal-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Confidentialité</label>
                        <div className="privacy-options">
                            <div
                                className={`privacy-option ${privacy === 'PUBLIC' ? 'selected' : ''}`}
                                onClick={() => setPrivacy('PUBLIC')}
                            >
                                <div className="radio-circle">
                                    {privacy === 'PUBLIC' && <div className="radio-dot" />}
                                </div>
                                <div>
                                    <h4>Public</h4>
                                    <p>Tout le monde peut rejoindre</p>
                                </div>
                            </div>
                            <div
                                className={`privacy-option ${privacy === 'PRIVATE' ? 'selected' : ''}`}
                                onClick={() => setPrivacy('PRIVATE')}
                            >
                                <div className="radio-circle">
                                    {privacy === 'PRIVATE' && <div className="radio-dot" />}
                                </div>
                                <div>
                                    <h4>Privé</h4>
                                    <p>Sur invitation ou demande</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Annuler</button>
                    <button onClick={handleSubmit} className="create-btn" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditCommunityModal;
