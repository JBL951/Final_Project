// Socket.io event handlers for recipe features
// Handles comments, likes, and typing indicators in a modular way
// Usage: Called by socket/index.js for each new connection

module.exports = (socket, io) => {
  // Join/leave recipe rooms
  socket.on('join-recipe', (recipeId) => {
    socket.join(`recipe-${recipeId}`);
  });
  socket.on('leave-recipe', (recipeId) => {
    socket.leave(`recipe-${recipeId}`);
  });

  // Real-time comment event
  socket.on('new-comment', (data) => {
    // Broadcast to all users in the recipe room except sender
    socket.to(`recipe-${data.recipeId}`).emit('comment-added', data);
  });

  // Real-time like event
  socket.on('like-recipe', (data) => {
    socket.to(`recipe-${data.recipeId}`).emit('recipe-liked', data);
  });

  // Typing indicator
  socket.on('user-typing', (data) => {
    socket.to(`recipe-${data.recipeId}`).emit('user-typing', data);
  });

  // [commit] feat(socket): Add modular event handlers for comments, likes, typing
};
