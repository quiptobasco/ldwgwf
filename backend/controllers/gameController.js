const Game = require('../models/gameModel');
const Guess = require('../models/guessModel');
const User = require('../models/userModel');
const {
    getRandomWord,
    isGuessValid,
    isIdMatch,
    compareWord,
} = require('../utils/gameUtils');

// @desc    Create game
// @route   POST /api/games/create
// @access  Private
const createGame = async (req, res) => {
    const myId = req.user.id;
    const { username } = req.body;

    const opponent = await User.findOne({ username });

    if (!opponent) {
        return res.status(400).json({ message: 'No user found.' });
    }

    if (myId === opponent._id) {
        return res.status(400).json({
            message:
                'Must select someone (other than yourself) to start a game with.',
        });
    }

    const game = await Game.create({
        word: getRandomWord(),
        players: [myId, opponent._id],
        whoseTurn: myId,
    });

    if (game) {
        return res.status(201).json({
            _id: game.id,
            players: game.players,
            whoseTurn: game.whoseTurn,
            guesses: game.guesses,
            isComplete: game.isComplete,
        });
    } else {
        return res.status(400).json({ message: 'Invalid game data.' });
    }
};

// @desc    Get active games
// @route   GET /api/games
// @access  Private
const getGames = async (req, res) => {
    const myId = req.user.id;

    const games = await Game.find({
        players: myId,
    })
        .populate('players', 'username')
        .populate('whoseTurn', 'username')
        .populate('guesses')
        .populate('correctlyGuessedBy', 'username')
        .exec();

    if (games) {
        return res.status(200).json(games);
    } else {
        return res.status(400).json({ message: 'No games found.' });
    }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Private
const getSingleGame = async (req, res) => {
    const myId = req.user.id;

    const game = await Game.findById(req.params.id)
        .select('-word')
        .populate('players', 'displayName')
        .populate('whoseTurn', 'displayName')
        .populate('guesses')
        .exec();

    if (game && isIdMatch(game.players, myId)) {
        return res.status(200).json(game);
    } else {
        return res.status(400).json({ message: 'Game not found.' });
    }
};

// @desc    Make guess
// @route   POST /api/games/guess
// @access  Private
const makeGuess = async (req, res) => {
    const { id, guess } = req.body;

    if (!isGuessValid(guess)) {
        return res.status(400).json({ message: 'Not a valid word.' });
    }

    const myId = req.user.id;

    const game = await Game.findById(id);

    if (!game || !isIdMatch(game.players, myId)) {
        return res.status(400).json({ message: 'Game not found.' });
    }

    if (!game.whoseTurn.equals(myId)) {
        return res
            .status(400)
            .json({ message: 'It is not your turn to guess.' });
    }

    if (game.guesses.length >= 6 || game.isComplete) {
        return res
            .status(400)
            .json({ message: 'Too many quesses, this game is closed.' });
    }

    const newGuess = new Guess({
        guess: compareWord(game.word, guess),
        guessedBy: myId,
    });

    if (newGuess) {
        game.guesses.push(newGuess._id);

        if (guess === game.word) {
            game.isComplete = true;
            game.correctlyGuessedBy = myId;
            newGuess.wasCorrect = true;
            await Promise.all([game.save(), newGuess.save()]);
            return res
                .status(200)
                .json({ message: 'Congratulations, you guessed the word!' });
        }

        if (game.guesses.length === 6) {
            game.isComplete = true;
            await Promise.all([game.save(), newGuess.save()]);
            return res.status(200).json({
                message: `The game is over.  You did not guess the word which was: ${game.word}`,
            });
        }

        // Update whoseTurn and use that on frontend to validate if you can guess or not
        let newPlayerTurn = game.players.filter(
            (player) => !player.equals(myId)
        );

        game.whoseTurn = newPlayerTurn;
        await Promise.all([game.save(), newGuess.save()]);
        return res.status(200).json(game);
    } else {
        return res.status(400).json({ message: 'Failed to make a new guess.' });
    }
};

// @desc    Get all inactive games
// @route   GET /api/games/stats
// @access  Private
const stats = async (req, res) => {
    const myId = req.user.id;

    const games = await Game.find({
        players: myId,
        isComplete: true,
    });

    if (games) {
        const correctGuesses = games.filter(
            (player) =>
                player.correctlyGuessedBy?._id.toString() === myId.toString()
        );

        const gamesFailed = games.filter(
            (obj) => obj.correctlyGuessedBy === null
        );

        // TODO:    Should I do the math for the stats on the backend before I return it?
        //          Or should I just return the stats and do the math on the frontend?
        return res.status(200).json({
            totalCompletedGames: games.length,
            correctGuesses: correctGuesses.length,
            gamesFailed: gamesFailed.length,
        });
    } else {
        return res.status(400).json({ message: 'No games found.' });
    }
};

module.exports = {
    getGames,
    getSingleGame,
    createGame,
    makeGuess,
    stats,
};
