const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please enter a username'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please enter your password'],
        },
        // TODO:    Add functionality to upload an avatar or default to the first letter of displayName
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
