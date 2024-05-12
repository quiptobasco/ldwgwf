import { io } from 'socket.io-client';

const URL = 'https://ldwgwf.onrender.com/';

export const socket = io(URL);
