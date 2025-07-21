# MongoDB Integration Guide for TasteBase

This document provides comprehensive instructions for integrating MongoDB with the TasteBase application, replacing the current in-memory storage system.

## Overview

TasteBase is currently built with a flexible storage interface that allows easy switching between storage backends. This guide details the steps to integrate MongoDB while maintaining all existing functionality.

## Prerequisites

Before starting the MongoDB integration:

1. **MongoDB Database**: Set up a MongoDB database (local MongoDB, MongoDB Atlas, or other hosting solution)
2. **MongoDB Connection String**: Obtain the connection URI for your database
3. **Environment Configuration**: Ensure your deployment environment supports Node.js and MongoDB connections

## Integration Steps

### 1. Install MongoDB Dependencies

The project already includes the necessary MongoDB dependencies. If additional packages are needed:

```bash
npm install mongodb @types/mongodb
```

### 2. Environment Configuration

Set the following environment variables:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/tastebase
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tastebase

# JWT secret for authentication
JWT_SECRET=your-secret-key-here

# Node environment
NODE_ENV=production
```

### 3. Create MongoDB Storage Implementation

Create a new file `server/storage/mongodb.ts`:

```typescript
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { IStorage } from '../storage';
import { type User, type Recipe, type InsertUser, type InsertRecipe } from '@shared/schema';
import bcrypt from 'bcrypt';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection<User>;
  private recipes: Collection<Recipe>;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('tastebase');
    this.users = this.db.collection('users');
    this.recipes = this.db.collection('recipes');
    
    // Create indexes for better performance
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ username: 1 }, { unique: true });
    await this.recipes.createIndex({ authorId: 1 });
    await this.recipes.createIndex({ isPublic: 1 });
    await this.recipes.createIndex({ title: 'text', description: 'text', 'ingredients': 'text' });
  }

  async disconnect() {
    await this.client.close();
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    };
    
    await this.users.insertOne(newUser as any);
    return newUser as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.users.findOne({ email });
    return user ? { ...user, id: user._id.toString() } as User : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.users.findOne({ _id: new ObjectId(id) });
    return user ? { ...user, id: user._id.toString() } as User : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.users.findOne({ username });
    return user ? { ...user, id: user._id.toString() } as User : null;
  }

  // Recipe methods
  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const newRecipe = {
      ...recipe,
      id: new ObjectId().toString(),
      createdAt: new Date(),
      likes: 0,
    };
    
    await this.recipes.insertOne(newRecipe as any);
    return newRecipe as Recipe;
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const recipe = await this.recipes.findOne({ _id: new ObjectId(id) });
    return recipe ? { ...recipe, id: recipe._id.toString() } as Recipe : null;
  }

  async getRecipesByAuthor(authorId: string): Promise<Recipe[]> {
    const recipes = await this.recipes.find({ authorId }).toArray();
    return recipes.map(recipe => ({ ...recipe, id: recipe._id.toString() })) as Recipe[];
  }

  async getPublicRecipes(): Promise<Recipe[]> {
    const recipes = await this.recipes.find({ isPublic: true }).sort({ createdAt: -1 }).toArray();
    return recipes.map(recipe => ({ ...recipe, id: recipe._id.toString() })) as Recipe[];
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    const result = await this.recipes.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    return result.value ? { ...result.value, id: result.value._id.toString() } as Recipe : null;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await this.recipes.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const recipes = await this.recipes.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { ingredients: { $elemMatch: { $regex: query, $options: 'i' } } }
          ]
        }
      ]
    }).toArray();
    
    return recipes.map(recipe => ({ ...recipe, id: recipe._id.toString() })) as Recipe[];
  }

  async likeRecipe(id: string): Promise<Recipe | null> {
    const result = await this.recipes.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );
    
    return result.value ? { ...result.value, id: result.value._id.toString() } as Recipe : null;
  }
}
```

### 4. Update Storage Configuration

Modify `server/storage.ts` to use MongoDB:

```typescript
import { MongoStorage } from './storage/mongodb';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tastebase';
export const storage = new MongoStorage(mongoUri);

// Initialize connection
storage.connect().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await storage.disconnect();
  process.exit(0);
});
```

### 5. Data Migration

Create a migration script `scripts/migrate-to-mongodb.ts`:

```typescript
import { storage as mongoStorage } from '../server/storage';
import { mockUsers, mockRecipes } from '../server/data/mock-data';

async function migrate() {
  console.log('Starting migration to MongoDB...');
  
  // Migrate users
  for (const user of mockUsers) {
    try {
      await mongoStorage.createUser(user);
      console.log(`Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error);
    }
  }
  
  // Migrate recipes
  for (const recipe of mockRecipes) {
    try {
      await mongoStorage.createRecipe(recipe);
      console.log(`Migrated recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`Error migrating recipe ${recipe.title}:`, error);
    }
  }
  
  console.log('Migration completed!');
  process.exit(0);
}

migrate();
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  id: String, // Application ID (for compatibility)
  username: String,
  email: String,
  password: String, // Hashed with bcrypt
  createdAt: Date
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ username: 1 }` (unique)

### Recipes Collection

```javascript
{
  _id: ObjectId,
  id: String, // Application ID (for compatibility)
  title: String,
  description: String,
  ingredients: [String],
  instructions: [String],
  tags: [String],
  imageUrl: String,
  cookTime: String,
  authorId: String,
  isPublic: Boolean,
  likes: Number,
  createdAt: Date
}
```

**Indexes:**
- `{ authorId: 1 }`
- `{ isPublic: 1 }`
- `{ title: 'text', description: 'text', ingredients: 'text' }` (for full-text search)

## Performance Optimizations

### 1. Database Indexes

The integration includes optimized indexes for:
- User authentication (email, username)
- Recipe queries by author
- Public recipe browsing
- Full-text search across recipe content

### 2. Connection Pooling

MongoDB driver automatically handles connection pooling. Configure pool size if needed:

```typescript
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 3. Aggregation Pipelines

For complex queries, use aggregation pipelines:

```typescript
// Get recipes with author information
async getRecipesWithAuthors(): Promise<RecipeWithAuthor[]> {
  const pipeline = [
    { $match: { isPublic: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: 'id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    { $sort: { createdAt: -1 } }
  ];
  
  const results = await this.recipes.aggregate(pipeline).toArray();
  return results.map(result => ({
    ...result,
    id: result._id.toString(),
    author: {
      id: result.author.id,
      username: result.author.username
    }
  }));
}
```

## Testing with MongoDB

### Unit Tests

Update test files to use a test database:

```typescript
// In test files
beforeAll(async () => {
  const testStorage = new MongoStorage('mongodb://localhost:27017/tastebase-test');
  await testStorage.connect();
});

afterAll(async () => {
  // Clean up test database
  await testStorage.db.dropDatabase();
  await testStorage.disconnect();
});
```

### Integration Tests

Test the complete flow with MongoDB:

```typescript
describe('Recipe API with MongoDB', () => {
  it('should create and retrieve recipes', async () => {
    // Test recipe creation, retrieval, and search
    const recipe = await storage.createRecipe(mockRecipe);
    expect(recipe.id).toBeDefined();
    
    const retrieved = await storage.getRecipeById(recipe.id);
    expect(retrieved.title).toBe(mockRecipe.title);
  });
});
```

## Production Deployment

### 1. Environment Variables

Ensure these are set in your production environment:

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

### 2. Connection Security

- Use SSL/TLS for MongoDB connections
- Implement IP whitelisting
- Use strong authentication credentials
- Regular security updates

### 3. Monitoring

Implement logging and monitoring:

```typescript
// Add connection monitoring
client.on('connectionPoolCreated', () => {
  console.log('MongoDB connection pool created');
});

client.on('connectionPoolClosed', () => {
  console.log('MongoDB connection pool closed');
});
```

## Backup and Recovery

### Automated Backups

Set up regular database backups:

```bash
# Daily backup script
mongodump --uri="your-mongodb-uri" --out /backup/$(date +%Y%m%d)
```

### Data Recovery

To restore from backup:

```bash
mongorestore --uri="your-mongodb-uri" /backup/20240101
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check network connectivity and MongoDB server status
2. **Authentication Failed**: Verify credentials and database permissions
3. **Index Creation Errors**: Ensure proper database permissions
4. **Memory Issues**: Monitor memory usage and optimize queries

### Debugging

Enable MongoDB logging:

```typescript
const client = new MongoClient(uri, {
  loggerLevel: 'debug',
  logger: (message, state) => console.log(message, state)
});
```

## Migration Checklist

- [ ] Set up MongoDB database
- [ ] Configure environment variables
- [ ] Install MongoDB dependencies
- [ ] Create MongoDB storage implementation
- [ ] Update storage configuration
- [ ] Create and run migration script
- [ ] Update tests for MongoDB
- [ ] Test all application features
- [ ] Deploy to production
- [ ] Set up monitoring and backups

This integration maintains all existing functionality while providing the scalability and features of MongoDB. The modular design ensures easy switching between storage backends if needed.