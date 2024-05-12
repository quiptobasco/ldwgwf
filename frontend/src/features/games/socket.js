import { io } from 'socket.io-client';

const URL = 'https://ldwgwf.vercel.app/';

export const socket = io(URL);
