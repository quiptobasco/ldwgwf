import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://ldwgwf.onrender.com/',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    // console.log(args);
    // console.log(api);
    // console.log(extraOptions);

    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 403) {
        console.log('sending refresh token');

        const refreshResult = await baseQuery(
            '/api/auth/refresh',
            api,
            extraOptions
        );

        if (refreshResult?.data) {
            api.dispatch(setCredentials({ ...refreshResult.data }));

            result = await baseQuery(args, api, extraOptions);
        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = 'Your login has expired.';
            }

            return refreshResult;
        }
    }

    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Game', 'User'],
    endpoints: (builder) => ({}),
});
