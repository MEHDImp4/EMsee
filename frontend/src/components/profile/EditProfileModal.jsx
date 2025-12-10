
import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user, loginAction } = useAuth();

    // Initialize state with user data
    const [formData, setFormData] = useState({
        full_name: user?.full_name || user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        filiere: user?.filiere || '',
        year: user?.year || ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const FILIERES = ['iir', 'gesi', 'iaii', 'gcb', 'gi', 'gf'];
    const YEARS = ['prepa_1', 'prepa_2', 'cycle_1', 'cycle_2', 'cycle_3'];

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('bio', formData.bio);
        data.append('location', formData.location);
        data.append('filiere', formData.filiere);
        data.append('year', formData.year);

        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            // Use api service which handles token and headers
            // Note: api.js handles JSON, but for FormData we might need to let browser set Content-Type
            // api.js implementation: if body is FormData, it deletes Content-Type header. Perfect.
            const response = await api.put('/auth/profile', data);

            // Update local context
            const token = localStorage.getItem('token');
            loginAction(response, token);
            onClose();
        } catch (err) {
            console.error(err);
            setError(t('errors.generic', 'An error occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{t('profile.edit', 'Edit Profile')}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        {/* Avatar Upload */}
                        <div className="avatar-upload-area">
                            <div className="avatar-preview">
                                {preview ? (
                                    <img src={preview} alt="Avatar" />
                                ) : (
                                    <span className="avatar-placeholder">
                                        {formData.full_name ? formData.full_name.charAt(0) : 'U'}
                                    </span>
                                )}
                            </div>
                            <label className="upload-btn">
                                <Upload size={16} />
                                {t('profile.change_photo', 'Change Photo')}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div className="form-field">
                            <label>{t('auth.full_name')}</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-field">
                            <label>{t('profile.location', 'Location')}</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Casablanca, Maroc"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-field">
                            <label>{t('profile.bio', 'Bio')}</label>
                            <textarea
                                name="bio"
                                rows="3"
                                value={formData.bio}
                                onChange={handleChange}
                            ></textarea>
                        </div>



                        {error && <p className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="save-btn"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    {t('common.save', 'Save Changes')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
