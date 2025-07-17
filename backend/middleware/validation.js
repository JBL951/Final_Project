const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  validate
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Recipe validation
const validateRecipe = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and must be less than 500 characters'),
  
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  
  body('ingredients.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each ingredient must not be empty'),
  
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
  
  body('instructions.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each instruction must not be empty'),
  
  body('cookingTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cooking time must be a positive number'),
  
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be a positive number'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRecipe
};