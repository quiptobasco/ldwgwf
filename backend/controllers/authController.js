const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Login
// @route   POST /api/auth
// @access  Public
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const foundUser = await User.findOne({ username }).exec();

    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) return res.status(401).json({ message: 'Unauthorized.' });

    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                id: foundUser.id,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
        { username: foundUser.username, id: foundUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
};

// @desc    Refresh
// @route   GET /api/auth/refresh
// @access  Public
const refresh = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt)
        return res.status(401).json({ message: 'Unauthorized.' });

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (error, decoded) => {
            if (error) return res.status(403).json({ message: 'Forbidden.' });

            const foundUser = await User.findOne({
                username: decoded.username,
            }).exec();

            if (!foundUser)
                return res.status(401).json({ message: 'Unauthorized.' });

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: foundUser.username,
                        id: foundUser.id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            res.json({ accessToken });
        }
    );
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    res.json({ message: 'Cookie cleared.' });
};

module.exports = {
    login,
    refresh,
    logout,
};
