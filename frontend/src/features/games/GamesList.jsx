import { useState, useEffect } from 'react';
import { useGetGamesQuery, useCreateGameMutation } from './gamesApiSlice';
import { useGetUsersQuery } from '../users/usersApiSlice';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import GameItem from './GameItem';

import './GameList.css';

const GamesList = () => {
    const { id, username: myUsername } = useAuth();

    const {
        data: games,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetGamesQuery('gamesList', {
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
    });

    const [
        createGame,
        { isSuccess: isGameSuccess, isError: isGameError, error: gameError },
    ] = useCreateGameMutation();

    const { users } = useGetUsersQuery('usersList', {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map((id) => data?.entities[id]),
        }),
    });

    const [username, setUsername] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const onUserIdChanged = (e) => setUsername(e.target.value);

    let content;

    if (isLoading) content = <p>Loading...</p>;

    if (isError) {
        content = <p>{error?.data?.message}</p>;
    }

    const handleCreateGame = async (e) => {
        e.preventDefault();
        await createGame({ username: username });
    };

    const options = users
        ?.filter((user) => user.id !== id)
        .map((user) => {
            return (
                <option key={user.id} value={user.username}>
                    {user.username}
                </option>
            );
        });

    const canSave = [username].every(Boolean);

    if (isSuccess) {
        const { ids, entities } = games;

        if (!ids || entities.length === 0) {
            return (content = <p>No active games, go create one!</p>);
        }

        const activeGames = Object.keys(entities)
            .filter((gameId) => !entities[gameId].isComplete)
            .map((gameId) => (
                <Link to={gameId} key={gameId}>
                    <GameItem
                        otherPlayer={entities[gameId].players.find(
                            (player) => player._id !== id
                        )}
                        turnNumber={entities[gameId].guesses.length}
                        username={myUsername}
                    />
                </Link>
            ));

        const totalPages = Math.ceil(activeGames.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedGames = activeGames.slice(startIndex, endIndex);

        const renderPageNumbers = () => {
            const pageNumbers = [];

            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(
                    <li
                        key={i}
                        className={currentPage === i ? 'active' : ''}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </li>
                );
            }

            return <div className="pagination">{pageNumbers}</div>;
        };

        content = (
            <>
                {paginatedGames}
                {renderPageNumbers()}
            </>
        );
    }

    return (
        <>
            {content}
            <select
                id="game-username"
                name="username"
                value={username}
                onChange={onUserIdChanged}
            >
                {<option value=""></option>}
                {options}
            </select>
            <button
                className="create-game-button"
                onClick={handleCreateGame}
                disabled={!canSave}
            >
                Create New Game
            </button>
        </>
    );
};

export default GamesList;
