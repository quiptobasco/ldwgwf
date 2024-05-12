import { useEffect } from 'react';
import { MdOutlineBackspace } from 'react-icons/md';

const Keyboard = ({
    onLetterClicked,
    onEnterClicked,
    onDeleteClicked,
    isTurn,
    keyboardColors,
}) => {
    const LETTERS = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ];

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;

            if (/^[a-zA-Z]$/.test(key)) {
                onLetterClicked(event.key);
            } else if (key === 'Enter') {
                onEnterClicked();
            } else if (key === 'Backspace') {
                onDeleteClicked();
            }
        };

        if (isTurn) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onLetterClicked, onEnterClicked, onDeleteClicked, isTurn]);

    let content;

    if (isTurn) {
        content = (
            <div className="keyboard">
                <div className="keyboard-keys">
                    {LETTERS.map((row, rowIndex) => (
                        <div className="keyboard-row" key={rowIndex}>
                            {row.map((letter) => (
                                <button
                                    className={`keyboard-key ${
                                        keyboardColors[letter.toLowerCase()]
                                    }`}
                                    key={letter}
                                    onClick={() => onLetterClicked(letter)}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    ))}
                    <div className="keyboard-row">
                        <button
                            className={'keyboard-key keyboard-enter'}
                            onClick={onEnterClicked}
                            disabled={!isTurn}
                        >
                            {'Enter'.toUpperCase()}
                        </button>
                        <button
                            className={'keyboard-key keyboard-backspace'}
                            onClick={onDeleteClicked}
                        >
                            <MdOutlineBackspace />
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        content = (
            <p className="keyboard-waiting">
                Waiting for other player to guess...
            </p>
        );
    }

    return content;
};

export default Keyboard;
