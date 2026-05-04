import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requireOnboarding = true }) {
    const { isAuthenticated, isOnboardingComplete, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    if (requireOnboarding && !isOnboardingComplete) {
        return <Navigate to="/profile-setup" replace />;
    }

    return children;
}

export function OnboardingRoute({ children }) {
    const { isAuthenticated, isOnboardingComplete, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    if (isOnboardingComplete) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export function PublicRoute({ children }) {
    const { isAuthenticated, isOnboardingComplete, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (isOnboardingComplete) {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/profile-setup" replace />;
    }

    return children;
}
