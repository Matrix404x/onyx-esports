import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Render/Vercel proxy for HTTPS
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Seed Admin
        await seedAdmin();

    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // process.exit(1); // Keep running even if DB fails for now
    }
};
connectDB();

import authRoutes from './src/routes/authRoutes.js';
import seedAdmin from './src/seeders/adminSeeder.js';

// ...

import tournamentRoutes from './src/routes/tournamentRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import playerRoutes from './src/routes/playerRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import Message from './src/models/Message.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Esports Platform API (Fresh Start)');
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // Chat Events
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send-message', async (data) => {
        // data: { roomId, sender, senderId, text, time }
        try {
            const newMessage = new Message({
                room: data.roomId,
                sender: data.sender,
                senderId: data.senderId,
                text: data.text,
                timestamp: new Date()
            });
            await newMessage.save();

            // Broadcast to others
            socket.to(data.roomId).emit('receive-message', data);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    // Voice Events
    socket.on('join-voice', (channelId) => {
        socket.join(channelId);
        // Notify others in room
        socket.to(channelId).emit('user-connected', socket.id);
        console.log(`User ${socket.id} joined voice ${channelId}`);
    });

    socket.on('leave-voice', (channelId) => {
        socket.leave(channelId);
        socket.to(channelId).emit('user-disconnected', socket.id);
    });

    // WebRTC Signaling
    socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', {
            offer: data.offer,
            caller: socket.id
        });
    });

    socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', {
            answer: data.answer,
            caller: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            caller: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected:', socket.id);
        // Ideally should track which room user was in to emit user-disconnected
        // For simple demo, relies on connection cleanup
    });

    // --- Live Streaming Logic ---
    socket.on('start-stream', (tournamentId) => {
        socket.join(`stream-${tournamentId}`);
        // Notify any listeners (viewers in the tournament room) that stream started
        // Ideally we also update the DB here or via API
        socket.to(`stream-${tournamentId}`).emit('stream-started', socket.id);
        console.log(`Stream started for tournament ${tournamentId} by ${socket.id}`);
    });

    socket.on('join-stream', (tournamentId) => {
        socket.join(`stream-${tournamentId}`);
        // Notify the streamer (host) that a viewer joined
        // We need to know who the host is. 
        // For simplicity, we can broadcast to the room, and only the active streamer will respond with an offer.
        socket.to(`stream-${tournamentId}`).emit('viewer-connected', socket.id);
        console.log(`Viewer ${socket.id} joined stream ${tournamentId}`);
    });

    socket.on('stop-stream', (tournamentId) => {
        socket.to(`stream-${tournamentId}`).emit('stream-ended');
        socket.leave(`stream-${tournamentId}`);
        console.log(`Stream stopped for tournament ${tournamentId}`);
    });
    // Re-use existing signaling events (offer, answer, ice-candidate) 
    // because they target specific socket IDs, so they work for both Voice and Stream.

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
