const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (socket, io) => {
  console.log(`User ${socket.user.username} connected`);

  // Join recipe room
  socket.on('join-recipe', (recipeId) => {
    socket.join(`recipe-${recipeId}`);
    console.log(`User ${socket.user.username} joined recipe ${recipeId}`);
  });

  // Leave recipe room
  socket.on('leave-recipe', (recipeId) => {
    socket.leave(`recipe-${recipeId}`);
    console.log(`User ${socket.user.username} left recipe ${recipeId}`);
  });

  // Handle new comment
  socket.on('new-comment', async (data) => {
    try {
      const { recipeId, text } = data;

      if (!text || text.trim().length === 0) {
        socket.emit('error', { message: 'Comment text is required' });
        return;
      }

      if (text.length > 500) {
        socket.emit('error', { message: 'Comment cannot exceed 500 characters' });
        return;
      }

      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        socket.emit('error', { message: 'Recipe not found' });
        return;
      }

      if (!recipe.isPublic) {
        socket.emit('error', { message: 'Cannot comment on private recipe' });
        return;
      }

      const comment = {
        user: socket.user._id,
        text: text.trim()
      };

      recipe.comments.push(comment);
      await recipe.save();

      const populatedRecipe = await Recipe.findById(recipe._id)
        .populate('comments.user', 'username avatar');

      const newComment = populatedRecipe.comments[populatedRecipe.comments.length - 1];

      // Emit to all users in the recipe room
      io.to(`recipe-${recipeId}`).emit('comment-added', {
        comment: newComment,
        recipeId
      });

    } catch (error) {
      console.error('Socket comment error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle comment deletion
  socket.on('delete-comment', async (data) => {
    try {
      const { recipeId, commentId } = data;

      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        socket.emit('error', { message: 'Recipe not found' });
        return;
      }

      const comment = recipe.comments.id(commentId);

      if (!comment) {
        socket.emit('error', { message: 'Comment not found' });
        return;
      }

      // Check if user is the comment author or recipe author
      if (comment.user.toString() !== socket.user._id.toString() && 
          recipe.author.toString() !== socket.user._id.toString()) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      comment.remove();
      await recipe.save();

      // Emit to all users in the recipe room
      io.to(`recipe-${recipeId}`).emit('comment-deleted', {
        commentId,
        recipeId
      });

    } catch (error) {
      console.error('Socket delete comment error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle like/unlike
  socket.on('toggle-like', async (data) => {
    try {
      const { recipeId } = data;

      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        socket.emit('error', { message: 'Recipe not found' });
        return;
      }

      if (!recipe.isPublic) {
        socket.emit('error', { message: 'Cannot like private recipe' });
        return;
      }

      const userId = socket.user._id.toString();
      const isLiked = recipe.likes.includes(userId);

      if (isLiked) {
        recipe.likes = recipe.likes.filter(id => id.toString() !== userId);
      } else {
        recipe.likes.push(userId);
      }

      await recipe.save();

      // Emit to all users in the recipe room
      io.to(`recipe-${recipeId}`).emit('like-updated', {
        recipeId,
        likesCount: recipe.likes.length,
        isLiked: !isLiked,
        userId
      });

    } catch (error) {
      console.error('Socket like error:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.username} disconnected`);
  });
};

module.exports = (socket, io) => {
  // Apply authentication middleware
  socket.use((packet, next) => socketAuth(socket, next));
  
  // Handle connection after authentication
  handleConnection(socket, io);
};