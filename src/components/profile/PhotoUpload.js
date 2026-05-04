import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PhotoUpload({ onPhotoChange }) {
    const { userProfile, firebaseUser } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result;
                if (base64) {
                    localStorage.setItem('userPhoto', base64);
                    onPhotoChange?.(base64);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Photo upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    const photoUrl = localStorage.getItem('userPhoto') || userProfile?.photoURL || firebaseUser?.photoURL;
    const initials = userProfile?.fullName?.[0] || firebaseUser?.displayName?.[0] || firebaseUser?.email?.[0] || 'U';

    return (
        <div className="profile-photo-section">
            <div className="profile-photo-wrapper" onClick={handleClick}>
                {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="profile-photo" />
                ) : (
                    <div className="profile-photo-initials">{initials}</div>
                )}
                <div className="photo-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </div>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="photo-upload-input"
                onChange={handleFileChange}
                disabled={loading}
            />
        </div>
    );
}
