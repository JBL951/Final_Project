import { Server, Socket } from 'socket.io';

export function registerCommentHandlers(socket: Socket, io: Server) {
  // Join a recipe room for real-time updates
  socket.on('join-recipe', (recipeId: string) => {
    socket.join(`recipe-${recipeId}`);
    console.log(`Socket ${socket.id} joined recipe room: ${recipeId}`);
  });

  // Leave a recipe room
  socket.on('leave-recipe', (recipeId: string) => {
    socket.leave(`recipe-${recipeId}`);
    console.log(`Socket ${socket.id} left recipe room: ${recipeId}`);
  });

  // Handle new comment
  socket.on('new-comment', (data: {
    recipeId: string;
    comment: {
      id: string;
      text: string;
      author: {
        id: number;
        username: string;
      };
      createdAt: string;
    };
  }) => {
    // Broadcast to all users in the recipe room except sender
    socket.to(`recipe-${data.recipeId}`).emit('comment-added', data.comment);
    console.log(`New comment broadcasted for recipe ${data.recipeId}`);
  });

  // Handle typing indicator
  socket.on('user-typing', (data: {
    recipeId: string;
    username: string;
    isTyping: boolean;
  }) => {
    socket.to(`recipe-${data.recipeId}`).emit('user-typing', {
      username: data.username,
      isTyping: data.isTyping,
    });
  });
}