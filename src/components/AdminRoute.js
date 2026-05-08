import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!loading) {
            setChecked(true);
        }
    }, [loading]);

    if (loading || !checked) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/a/ctrl" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/cabinet" replace />;
    }

    return children;
}
