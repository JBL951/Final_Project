const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: [{
    type: String,
    required: true,
    trim: true
  }],
  cookingTime: {
    type: Number,
    min: [1, 'Cooking time must be at least 1 minute']
  },
  servings: {
    type: Number,
    min: [1, 'Servings must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

// Index for search functionality
recipeSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  ingredients: 'text'
});

// Index for filtering
recipeSchema.index({ isPublic: 1, createdAt: -1 });
recipeSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);