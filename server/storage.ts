import { users, recipes, type User, type InsertUser, type Recipe, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from "@shared/schema";
import { mockUsers } from "./data/mockUsers";
import { mockRecipes } from "./data/mockRecipes";
import { MongoStorage } from './storage/mongodb';
import { InMemoryStorage } from './storage/inMemory';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined>;
  getPublicRecipes(): Promise<RecipeWithAuthor[]>;
  getUserRecipes(userId: number): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe & { authorId: number }): Promise<Recipe>;
  updateRecipe(id: number, recipe: UpdateRecipe): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  searchRecipes(query: string): Promise<RecipeWithAuthor[]>;
  likeRecipe(id: number): Promise<Recipe | undefined>;
}

export class MemStorage implements IStorage {
  async connect() {
    console.log('✅ In-memory storage connected');
  }

  async disconnect() {
    console.log('📡 In-memory storage disconnected');
  }
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private currentUserId: number;
  private currentRecipeId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.currentUserId = 1;
    this.currentRecipeId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add mock users
    mockUsers.forEach(user => {
      const userWithId = { ...user, id: this.currentUserId++ };
      this.users.set(userWithId.id, userWithId);
    });

    // Add mock recipes
    mockRecipes.forEach(recipe => {
      const recipeWithId = { ...recipe, id: this.currentRecipeId++ };
      this.recipes.set(recipeWithId.id, recipeWithId);
    });
    console.log(`📚 Loaded ${mockUsers.length} mock users and ${mockRecipes.length} mock recipes`);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;

    const author = this.users.get(recipe.authorId);
    if (!author) return undefined;

    return {
      ...recipe,
      author: {
        id: author.id,
        username: author.username,
      },
    };
  }

  async getPublicRecipes(): Promise<RecipeWithAuthor[]> {
    const publicRecipes = Array.from(this.recipes.values())
      .filter(recipe => recipe.isPublic)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const recipesWithAuthors: RecipeWithAuthor[] = [];
    for (const recipe of publicRecipes) {
      const author = this.users.get(recipe.authorId);
      if (author) {
        recipesWithAuthors.push({
          ...recipe,
          author: {
            id: author.id,
            username: author.username,
          },
        });
      }
    }

    return recipesWithAuthors;
  }

  async getUserRecipes(userId: number): Promise<Recipe[]> {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.authorId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createRecipe(recipe: InsertRecipe & { authorId: number }): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const newRecipe: Recipe = {
      ...recipe,
      id,
      likes: 0,
      createdAt: new Date(),
      imageUrl: recipe.imageUrl || null,
      isPublic: recipe.isPublic ?? true,
    };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async updateRecipe(id: number, updateData: UpdateRecipe): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;

    const updatedRecipe = { ...recipe, ...updateData };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipes.delete(id);
  }

  async searchRecipes(query: string): Promise<RecipeWithAuthor[]> {
    const lowerQuery = query.toLowerCase();
    const matchingRecipes = Array.from(this.recipes.values())
      .filter(recipe => 
        recipe.isPublic && (
          recipe.title.toLowerCase().includes(lowerQuery) ||
          recipe.description.toLowerCase().includes(lowerQuery) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(lowerQuery)
          ) ||
          recipe.tags.some(tag => 
            tag.toLowerCase().includes(lowerQuery)
          )
        )
      );

    const recipesWithAuthors: RecipeWithAuthor[] = [];
    for (const recipe of matchingRecipes) {
      const author = this.users.get(recipe.authorId);
      if (author) {
        recipesWithAuthors.push({
          ...recipe,
          author: {
            id: author.id,
            username: author.username,
          },
        });
      }
    }

    return recipesWithAuthors;
  }

  async likeRecipe(id: number): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;

    const updatedRecipe = { ...recipe, likes: recipe.likes + 1 };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }
}

// MongoDB configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sydwell:Lebeloane@cluster0.owe4bf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize storage
async function initializeStorage() {
  let mongoStorage: MongoStorage | null = null;
  try {
    mongoStorage = new MongoStorage(mongoUri);
    await mongoStorage.connect();
    await mongoStorage.initializeCounters();
    await importMockData(mongoStorage);
    console.log('🚀 MongoDB storage initialized successfully');
    storage = mongoStorage;
  } catch (error) {
    console.warn("MongoDB connection failed, using in-memory storage:", error);
    const memStorage = new InMemoryStorage();
    await memStorage.connect();
    await memStorage.initializeWithMockData();
    storage = memStorage;
  }
}

// Migration function to import mock data
async function importMockData(mongoStorage: MongoStorage) {
  try {

    // Check if data already exists
    const existingUsers = await mongoStorage.users.countDocuments();
    if (existingUsers > 0) {
      console.log('📊 MongoDB already contains data, skipping mock data import');
      return;
    }

    console.log('📊 Importing mock data to MongoDB...');

    // Import users
    const userMap = new Map<number, number>(); // old ID -> new ID
    for (const mockUser of mockUsers) {
      try {
        const user = await mongoStorage.createUser(mockUser);
        userMap.set(mockUser.id, user.id);
        console.log(`✅ Imported user: ${user.username}`);
      } catch (error: any) {
        console.log(`⚠️ User ${mockUser.username} might already exist:`, error.message);
      }
    }

    // Import recipes
    for (const mockRecipe of mockRecipes) {
      try {
        const newAuthorId = userMap.get(mockRecipe.authorId);
        if (newAuthorId) {
          const { id, authorId, ...recipeData } = mockRecipe;
          await mongoStorage.createRecipe({
            ...recipeData,
            authorId: newAuthorId
          });
          console.log(`✅ Imported recipe: ${mockRecipe.title}`);
        }
      } catch (error: any) {
        console.log(`⚠️ Failed to import recipe ${mockRecipe.title}:`, error.message);
      }
    }

    console.log('✅ Mock data import completed');
  } catch (error) {
    console.error('❌ Failed to import mock data:', error);
  }
}

// Initialize on startup
initializeStorage().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (storage instanceof MongoStorage) {
      await storage.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
    if (storage instanceof MongoStorage) {
        await storage.disconnect();
    }
  process.exit(0);
});

// Export the storage for use in routes
export let storage: IStorage;