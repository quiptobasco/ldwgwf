import { io } from 'socket.io-client';

const URL = 'http://localhost:8008';

export const socket = io(URL);
