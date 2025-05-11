require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { DecryptCombine } = require('./Lock/Combine');
const getClientIP = require('./Lock/getClientIp');
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.use(async (socket, next) => {
    const token = socket.handshake.headers.authorization
    let h = socket.handshake.headers
    let au = h['user-agent']?.split(/\s+/).join('')
    // 
    let ip = await getClientIP(h)
    if (!token || !ip || !au || !h.id) {
        return next(new Error('Authentication error'));
    }

    try {
        const keys = [process.env.SOCKET_TOKEN, process.env.SOCKET_TOKEN2];
        const decrypted = DecryptCombine(token, keys);

        if (!decrypted) {
            return next(new Error('Authentication error'));
        }

        if(decrypted.ip !== ip || decrypted.ua !== au || decrypted.user_id !== h.id){
            return next(new Error('Authentication error'));
        }
        
        socket.user = decrypted;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

http.listen(3002, () => {
    console.log('Server running on port 3002');
});
