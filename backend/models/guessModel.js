const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema(
    {
        guess: {
            type: Array,
            required: true,
        },
        guessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        wasCorrect: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Guess', guessSchema);
