import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';

const gamesAdapter = createEntityAdapter({});

const initialState = gamesAdapter.getInitialState();

export const gamesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGames: builder.query({
            query: () => ({
                url: '/api/games',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData) => {
                const loadedGames = responseData.map((game) => {
                    game.id = game._id;
                    return game;
                });
                // return { data: loadedGames };

                return gamesAdapter.setAll(initialState, loadedGames);
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Game', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Game', id })),
                    ];
                } else return [{ type: 'Game', id: 'LIST' }];
            },
        }),
        makeGuess: builder.mutation({
            query: (initialGame) => ({
                url: '/api/games/guess',
                method: 'POST',
                body: {
                    ...initialGame,
                },
            }),
            invalidatesTags: (result, error, arg) => [
                {
                    type: 'Game',
                    id: arg.id,
                },
            ],
        }),
        createGame: builder.mutation({
            query: (initialGame) => ({
                url: '/api/games/create',
                method: 'POST',
                body: { ...initialGame },
            }),
            invalidatesTags: [{ type: 'Game', id: 'LIST' }],
        }),
    }),
});

export const { useGetGamesQuery, useMakeGuessMutation, useCreateGameMutation } =
    gamesApiSlice;

export const selectGamesResult = gamesApiSlice.endpoints.getGames.select();

const selectGamesData = createSelector(
    selectGamesResult,
    (gamesResult) => gamesResult.data
);

export const {
    selectAll: selectAllGames,
    selectById: selectGameById,
    selectIds: selectGameIds,
} = gamesAdapter.getSelectors(
    (state) => selectGamesData(state) ?? initialState
);

// export const selectActiveGames = createSelector(
//     [selectAllGames],
//     (games) => games
// );
