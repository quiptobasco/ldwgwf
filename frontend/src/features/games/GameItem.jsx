// import './Game.css';
import './GameList.css';

const GameItem = ({ otherPlayer, turnNumber, username }) => {
    return (
        <>
            <div className="container">
                <div className="names">
                    <span>{username}</span>
                    <p className="vs">vs.</p>
                    <span>{otherPlayer.username}</span>
                </div>
                <div className="turn-number">
                    <span className="turn-number-circle">{turnNumber} / 6</span>
                </div>
            </div>
        </>
    );
};

export default GameItem;
