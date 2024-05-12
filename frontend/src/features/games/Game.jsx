import { useGetGamesQuery, useMakeGuessMutation } from './gamesApiSlice';
import { useState, useEffect, useCallback } from 'react';
import Keyboard from '../../components/keyboard/Keyboard';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { memo } from 'react';
import { socket } from './socket';

import './Game.css';

const Game = () => {
    const { id } = useParams();

    const { id: myId } = useAuth();

    const navigate = useNavigate();

    const [currentGuess, setCurrentGuess] = useState([]);
    const [guessError, setGuessError] = useState('');
    const [keyboardColors, setKeyboardColors] = useState({});
    const [singleFormattedGuess, setSingleFormattedGuess] = useState(null);

    const [makeGuess, { isLoading, isSuccess, isError, error }] =
        useMakeGuessMutation();

    const compareWord = (word, guess) => {
        // console.log('word', word, 'guess', guess);
        const wordArray = word.split('');
        const guessArray = guess.split('');
        let result = [];

        for (let i = 0; i < wordArray.length; i++) {
            if (guessArray[i] === wordArray[i]) {
                result.push({
                    letter: guessArray[i],
                    color: 'green',
                    position: i,
                });
                guessArray[i] = '';
                wordArray[i] = '';
            }
        }

        for (let i = 0; i < guessArray.length; i++) {
            const guessedLetter = guessArray[i];
            if (guessedLetter && wordArray.includes(guessedLetter)) {
                result.push({
                    letter: guessedLetter,
                    color: 'yellow',
                    position: i,
                });
                guessArray[guessArray.indexOf(guessedLetter)] = '';
                wordArray[wordArray.indexOf(guessedLetter)] = '';
            }
        }

        guessArray.forEach((guessedLetter, index) => {
            if (guessedLetter && !wordArray.includes(guessedLetter)) {
                result.push({
                    letter: guessedLetter,
                    color: 'gray',
                    position: index,
                });
            }
        });

        let newObj = result
            .sort((a, b) => a.position - b.position)
            .map((r) => {
                return new Object({
                    letter: r.letter,
                    color: r.color,
                });
            });

        return newObj;
    };

    const handleLetterClicked = (letter) => {
        setGuessError('');

        if (currentGuess.length < 5) {
            const newGuess = [...currentGuess, letter];
            setCurrentGuess(newGuess);
            const storageKey = `partialWord_${id}`;
            localStorage.setItem(storageKey, newGuess.join(''));
            socket.emit('letterClicked', letter, id);
        }
    };

    useEffect(() => {
        socket.emit('joinGame', id);

        const storageKey = `partialWord_${id}`;

        const storedPartialWord = localStorage.getItem(storageKey);

        if (storedPartialWord) {
            setCurrentGuess(storedPartialWord.split(''));
        }
    }, [id]);

    useEffect(() => {
        function onLetterClicked(letter) {
            setCurrentGuess((previous) => [...previous, letter]);
            const newGuess = [...currentGuess, letter];
            const storageKey = `partialWord_${id}`;
            localStorage.setItem(storageKey, newGuess.join(''));
        }

        function onDeleteClicked() {
            if (currentGuess.length > 0) {
                const newGuess = currentGuess.slice(0, -1);
                setCurrentGuess(newGuess);
                const storageKey = `partialWord_${id}`;
                localStorage.setItem(storageKey, newGuess.join(''));
            }
        }

        const updateKeyboardColors = (thisGuess) => {
            if (!thisGuess) {
                return;
            }
            const newKeyboardColors = { ...keyboardColors };
            console.log(thisGuess);

            thisGuess.forEach((letter) => {
                if (letter.color === 'green') {
                    newKeyboardColors[letter.letter] = 'green';
                } else if (letter.color === 'yellow') {
                    newKeyboardColors[letter.letter] =
                        newKeyboardColors[letter.letter] === 'green'
                            ? 'green'
                            : 'yellow';
                } else {
                    newKeyboardColors[letter.letter] =
                        newKeyboardColors[letter.letter] === 'green' ||
                        newKeyboardColors[letter.letter] === 'yellow'
                            ? newKeyboardColors[letter.letter]
                            : 'gray';
                }
            });

            setKeyboardColors(newKeyboardColors);
        };

        function handleGameStateUpdate({
            currentGuess,
            formattedGuess,
            keyboardColors,
        }) {
            console.log(formattedGuess);
            const storageKey = `partialWord_${id}`;
            if (currentGuess) {
                console.log(typeof currentGuess);
                localStorage.setItem(storageKey, currentGuess);
            }
            setCurrentGuess(currentGuess);
            setSingleFormattedGuess(formattedGuess);
            if (formattedGuess !== null) {
                updateKeyboardColors(formattedGuess);
            }
            setKeyboardColors(keyboardColors);
        }

        function removeLocalStorage() {
            const storageKey = `partialWord_${id}`;
            localStorage.removeItem(storageKey);
        }

        socket.on('letterClicked', onLetterClicked);
        socket.on('deleteClicked', onDeleteClicked);
        socket.on('gameStateUpdate', handleGameStateUpdate);
        socket.on('submitGuess', removeLocalStorage);

        return () => {
            socket.off('letterClicked');
            socket.off('deleteClicked');
            socket.off('submitGuess');
            socket.off('gameStateUpdate');
        };
    }, [currentGuess, id, keyboardColors]);

    const handleEnterClicked = async () => {
        if (currentGuess.length < 5) {
            setGuessError('Answer is not long enough');
            return;
        }

        const guess = currentGuess.join('').toLowerCase();

        const newFormattedWord = compareWord(game.word, guess);

        console.log(newFormattedWord);

        try {
            const result = await makeGuess({ id, guess }).unwrap();
            console.log(result);
            const storageKey = `partialWord_${id}`;
            localStorage.removeItem(storageKey);
            socket.emit('gameStateUpdate', {
                gameId: id,
                currentGuess: guess,
                formattedGuess: newFormattedWord,
                keyboardColors,
            });
            console.log(singleFormattedGuess);
            updateKeyboardColors(newFormattedWord);
            setCurrentGuess([]);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteClicked = () => {
        if (currentGuess.length > 0) {
            const newGuess = currentGuess.slice(0, -1);
            setCurrentGuess(newGuess);
            const storageKey = `partialWord_${id}`;
            localStorage.setItem(storageKey, newGuess.join(''));
            socket.emit('deleteClicked', id);
        }
    };

    const updateKeyboardColors = (thisGuess) => {
        if (!thisGuess) {
            return;
        }
        const newKeyboardColors = { ...keyboardColors };
        console.log(thisGuess);

        thisGuess.forEach((letter) => {
            if (letter.color === 'green') {
                newKeyboardColors[letter.letter] = 'green';
            } else if (letter.color === 'yellow') {
                newKeyboardColors[letter.letter] =
                    newKeyboardColors[letter.letter] === 'green'
                        ? 'green'
                        : 'yellow';
            } else {
                newKeyboardColors[letter.letter] =
                    newKeyboardColors[letter.letter] === 'green' ||
                    newKeyboardColors[letter.letter] === 'yellow'
                        ? newKeyboardColors[letter.letter]
                        : 'gray';
            }
        });

        setKeyboardColors(newKeyboardColors);
    };

    const { game } = useGetGamesQuery('gamesList', {
        selectFromResult: ({ data }) => ({
            game: data?.entities[id],
        }),
    });

    const errContent = error?.data?.message ?? '';

    const renderGuessRows = () => {
        const rows = [];
        const maxRows = 6;
        const guessCount = game?.formattedGuesses.length || 0;
        console.log(currentGuess.join(''));

        const newGuess = compareWord(game.word, currentGuess.join(''));

        console.log('this is it!!', newGuess);
        for (let i = 0; i < maxRows; i++) {
            console.log(currentGuess);
            const guess =
                game?.formattedGuesses[i] ||
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

    useEffect(() => {
        const initialKeyboardColors = {};

        if (game && game.formattedGuesses.length > 0) {
            game.formattedGuesses.forEach((guess) => {
                guess.forEach((letter) => {
                    console.log([letter.letter, letter.color]);
                    // if (letter.color === 'green') {
                    //     initialKeyboardColors[letter.letter] = 'green';
                    // } else if (letter.color === 'yellow') {
                    //     initialKeyboardColors[letter.letter] =
                    //         initialKeyboardColors[letter.letter] === 'green'
                    //             ? 'green'
                    //             : 'yellow';
                    // } else {
                    //     initialKeyboardColors[letter.letter] =
                    //         initialKeyboardColors[letter.letter] === 'green' ||
                    //         initialKeyboardColors[letter.letter] === 'yellow'
                    //             ? initialKeyboardColors[letter.letter]
                    //             : 'gray';
                    // }
                });
            });
        }

        setKeyboardColors(initialKeyboardColors);
    }, [game]);

    if (!game) {
        return <p>Begone...</p>;
        // } else if (game.isComplete === true) {
        //     return <p>This game is over</p>;
    } else {
        return (
            <>
                <div className="game-container">
                    <div className="game-board-container">
                        <div className="game-board">{renderGuessRows()}</div>
                    </div>

                    <div className="keyboard">
                        <div className="keyboard-keys">
                            <Keyboard
                                currentGuess={currentGuess}
                                onLetterClicked={handleLetterClicked}
                                onEnterClicked={handleEnterClicked}
                                onDeleteClicked={handleDeleteClicked}
                                isTurn={game.whoseTurn._id === myId}
                                keyboardColors={keyboardColors}
                            />
                        </div>
                    </div>
                    {guessError && (
                        <p className="error-message"> {guessError}</p>
                    )}
                </div>
            </>
        );
    }
};

const memoizedGame = memo(Game);

export default memoizedGame;
