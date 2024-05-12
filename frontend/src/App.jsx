import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './features/auth/Login';
import Register from './features/users/Register';
import GamesList from './features/games/GamesList';
import HomeScreen from './screens/HomeScreen';
import RequireAuth from './features/auth/RequireAuth';
import Header from './components/Header';
import GameBoard from './features/games/GameBoard';
import PersistLogin from './features/auth/PersistLogin';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<HomeScreen />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                {/* Private Routes */}
                <Route element={<PersistLogin />}>
                    <Route element={<RequireAuth />}>
                        <Route path="game">
                            <Route index element={<GamesList />} />
                            <Route path=":id" element={<GameBoard />} />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
