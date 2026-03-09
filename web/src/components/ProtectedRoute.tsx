import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the correct portal based on role
        const redirectMap: Record<string, string> = {
            industry: '/industry/dashboard',
            government: '/gov/dashboard',
            auditor: '/auditor/dashboard',
            admin: '/admin/dashboard',
        };
        const redirectPath = redirectMap[user.role] ?? '/login';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;

