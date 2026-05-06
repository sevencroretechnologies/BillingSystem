import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { token } = useAuth();
    const location = useLocation();

    const isAuthenticated = token && token !== 'null' && token !== 'undefined';

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
