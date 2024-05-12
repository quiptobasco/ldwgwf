const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean();

    if (!users?.length) {
        return res.status(400).json({ message: 'No users found.' });
    }

    res.json(users);
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createNewUser = async (req, res) => {
    const { username, password, displayName } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const userExists = await User.findOne({ username })
        .collation({ locale: 'en', strength: 2 })
        .lean()
        .exec();

    if (userExists) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        password: hashedPassword,
        displayName,
    });

    if (user) {
        return res.status(201).json({
            _id: user.id,
            username: user.username,
        });
    } else {
        return res.status(400).json({ message: 'Invalid user data.' });
    }
};

module.exports = { getAllUsers, createNewUser };
