import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import { toast } from 'react-toastify';

const Login = () => {
    const usernameRef = useRef();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    useEffect(() => {
        usernameRef.current.focus();
    }, []);

    const canSave = [username, password].every(Boolean) && !isLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { accessToken } = await login({
                username,
                password,
            }).unwrap();
            dispatch(setCredentials({ accessToken }));
            setUsername('');
            setPassword('');
            navigate('/game');
        } catch (err) {
            if (!err.status) {
                toast('No server response.', {});
            } else if (err.status === 400) {
                toast('Missing username or password.', {});
            } else if (err.status === 401) {
                toast('Failed to login.  Try again.', {});
            } else {
                toast(err.data?.message, {});
            }
        }
    };

    const handleUsernameInput = (e) => setUsername(e.target.value);
    const handlePasswordInput = (e) => setPassword(e.target.value);

    if (isLoading) return <p>Loading...</p>;

    const content = (
        <section className="auth-container">
            <header>
                <h1>Login</h1>
            </header>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={usernameRef}
                    value={username}
                    onChange={handleUsernameInput}
                    autoComplete="off"
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={handlePasswordInput}
                    value={password}
                    required
                />
                <button disabled={!canSave}>Sign In</button>
            </form>
        </section>
    );

    return content;
};

export default Login;
