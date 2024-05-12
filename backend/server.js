require('dotenv').config();
const path = require('path');
const express = require('express');

const cookieParser = require('cookie-parser');

const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const connectDB = require('./config/db');
const mongoose = require('mongoose');

const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://ldwgwf.onrender.com/',
    },
});

const PORT = process.env.PORT || 8008;

connectDB();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));

// console.log(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
// });

const connectedSockets = {};
const gameStates = {};

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    connectedSockets[socket.id] = {
        joinedRooms: new Set(),
    };

    socket.on('joinGame', (gameId) => {
        if (!connectedSockets[socket.id].joinedRooms.has(gameId)) {
            socket.join(gameId);
            connectedSockets[socket.id].joinedRooms.add(gameId);
            console.log(`${socket.id} joined game ${gameId}`);

            // Send the current game state to the user
            // if (gameStates[gameId]) {
            //     socket.emit('gameStateUpdate', gameStates[gameId]);
            // }
        }
    });

    // socket.on(
    //     'gameStateUpdate',
    //     ({ gameId, currentGuess, formattedGuess, keyboardColors }) => {
    //         console.log(formattedGuess, 'f');
    //         gameStates[gameId] = {
    //             currentGuess,
    //             formattedGuess,
    //             keyboardColors,
    //         };
    //         console.log(currentGuess.split(''));
    //         // Broadcast the updated game state to all players in the game room
    //         socket.to(gameId).emit('gameStateUpdate', {
    //             currentGuess,
    //             formattedGuess,
    //             keyboardColors,
    //         });
    //     }
    // );

    socket.on('enterClicked', (gameId) => {
        socket.to(gameId).emit('enterClicked');
    });

    socket.on('letterClicked', (letter, gameId) => {
        socket.to(gameId).emit('letterClicked', letter);
    });

    socket.on('deleteClicked', (gameId) => {
        socket.to(gameId).emit('deleteClicked');
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
        const joinedRooms = connectedSockets[socket.id].joinedRooms;

        joinedRooms.forEach((room) => {
            socket.leave(room);
        });
        delete connectedSockets[socket.id];
    });
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

mongoose.connection.on('error', (error) => {
    console.log(error);
});
