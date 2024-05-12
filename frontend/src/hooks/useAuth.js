import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const token = useSelector(selectCurrentToken);

    if (token) {
        try {
            const decoded = jwtDecode(token);
            const { username, id } = decoded.UserInfo;

            return { username, id };
        } catch (error) {
            console.log('Error decoding token: ', error);
        }
    }

    return { username: '', id: '' };
};

export default useAuth;
