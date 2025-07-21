# 🧪 TasteBase Testing Guide

## Overview
This guide covers the comprehensive testing strategy for TasteBase, including unit tests, integration tests, and end-to-end testing scenarios.

## Testing Stack
- **Test Runner**: Jest with ES modules support
- **Backend Testing**: Supertest for API testing
- **Frontend Testing**: React Testing Library
- **Mocking**: Jest mocks for external dependencies
- **Coverage**: Jest coverage reports

## Running Tests

### Development Testing
```bash
# Run all tests
NODE_ENV=test npx jest

# Run tests with watch mode
NODE_ENV=test npx jest --watch

# Run tests with coverage
NODE_ENV=test npx jest --coverage

# Run specific test files
NODE_ENV=test npx jest auth.test.ts
NODE_ENV=test npx jest recipes.test.ts
```

### Test Configuration
Jest is configured in `jest.config.js` with:
- ES modules support
- TypeScript compilation
- Path mapping for imports
- JSDOM environment for React tests
- Coverage collection from all source files

## Backend API Testing

### Authentication Tests
Located in `server/__tests__/auth.test.ts`

**Test Scenarios:**
```typescript
describe('Authentication', () => {
  test('POST /api/auth/register - successful registration')
  test('POST /api/auth/register - duplicate user validation')
  test('POST /api/auth/register - invalid email format')
  test('POST /api/auth/register - password requirements')
  
  test('POST /api/auth/login - successful login')
  test('POST /api/auth/login - invalid credentials')
  test('POST /api/auth/login - missing fields')
  
  test('GET /api/auth/me - authenticated user')
  test('GET /api/auth/me - missing token')
  test('GET /api/auth/me - invalid token')
})
```

**Example Test:**
```typescript
import request from 'supertest';
import { app } from '../index';

describe('User Registration', () => {
  it('should create a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'User registered successfully',
      user: {
        username: userData.username,
        email: userData.email
      }
    });
    expect(response.body.token).toBeDefined();
  });
});
```

### Recipe API Tests
Located in `server/__tests__/recipes.test.ts`

**Test Scenarios:**
```typescript
describe('Recipe Management', () => {
  test('GET /api/recipes/public - fetch public recipes')
  test('GET /api/recipes/:id - fetch recipe by ID')
  test('GET /api/recipes/:id - recipe not found')
  
  test('POST /api/recipes - create recipe (authenticated)')
  test('POST /api/recipes - create recipe (unauthenticated)')
  test('POST /api/recipes - invalid recipe data')
  
  test('PUT /api/recipes/:id - update own recipe')
  test('PUT /api/recipes/:id - update others recipe (forbidden)')
  
  test('DELETE /api/recipes/:id - delete own recipe')
  test('DELETE /api/recipes/:id - delete others recipe (forbidden)')
  
  test('GET /api/recipes/search - search recipes')
  test('POST /api/recipes/:id/like - like recipe')
})
```

**Example Integration Test:**
```typescript
describe('Recipe CRUD Operations', () => {
  let authToken: string;
  let userId: number;
  let recipeId: number;

  beforeAll(async () => {
    // Create test user and get auth token
    const authResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'recipetest',
        email: 'recipe@example.com',
        password: 'password123'
      });
    
    authToken = authResponse.body.token;
    userId = authResponse.body.user.id;
  });

  it('should create a new recipe', async () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'A test recipe for testing',
      ingredients: ['1 cup flour', '2 eggs'],
      instructions: ['Mix ingredients', 'Bake for 30 minutes'],
      tags: ['test', 'baking'],
      cookTime: '45 minutes',
      isPublic: true
    };

    const response = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(recipeData)
      .expect(201);

    recipeId = response.body.recipe.id;
    expect(response.body.recipe).toMatchObject(recipeData);
  });

  it('should update the recipe', async () => {
    const updateData = {
      title: 'Updated Test Recipe',
      description: 'An updated test recipe'
    };

    const response = await request(app)
      .put(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.recipe.title).toBe(updateData.title);
  });
});
```

## Frontend Component Testing

### Component Test Structure
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentName } from './ComponentName';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};
```

### Authentication Component Tests
```typescript
describe('AuthForm Component', () => {
  test('renders login form correctly')
  test('validates email format')
  test('validates password requirements')
  test('submits form with valid data')
  test('displays error messages')
  test('switches between login and register modes')
})
```

### Recipe Component Tests
```typescript
describe('RecipeCard Component', () => {
  test('displays recipe information correctly')
  test('shows author information')
  test('handles like button click')
  test('displays correct cook time format')
  test('shows tags appropriately')
})

describe('RecipeForm Component', () => {
  test('renders empty form for new recipe')
  test('populates form for editing existing recipe')
  test('validates required fields')
  test('adds and removes ingredients dynamically')
  test('adds and removes instructions dynamically')
  test('submits valid recipe data')
})
```

### Example Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from '@/components/RecipeCard';

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  description: 'A test recipe',
  ingredients: ['flour', 'eggs'],
  instructions: ['mix', 'bake'],
  tags: ['test'],
  cookTime: '30 mins',
  author: { id: 1, username: 'testuser' },
  likes: 5,
  isPublic: true,
  createdAt: new Date()
};

describe('RecipeCard', () => {
  it('displays recipe information', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A test recipe')).toBeInTheDocument();
    expect(screen.getByText('30 mins')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles like button click', () => {
    const onLike = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onLike={onLike} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    expect(onLike).toHaveBeenCalledWith(1);
  });
});
```

## Database Testing

### MongoDB Test Setup
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoStorage } from '../storage/mongodb';

describe('MongoDB Storage', () => {
  let mongoServer: MongoMemoryServer;
  let storage: MongoStorage;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    storage = new MongoStorage(mongoUri);
    await storage.connect();
  });

  afterAll(async () => {
    await storage.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await storage.users.deleteMany({});
    await storage.recipes.deleteMany({});
  });
});
```

### Storage Layer Tests
```typescript
describe('User Storage Operations', () => {
  test('creates user successfully')
  test('prevents duplicate email registration')
  test('finds user by email')
  test('finds user by username')
  test('returns undefined for non-existent user')
})

describe('Recipe Storage Operations', () => {
  test('creates recipe with valid data')
  test('retrieves recipe by ID')
  test('updates recipe successfully')
  test('deletes recipe successfully')
  test('searches recipes by query')
  test('increments like count')
})
```

## End-to-End Testing Scenarios

### User Journey Tests
```typescript
describe('Complete User Journeys', () => {
  test('User Registration to Recipe Creation Flow', async () => {
    // 1. Register new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // 2. Use token to create recipe
    const recipeResponse = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${registerResponse.body.token}`)
      .send(recipeData);
    
    // 3. Verify recipe appears in public feed
    const publicResponse = await request(app)
      .get('/api/recipes/public');
    
    expect(publicResponse.body).toContainEqual(
      expect.objectContaining({ id: recipeResponse.body.recipe.id })
    );
  });

  test('Recipe Search and Like Flow', async () => {
    // Setup: Create user and recipe
    // Test: Search for recipe
    // Test: Like the recipe
    // Verify: Like count incremented
  });
});
```

## Mock Data and Fixtures

### Test Fixtures
```typescript
// test/fixtures/users.ts
export const mockUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123'
  },
  {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123'
  }
];

// test/fixtures/recipes.ts
export const mockRecipes = [
  {
    title: 'Test Recipe 1',
    description: 'First test recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    tags: ['test', 'mock'],
    cookTime: '30 mins',
    isPublic: true
  }
];
```

### API Mocking
```typescript
// Mock external services
jest.mock('../lib/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Mock MongoDB for unit tests
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn()
      })
    })
  }))
}));
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Load test

scenarios:
  - name: 'Recipe API Load Test'
    flow:
      - get:
          url: '/api/recipes/public'
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
      - get:
          url: '/api/recipes/search?q=pasta'
```

## Test Coverage Goals

### Coverage Targets
- **Overall Coverage**: > 80%
- **Backend Routes**: > 90%
- **Frontend Components**: > 75%
- **Utility Functions**: > 95%
- **Critical User Flows**: 100%

### Coverage Reports
```bash
# Generate coverage report
NODE_ENV=test npx jest --coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
```

## Debugging Tests

### Common Issues and Solutions
1. **Async Test Failures**: Use `async/await` or return promises
2. **Database State**: Clear collections between tests
3. **Mock Issues**: Reset mocks in `beforeEach`
4. **Timing Issues**: Use `waitFor` for async operations

### Test Debugging Tools
```typescript
// Debug test with console output
test('debug test', () => {
  const result = someFunction();
  console.log('Debug result:', result);
  expect(result).toBe(expected);
});

// Debug React component rendering
test('debug component', () => {
  const { debug } = render(<Component />);
  debug(); // Prints current DOM
});
```

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Test Data Management
- Use factories for creating test data
- Clean up test data after each test
- Use meaningful test data that reflects real scenarios

### Mocking Strategy
- Mock external dependencies
- Keep mocks simple and focused
- Verify mock interactions when necessary
- Reset mocks between tests

This comprehensive testing approach ensures TasteBase maintains high quality and reliability across all features and user interactions.