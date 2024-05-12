import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../auth/authSlice';
import { useLoginMutation } from '../auth/authApiSlice';
import { useAddNewUserMutation } from './usersApiSlice';
import { toast } from 'react-toastify';

const Register = () => {
    const usernameRef = useRef();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [addNewUser] = useAddNewUserMutation();
    const [login, { isLoading }] = useLoginMutation();

    useEffect(() => {
        usernameRef.current.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast('Password and confirm password must match.', {});
            return;
        }

        try {
            await addNewUser({
                username,
                password,
            }).unwrap();
            const { accessToken } = await login({
                username,
                password,
            }).unwrap();
            dispatch(setCredentials({ accessToken }));
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            navigate('/game');
        } catch (error) {
            toast(error?.data?.message || error.error, {});
        }
    };

    const handleUsernameInput = (e) => setUsername(e.target.value);
    const handlePasswordInput = (e) => setPassword(e.target.value);
    const handleConfirmPasswordInput = (e) =>
        setConfirmPassword(e.target.value);

    const canSave =
        [username, password, confirmPassword].every(Boolean) && !isLoading;

    const content = (
        <section className="auth-container">
            <header>
                <h1>Register</h1>
            </header>
            <form className="form-title" onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="username">
                    Username:
                </label>
                <input
                    type="text"
                    id="username"
                    ref={usernameRef}
                    value={username}
                    onChange={handleUsernameInput}
                    autoComplete="off"
                    required
                />

                <label className="form-label" htmlFor="password">
                    Password:
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordInput}
                    required
                />

                <label className="form-label" htmlFor="confirmPasswrd">
                    Confirm Password:
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordInput}
                    required
                />
                <button className="form-button" disabled={!canSave}>
                    Register
                </button>
            </form>
        </section>
    );

    return content;
};

export default Register;
