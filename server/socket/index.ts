import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';
import { registerCommentHandlers } from './commentHandlers';
import { registerLikeHandlers } from './likeHandlers';

export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || 'https://tastebase.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register event handlers
    registerCommentHandlers(socket, io);
    registerLikeHandlers(socket, io);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}