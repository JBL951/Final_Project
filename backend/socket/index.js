// Socket.io server setup for modular, scalable real-time integration
// This file initializes Socket.io and registers event handlers for comments, likes, and typing indicators
// Usage: Import and call setupSocket(server) in your main server.js

const { Server } = require('socket.io');
const registerRecipeEvents = require('./handlers');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Modular event registration
  io.on('connection', (socket) => {
    registerRecipeEvents(socket, io);
  });

  return io;
}

module.exports = setupSocket;

// [commit] feat(socket): Modular Socket.io server setup for scalable real-time features
