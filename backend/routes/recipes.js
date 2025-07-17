const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const { validateRecipe } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/recipes/public
// @desc    Get all public recipes
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ isPublic: true })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments({ isPublic: true });

    res.json({
      recipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get public recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/recipes/my
// @desc    Get current user's recipes
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ author: req.user.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments({ author: req.user.id });

    res.json({
      recipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/recipes/search
// @desc    Search recipes
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, tags, difficulty, author } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username avatar')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      query: { q, tags, difficulty, author }
    });
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar')
      .populate('likes', 'username');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if recipe is private and user is not the author
    if (!recipe.isPublic && (!req.user || recipe.author._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth, validateRecipe, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      author: req.user.id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username avatar');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: populatedRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id', auth, validateRecipe, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/recipes/:id/like
// @desc    Like/unlike a recipe
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.isPublic) {
      return res.status(403).json({ message: 'Cannot like private recipe' });
    }

    const userId = req.user.id;
    const isLiked = recipe.likes.includes(userId);

    if (isLiked) {
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId);
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();

    res.json({
      message: isLiked ? 'Recipe unliked' : 'Recipe liked',
      isLiked: !isLiked,
      likesCount: recipe.likes.length
    });
  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/recipes/:id/comments
// @desc    Add a comment to a recipe
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.isPublic) {
      return res.status(403).json({ message: 'Cannot comment on private recipe' });
    }

    const comment = {
      user: req.user.id,
      text: text.trim()
    };

    recipe.comments.push(comment);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('comments.user', 'username avatar');

    const newComment = populatedRecipe.comments[populatedRecipe.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/recipes/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or recipe author
    if (comment.user.toString() !== req.user.id && recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment.remove();
    await recipe.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;