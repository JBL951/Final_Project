import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

describe('Recipe Endpoints', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Register and login to get auth token
    const userData = {
      username: 'recipeuser',
      email: 'recipe@example.com',
      password: 'password123',
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/recipes', () => {
    const validRecipeData = {
      title: 'Test Recipe',
      description: 'A delicious test recipe',
      ingredients: ['1 cup flour', '2 eggs', '1 cup milk'],
      instructions: ['Mix ingredients', 'Cook for 20 minutes'],
      tags: ['breakfast', 'easy'],
      cookTime: '30 minutes',
      isPublic: true,
      imageUrl: 'https://example.com/image.jpg',
    };

    it('should create a new recipe successfully', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validRecipeData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', validRecipeData.title);
      expect(response.body).toHaveProperty('description', validRecipeData.description);
      expect(response.body).toHaveProperty('ingredients');
      expect(response.body.ingredients).toEqual(validRecipeData.ingredients);
      expect(response.body).toHaveProperty('authorId', userId);
      expect(response.body).toHaveProperty('likes', 0);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send(validRecipeData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should return 400 for invalid recipe data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test',
        ingredients: [], // Empty ingredients
        instructions: [],
        tags: [],
        cookTime: '',
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid recipe data');
    });
  });

  describe('GET /api/recipes/public', () => {
    beforeEach(async () => {
      // Create some test recipes
      const publicRecipe = {
        title: 'Public Recipe',
        description: 'A public recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['public'],
        cookTime: '15 minutes',
        isPublic: true,
      };

      const privateRecipe = {
        title: 'Private Recipe',
        description: 'A private recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['private'],
        cookTime: '15 minutes',
        isPublic: false,
      };

      await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicRecipe);

      await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(privateRecipe);
    });

    it('should return only public recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/public')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // All returned recipes should be public
      response.body.forEach((recipe: any) => {
        expect(recipe.isPublic).toBe(true);
        expect(recipe).toHaveProperty('author');
        expect(recipe.author).toHaveProperty('username');
      });
    });

    it('should include author information', async () => {
      const response = await request(app)
        .get('/api/recipes/public')
        .expect(200);

      if (response.body.length > 0) {
        const recipe = response.body[0];
        expect(recipe).toHaveProperty('author');
        expect(recipe.author).toHaveProperty('id');
        expect(recipe.author).toHaveProperty('username');
      }
    });
  });

  describe('GET /api/recipes/my', () => {
    beforeEach(async () => {
      // Create test recipes for the authenticated user
      const recipe1 = {
        title: 'My Recipe 1',
        description: 'First recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['mine'],
        cookTime: '15 minutes',
        isPublic: true,
      };

      const recipe2 = {
        title: 'My Recipe 2',
        description: 'Second recipe',
        ingredients: ['ingredient2'],
        instructions: ['step2'],
        tags: ['mine'],
        cookTime: '20 minutes',
        isPublic: false,
      };

      await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipe1);

      await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipe2);
    });

    it('should return user\'s recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // All returned recipes should belong to the authenticated user
      response.body.forEach((recipe: any) => {
        expect(recipe.authorId).toBe(userId);
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/recipes/my')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });

  describe('PUT /api/recipes/:id', () => {
    let recipeId: number;

    beforeEach(async () => {
      // Create a recipe to update
      const recipeData = {
        title: 'Original Recipe',
        description: 'Original description',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['original'],
        cookTime: '15 minutes',
        isPublic: true,
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData);

      recipeId = createResponse.body.id;
    });

    it('should update recipe successfully', async () => {
      const updateData = {
        title: 'Updated Recipe',
        description: 'Updated description',
        tags: ['updated'],
      };

      const response = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body.tags).toContain('updated');
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .put('/api/recipes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Recipe not found');
    });

    it('should return 403 for unauthorized update attempt', async () => {
      // Create another user
      const otherUserData = {
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      };

      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherUserToken = otherUserResponse.body.token;

      const response = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized to update this recipe');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    let recipeId: number;

    beforeEach(async () => {
      // Create a recipe to delete
      const recipeData = {
        title: 'Recipe to Delete',
        description: 'This will be deleted',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['delete'],
        cookTime: '15 minutes',
        isPublic: true,
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData);

      recipeId = createResponse.body.id;
    });

    it('should delete recipe successfully', async () => {
      const response = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Recipe deleted successfully');

      // Verify recipe is deleted
      await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(404);
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .delete('/api/recipes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Recipe not found');
    });

    it('should return 403 for unauthorized delete attempt', async () => {
      // Create another user
      const otherUserData = {
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123',
      };

      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherUserToken = otherUserResponse.body.token;

      const response = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized to delete this recipe');
    });
  });

  describe('GET /api/recipes/search', () => {
    beforeEach(async () => {
      // Create searchable recipes
      const recipes = [
        {
          title: 'Chocolate Cake',
          description: 'Delicious chocolate dessert',
          ingredients: ['chocolate', 'flour', 'eggs'],
          instructions: ['Mix', 'Bake'],
          tags: ['dessert', 'chocolate'],
          cookTime: '60 minutes',
          isPublic: true,
        },
        {
          title: 'Vanilla Ice Cream',
          description: 'Creamy vanilla treat',
          ingredients: ['vanilla', 'cream', 'sugar'],
          instructions: ['Mix', 'Freeze'],
          tags: ['dessert', 'vanilla'],
          cookTime: '30 minutes',
          isPublic: true,
        },
        {
          title: 'Private Chocolate Recipe',
          description: 'Secret chocolate recipe',
          ingredients: ['chocolate'],
          instructions: ['Secret method'],
          tags: ['secret'],
          cookTime: '45 minutes',
          isPublic: false,
        },
      ];

      for (const recipe of recipes) {
        await request(app)
          .post('/api/recipes')
          .set('Authorization', `Bearer ${authToken}`)
          .send(recipe);
      }
    });

    it('should search recipes by title', async () => {
      const response = await request(app)
        .get('/api/recipes/search?q=chocolate')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Should only return public recipes
      response.body.forEach((recipe: any) => {
        expect(recipe.isPublic).toBe(true);
        expect(recipe.title.toLowerCase()).toContain('chocolate');
      });
    });

    it('should search recipes by ingredients', async () => {
      const response = await request(app)
        .get('/api/recipes/search?q=vanilla')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach((recipe: any) => {
        expect(recipe.isPublic).toBe(true);
        const hasVanilla = recipe.title.toLowerCase().includes('vanilla') ||
                          recipe.ingredients.some((ing: string) => ing.toLowerCase().includes('vanilla'));
        expect(hasVanilla).toBe(true);
      });
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/recipes/search')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Search query required');
    });
  });

  describe('POST /api/recipes/:id/like', () => {
    let recipeId: number;

    beforeEach(async () => {
      // Create a recipe to like
      const recipeData = {
        title: 'Likeable Recipe',
        description: 'A recipe to like',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        tags: ['likeable'],
        cookTime: '15 minutes',
        isPublic: true,
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recipeData);

      recipeId = createResponse.body.id;
    });

    it('should like recipe successfully', async () => {
      const response = await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('likes', 1);
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .post('/api/recipes/99999/like')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Recipe not found');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post(`/api/recipes/${recipeId}/like`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token required');
    });
  });
});