const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tastebase_test';

describe('Recipe Routes', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    // Create and login a test user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    token = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe successfully', async () => {
      const recipeData = {
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        cookingTime: 30,
        servings: 4,
        difficulty: 'easy',
        tags: ['test', 'recipe'],
        isPublic: true
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(recipeData)
        .expect(201);

      expect(response.body.message).toBe('Recipe created successfully');
      expect(response.body.recipe.title).toBe(recipeData.title);
      expect(response.body.recipe.author.username).toBe('testuser');
    });

    it('should not create recipe without authentication', async () => {
      const recipeData = {
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        ingredients: ['ingredient 1'],
        instructions: ['step 1']
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should not create recipe with invalid data', async () => {
      const recipeData = {
        title: '', // Empty title
        description: 'A delicious test recipe',
        ingredients: [], // Empty ingredients
        instructions: ['step 1']
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(recipeData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/recipes/public', () => {
    beforeEach(async () => {
      // Create test recipes
      const recipe1 = new Recipe({
        title: 'Public Recipe 1',
        description: 'Description 1',
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        author: userId,
        isPublic: true
      });

      const recipe2 = new Recipe({
        title: 'Private Recipe',
        description: 'Description 2',
        ingredients: ['ingredient 2'],
        instructions: ['step 2'],
        author: userId,
        isPublic: false
      });

      await recipe1.save();
      await recipe2.save();
    });

    it('should get all public recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/public')
        .expect(200);

      expect(response.body.recipes).toHaveLength(1);
      expect(response.body.recipes[0].title).toBe('Public Recipe 1');
      expect(response.body.recipes[0].isPublic).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/recipes/public?page=1&limit=1')
        .expect(200);

      expect(response.body.pagination.current).toBe(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/recipes/my', () => {
    beforeEach(async () => {
      // Create test recipes
      const recipe1 = new Recipe({
        title: 'My Recipe 1',
        description: 'Description 1',
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        author: userId,
        isPublic: true
      });

      const recipe2 = new Recipe({
        title: 'My Recipe 2',
        description: 'Description 2',
        ingredients: ['ingredient 2'],
        instructions: ['step 2'],
        author: userId,
        isPublic: false
      });

      await recipe1.save();
      await recipe2.save();
    });

    it('should get current user recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/my')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.recipes).toHaveLength(2);
      expect(response.body.recipes[0].author._id).toBe(userId);
      expect(response.body.recipes[1].author._id).toBe(userId);
    });

    it('should not get recipes without authentication', async () => {
      const response = await request(app)
        .get('/api/recipes/my')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('PUT /api/recipes/:id', () => {
    let recipeId;

    beforeEach(async () => {
      const recipe = new Recipe({
        title: 'Original Recipe',
        description: 'Original description',
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        author: userId,
        isPublic: true
      });

      const savedRecipe = await recipe.save();
      recipeId = savedRecipe._id;
    });

    it('should update recipe successfully', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['updated ingredient'],
        instructions: ['updated step']
      };

      const response = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Recipe updated successfully');
      expect(response.body.recipe.title).toBe(updateData.title);
    });

    it('should not update recipe without authentication', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['updated ingredient'],
        instructions: ['updated step']
      };

      const response = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should not update non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        ingredients: ['updated ingredient'],
        instructions: ['updated step']
      };

      const response = await request(app)
        .put(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Recipe not found');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    let recipeId;

    beforeEach(async () => {
      const recipe = new Recipe({
        title: 'Recipe to Delete',
        description: 'Description',
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        author: userId,
        isPublic: true
      });

      const savedRecipe = await recipe.save();
      recipeId = savedRecipe._id;
    });

    it('should delete recipe successfully', async () => {
      const response = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Recipe deleted successfully');

      // Verify recipe is deleted
      const deletedRecipe = await Recipe.findById(recipeId);
      expect(deletedRecipe).toBeNull();
    });

    it('should not delete recipe without authentication', async () => {
      const response = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should not delete non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Recipe not found');
    });
  });

  describe('POST /api/recipes/:id/like', () => {
    let recipeId;

    beforeEach(async () => {
      const recipe = new Recipe({
        title: 'Recipe to Like',
        description: 'Description',
        ingredients: ['ingredient 1'],
        instructions: ['step 1'],
        author: userId,
        isPublic: true
      });

      const savedRecipe = await recipe.save();
      recipeId = savedRecipe._id;
    });

    it('should like recipe successfully', async () => {
      const response = await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Recipe liked');
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    it('should unlike recipe when already liked', async () => {
      // Like first
      await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`);

      // Unlike
      const response = await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Recipe unliked');
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);
    });

    it('should not like recipe without authentication', async () => {
      const response = await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });
});