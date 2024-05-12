import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RequireAuth = () => {
    const location = useLocation();

    const { username, id } = useAuth();

    const content =
        username && id ? (
            <Outlet />
        ) : (
            <Navigate to="/login" state={{ from: location }} replace />
        );

    return content;
};

export default RequireAuth;
