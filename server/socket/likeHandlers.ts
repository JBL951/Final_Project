import { Server, Socket } from 'socket.io';

export function registerLikeHandlers(socket: Socket, io: Server) {
  // Handle real-time like updates
  socket.on('recipe-liked', (data: {
    recipeId: string;
    likes: number;
    likedBy: {
      id: number;
      username: string;
    };
  }) => {
    // Broadcast like update to all users in the recipe room
    socket.to(`recipe-${data.recipeId}`).emit('like-updated', {
      recipeId: data.recipeId,
      likes: data.likes,
      likedBy: data.likedBy,
    });
    console.log(`Like update broadcasted for recipe ${data.recipeId}`);
  });
}