import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

describe('Recipe Endpoints', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/recipes/public', () => {
    it('should return public recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/public');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check recipe structure
      const recipe = response.body[0];
      expect(recipe).toHaveProperty('id');
      expect(recipe).toHaveProperty('title');
      expect(recipe).toHaveProperty('author');
      expect(recipe.author).toHaveProperty('username');
    });
  });

  describe('GET /api/recipes/my', () => {
    it('should return user recipes when authenticated', async () => {
      const response = await request(app)
        .get('/api/recipes/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/recipes/my');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/recipes', () => {
    const newRecipe = {
      title: 'Test Recipe',
      description: 'A test recipe for automated testing',
      ingredients: ['1 cup flour', '2 eggs'],
      instructions: ['Mix ingredients', 'Bake for 20 minutes'],
      tags: ['test', 'quick'],
      cookTime: '25 minutes',
      isPublic: true
    };

    it('should create a new recipe', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRecipe);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newRecipe.title);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send(newRecipe);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/recipes/search', () => {
    it('should search recipes by query', async () => {
      const response = await request(app)
        .get('/api/recipes/search?q=pasta');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require query parameter', async () => {
      const response = await request(app)
        .get('/api/recipes/search');

      expect(response.status).toBe(400);
    });
  });
});