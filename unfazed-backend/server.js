import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes & Controllers are mounted here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'unfazed-backend', timestamp: new Date() });
});

// Socket.io for Real-Time Chat (Module 6)
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Unfazed Backend API running on port ${PORT}`);
});
