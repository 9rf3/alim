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

function getCabinetRoute(role) {
    return role === 'teacher' ? '/teacher' : '/cabinet';
}

export function OnboardingRoute({ children }) {
    const { isAuthenticated, isOnboardingComplete, userProfile, loading } = useAuth();

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
        return <Navigate to={getCabinetRoute(userProfile?.role)} replace />;
    }

    return children;
}

export function PublicRoute({ children }) {
    const { isAuthenticated, isOnboardingComplete, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (isOnboardingComplete) {
            return <Navigate to={getCabinetRoute(userProfile?.role)} replace />;
        }
        return <Navigate to="/profile-setup" replace />;
    }

    return children;
}
