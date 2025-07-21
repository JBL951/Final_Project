import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { IStorage } from '../storage';
import { type User, type Recipe, type InsertUser, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from '@shared/schema';
import bcrypt from 'bcrypt';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db!: Db;
  private users!: Collection<any>;
  private recipes!: Collection<any>;
  private connected: boolean = false;
  private userIdCounter: number = 1;
  private recipeIdCounter: number = 1;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.db = this.client.db('tastebase');
      this.users = this.db.collection('users');
      this.recipes = this.db.collection('recipes');
      
      // Create indexes for better performance
      try {
        await this.users.createIndex({ email: 1 }, { unique: true });
        await this.users.createIndex({ username: 1 }, { unique: true });
        await this.recipes.createIndex({ authorId: 1 });
        await this.recipes.createIndex({ isPublic: 1 });
        await this.recipes.createIndex({ 
          title: 'text', 
          description: 'text', 
          ingredients: 'text' 
        });
      } catch (error: any) {
        console.log('Indexes may already exist:', error.message);
      }
      
      this.connected = true;
      console.log('✅ MongoDB connected successfully');
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
      console.log('📡 MongoDB disconnected');
    }
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    await this.connect();
    
    // Check if user already exists
    const existingUser = await this.users.findOne({
      $or: [
        { email: user.email },
        { username: user.username }
      ]
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userId = this.userIdCounter++;
    
    const newUser = {
      ...user,
      id: userId,
      password: hashedPassword,
      createdAt: new Date(),
    };
    
    await this.users.insertOne(newUser);
    
    return newUser as User;
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.connect();
    const user = await this.users.findOne({ id });
    return user ? user as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    const user = await this.users.findOne({ email });
    return user ? user as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    const user = await this.users.findOne({ username });
    return user ? user as User : undefined;
  }

  // Recipe methods
  async createRecipe(recipe: InsertRecipe & { authorId: number }): Promise<Recipe> {
    await this.connect();
    
    const recipeId = this.recipeIdCounter++;
    const newRecipe = {
      ...recipe,
      id: recipeId,
      createdAt: new Date(),
      likes: 0,
    };
    
    await this.recipes.insertOne(newRecipe);
    return newRecipe as Recipe;
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    await this.connect();
    const recipe = await this.recipes.findOne({ id });
    return recipe ? recipe as Recipe : undefined;
  }

  async getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined> {
    await this.connect();
    
    const pipeline = [
      { $match: { id } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: 'id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          id: 1,
          title: 1,
          description: 1,
          ingredients: 1,
          instructions: 1,
          tags: 1,
          imageUrl: 1,
          cookTime: 1,
          authorId: 1,
          isPublic: 1,
          likes: 1,
          createdAt: 1,
          'author.id': 1,
          'author.username': 1
        }
      }
    ];
    
    const results = await this.recipes.aggregate(pipeline).toArray();
    return results.length > 0 ? results[0] as RecipeWithAuthor : undefined;
  }

  async getPublicRecipes(): Promise<RecipeWithAuthor[]> {
    await this.connect();
    
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          id: 1,
          title: 1,
          description: 1,
          ingredients: 1,
          instructions: 1,
          tags: 1,
          imageUrl: 1,
          cookTime: 1,
          authorId: 1,
          isPublic: 1,
          likes: 1,
          createdAt: 1,
          'author.id': 1,
          'author.username': 1
        }
      }
    ];
    
    return await this.recipes.aggregate(pipeline).toArray() as RecipeWithAuthor[];
  }

  async getUserRecipes(userId: number): Promise<Recipe[]> {
    await this.connect();
    const recipes = await this.recipes.find({ authorId: userId }).sort({ createdAt: -1 }).toArray();
    return recipes as Recipe[];
  }

  async updateRecipe(id: number, recipe: UpdateRecipe): Promise<Recipe | undefined> {
    await this.connect();
    
    const result = await this.recipes.findOneAndUpdate(
      { id },
      { $set: recipe },
      { returnDocument: 'after' }
    );
    
    return result.value ? result.value as Recipe : undefined;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    await this.connect();
    
    const result = await this.recipes.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchRecipes(query: string): Promise<RecipeWithAuthor[]> {
    await this.connect();
    
    const pipeline = [
      {
        $match: {
          $and: [
            { isPublic: true },
            {
              $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { ingredients: { $elemMatch: { $regex: query, $options: 'i' } } },
                { tags: { $elemMatch: { $regex: query, $options: 'i' } } }
              ]
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: 'id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          id: 1,
          title: 1,
          description: 1,
          ingredients: 1,
          instructions: 1,
          tags: 1,
          imageUrl: 1,
          cookTime: 1,
          authorId: 1,
          isPublic: 1,
          likes: 1,
          createdAt: 1,
          'author.id': 1,
          'author.username': 1
        }
      }
    ];
    
    return await this.recipes.aggregate(pipeline).toArray() as RecipeWithAuthor[];
  }

  async likeRecipe(id: number): Promise<Recipe | undefined> {
    await this.connect();
    
    const result = await this.recipes.findOneAndUpdate(
      { id },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );
    
    return result.value ? result.value as Recipe : undefined;
  }

  // Initialize counters from existing data
  async initializeCounters() {
    await this.connect();
    
    // Get highest user ID
    const userWithMaxId = await this.users.findOne({}, { sort: { id: -1 } });
    this.userIdCounter = userWithMaxId ? userWithMaxId.id + 1 : 1;
    
    // Get highest recipe ID
    const recipeWithMaxId = await this.recipes.findOne({}, { sort: { id: -1 } });
    this.recipeIdCounter = recipeWithMaxId ? recipeWithMaxId.id + 1 : 1;
  }
}