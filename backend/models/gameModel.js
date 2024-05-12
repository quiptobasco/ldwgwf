const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
    {
        word: {
            type: String,
            required: true,
        },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        guesses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Guess',
                default: [],
            },
        ],
        whoseTurn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isComplete: {
            type: Boolean,
            default: false,
        },
        correctlyGuessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
