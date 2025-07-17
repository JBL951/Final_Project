const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's public recipes
    const recipes = await Recipe.find({ 
      author: req.params.id, 
      isPublic: true 
    })
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(6);

    const recipeCount = await Recipe.countDocuments({ 
      author: req.params.id, 
      isPublic: true 
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt
      },
      recipes,
      recipeCount
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/bookmark
// @desc    Bookmark/unbookmark a recipe
// @access  Private
router.post('/:recipeId/bookmark', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.isPublic) {
      return res.status(403).json({ message: 'Cannot bookmark private recipe' });
    }

    const user = await User.findById(req.user.id);
    const isBookmarked = user.bookmarkedRecipes.includes(req.params.recipeId);

    if (isBookmarked) {
      user.bookmarkedRecipes = user.bookmarkedRecipes.filter(
        id => id.toString() !== req.params.recipeId
      );
    } else {
      user.bookmarkedRecipes.push(req.params.recipeId);
    }

    await user.save();

    res.json({
      message: isBookmarked ? 'Recipe unbookmarked' : 'Recipe bookmarked',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Bookmark recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/bookmarks
// @desc    Get user's bookmarked recipes
// @access  Private
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarkedRecipes',
        populate: {
          path: 'author',
          select: 'username avatar'
        },
        options: {
          sort: { createdAt: -1 },
          skip,
          limit
        }
      });

    const total = user.bookmarkedRecipes.length;

    res.json({
      recipes: user.bookmarkedRecipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;