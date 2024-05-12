// import { useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// // TODO:    This might not work as intended...
// import useAuth from '../hooks/useAuth';
// import { useSendLogoutMutation } from '../features/auth/authApiSlice';
// import { logOut } from '../features/auth/authSlice';

// const Header = () => {
//     //TODO: This might not work as intended...
//     const { displayName, id } = useAuth();

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [logoutApiCall] = useSendLogoutMutation();

//     const logoutHandler = async () => {
//         try {
//             await logoutApiCall().unwrap();
//             dispatch(logOut());
//             navigate('/login');
//         } catch (err) {
//             console.error(err);
//         }
//     };
//     return (
//         <header className="header">
//             <Link to="/">
//                 <h1>LDWGWF</h1>
//             </Link>
//             <nav>
//                 {displayName && id ? (
//                     <>

//                         <button
//                             className="logout-button"
//                             onClick={logoutHandler}
//                         >
//                             Logout
//                         </button>
//                     </>
//                 ) : (
//                     <>
//                         <Link to="/login">Login</Link>
//                         <Link to="/register">Register</Link>
//                     </>
//                 )}
//             </nav>
//         </header>
//     );
// };

// export default Header;

import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useSendLogoutMutation } from '../features/auth/authApiSlice';
import { logOut } from '../features/auth/authSlice';

import './Header.css';

const Header = () => {
    const { username, id } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useSendLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logOut());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/game" className="logo">
                    <h1>LDWGWF</h1>
                </Link>
                <nav className="nav">
                    {username && id ? (
                        <div className="user-info">
                            <div className="display-name">{username}</div>
                            <button
                                className="logout-button"
                                onClick={logoutHandler}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                            <Link to="/register" className="nav-link">
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
