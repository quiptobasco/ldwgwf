import { useGetGamesQuery, useMakeGuessMutation } from './gamesApiSlice';
import { useState, useEffect } from 'react';
import Keyboard from '../../components/keyboard/Keyboard';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

import { socket } from './socket';

import './Game.css';

const GameBoard = () => {
    const { id } = useParams();

    const { id: myId } = useAuth();

    const navigate = useNavigate();

    const [currentGuess, setCurrentGuess] = useState([]);
    const [keyboardColors, setKeyboardColors] = useState({});

    const [makeGuess, isError, error, isLoading] = useMakeGuessMutation();

    const { game } = useGetGamesQuery('gamesList', {
        selectFromResult: ({ data }) => ({
            game: data?.entities[id],
        }),
    });

    useEffect(() => {
        const initialKeyboardColors = {};

        if (game && game.guesses.length > 0) {
            game.guesses.forEach((guess) => {
                guess.guess.forEach((letter) => {
                    const currentColor =
                        initialKeyboardColors[letter.letter] || [];

                    if (
                        currentColor.length === 0 ||
                        currentColor[0] === 'gray'
                    ) {
                        initialKeyboardColors[letter.letter] = [letter.color];
                    } else if (letter.color === 'green') {
                        initialKeyboardColors[letter.letter] = ['green'];
                    } else if (
                        letter.color === 'yellow' &&
                        currentColor[0] !== 'green'
                    ) {
                        initialKeyboardColors[letter.letter] = ['yellow'];
                    }
                });
            });
        }

        setKeyboardColors(initialKeyboardColors);
    }, [game]);

    useEffect(() => {
        socket.emit('joinGame', id);

        const onLetterClicked = (letter) => {
            setCurrentGuess((previous) => [...previous, letter]);
        };

        const onDeleteClicked = () => {
            setCurrentGuess(currentGuess.slice(0, -1));
        };

        const onEnterClicked = () => {
            navigate(`/game/${id}`);
        };

        socket.on('letterClicked', onLetterClicked);
        socket.on('deleteClicked', onDeleteClicked);
        socket.on('enterClicked', onEnterClicked);

        return () => {
            socket.off('letterClicked');
            socket.off('deleteClicked');
            socket.off('enterClicked');
        };
    }, [id, currentGuess]);

    const handleLetterClicked = (letter) => {
        if (currentGuess.length < 5) {
            const newGuess = [...currentGuess, letter];
            setCurrentGuess(newGuess);
            socket.emit('letterClicked', letter, id);
        }
    };

    const handleEnterClicked = async () => {
        if (currentGuess.length < 5) {
            toast('Word must be 5 letters.', {});
            return;
        }

        const guess = currentGuess.join('').toLowerCase();

        try {
            await makeGuess({ id, guess }).unwrap();
            setCurrentGuess([]);
            socket.emit('enterClicked', id);
        } catch (error) {
            toast('Not in word list.', {});
        }
    };

    const handleDeleteClicked = () => {
        if (currentGuess.length > 0) {
            const newGuess = currentGuess.slice(0, -1);
            setCurrentGuess(newGuess);
            socket.emit('deleteClicked', id);
        }
    };

    const renderGameBoard = () => {
        const rows = [];
        const maxRows = 6;
        const guessCount = game?.guesses.length || 0;

        for (let i = 0; i < maxRows; i++) {
            const guess =
                game?.guesses[i]?.guess ||
                (i === guessCount
                    ? currentGuess.map((letter, index) => ({
                          letter,
                          color: 'gray',
                          index,
                      }))
                    : Array(5).fill({ letter: '', color: 'gray' }));

            const guessedBy = game?.guesses[i]?.guessedBy || null;

            rows.push(
                <div key={i} className="guess-row">
                    {maxRows && (
                        <div
                            className={`${
                                guessedBy === myId
                                    ? 'guess-tiles you'
                                    : guessedBy === null
                                    ? 'guess-tiles'
                                    : 'guess-tiles them'
                            }`}
                        >
                            {Array.from({ length: 5 }, (_, index) => (
                                <div
                                    key={index}
                                    className={`guess-tile ${
                                        guess[index]
                                            ? `${guess[index].color}`
                                            : 'empty-tile'
                                    }`}
                                >
                                    {guess[index]?.letter.toUpperCase() || ''}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return rows;
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!game || game.isComplete) {
        return (
            <div className="game-container">
                <div className="game-board-container">
                    <div className="game-board">{renderGameBoard()}</div>
                </div>
                {game?.word && (
                    <>
                        <div className="word">Secret word: {game?.word}</div>
                        <div className="word">
                            Correctly guessed by:{' '}
                            {game?.correctlyGuessedBy
                                ? game?.correctlyGuessedBy.username
                                : 'nobody'}
                        </div>
                    </>
                )}
            </div>
        );
    } else {
        return (
            <div className="game-container">
                <div className="game-board-container">
                    <div className="game-board">{renderGameBoard()}</div>
                </div>

                <div className="keyboard">
                    <div className="keyboard-keys">
                        <Keyboard
                            onLetterClicked={handleLetterClicked}
                            onEnterClicked={handleEnterClicked}
                            onDeleteClicked={handleDeleteClicked}
                            isTurn={game.whoseTurn._id === myId}
                            keyboardColors={keyboardColors}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default GameBoard;
