import { MongoClient, Db, Collection, WithId, Document } from 'mongodb';
import { IStorage } from '../storage';
import { type User, type Recipe, type InsertUser, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from '@shared/schema';
import bcrypt from 'bcrypt';

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db!: Db;
  private users!: Collection<Document>;
  private recipes!: Collection<Document>;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db('tastebase');
    this.users = this.db.collection('users');
    this.recipes = this.db.collection('recipes');
    
    // Create indexes for better performance
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ username: 1 }, { unique: true });
    await this.recipes.createIndex({ authorId: 1 });
    await this.recipes.createIndex({ isPublic: 1 });
    await this.recipes.createIndex({ 
      title: 'text', 
      description: 'text', 
      'ingredients': 'text',
      'tags': 'text'
    });
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  private mapUser(doc: WithId<Document> | null): User | undefined {
    if (!doc) return undefined;
    return {
      id: doc.id,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      createdAt: doc.createdAt
    };
  }

  private mapRecipe(doc: WithId<Document> | null): Recipe | undefined {
    if (!doc) return undefined;
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      ingredients: doc.ingredients,
      instructions: doc.instructions,
      tags: doc.tags,
      imageUrl: doc.imageUrl,
      cookTime: doc.cookTime,
      authorId: doc.authorId,
      isPublic: doc.isPublic,
      likes: doc.likes,
      createdAt: doc.createdAt
    };
  }

  private async mapRecipeWithAuthor(recipe: WithId<Document>): Promise<RecipeWithAuthor | undefined> {
    const author = await this.users.findOne({ id: recipe.authorId });
    if (!author) return undefined;

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      imageUrl: recipe.imageUrl,
      cookTime: recipe.cookTime,
      authorId: recipe.authorId,
      isPublic: recipe.isPublic,
      likes: recipe.likes,
      createdAt: recipe.createdAt,
      author: {
        id: author.id,
        username: author.username
      }
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.users.findOne({ id });
    return this.mapUser(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.users.findOne({ email });
    return this.mapUser(user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.users.findOne({ username });
    return this.mapUser(user);
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      id: await this.getNextUserId(),
      password: hashedPassword,
      createdAt: new Date()
    };
    
    await this.users.insertOne(newUser);
    return newUser as User;
  }

  // Recipe operations
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const recipe = await this.recipes.findOne({ id });
    return this.mapRecipe(recipe);
  }

  async getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined> {
    const recipe = await this.recipes.findOne({ id });
    if (!recipe) return undefined;
    return this.mapRecipeWithAuthor(recipe);
  }

  async getPublicRecipes(): Promise<RecipeWithAuthor[]> {
    const publicRecipes = await this.recipes.find({ isPublic: true }).toArray();
    const recipesWithAuthors = await Promise.all(
      publicRecipes.map(recipe => this.mapRecipeWithAuthor(recipe))
    );
    return recipesWithAuthors.filter((r): r is RecipeWithAuthor => r !== undefined);
  }

  async getUserRecipes(userId: number): Promise<Recipe[]> {
    const recipes = await this.recipes.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .toArray();
    return recipes.map(recipe => this.mapRecipe(recipe)).filter((r): r is Recipe => r !== undefined);
  }

  async createRecipe(recipe: InsertRecipe & { authorId: number }): Promise<Recipe> {
    const newRecipe = {
      ...recipe,
      id: await this.getNextRecipeId(),
      likes: 0,
      createdAt: new Date(),
      imageUrl: recipe.imageUrl || null,
      isPublic: recipe.isPublic ?? true,
      cookTime: recipe.cookTime || '0',
      tags: recipe.tags || []
    };
    
    await this.recipes.insertOne(newRecipe);
    return newRecipe as Recipe;
  }

  async updateRecipe(id: number, updateData: UpdateRecipe): Promise<Recipe | undefined> {
    const result = await this.recipes.findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return this.mapRecipe(result.value);
  }

  async deleteRecipe(id: number): Promise<boolean> {
    const result = await this.recipes.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchRecipes(query: string): Promise<RecipeWithAuthor[]> {
    const searchResults = await this.recipes.find({
      isPublic: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: query, $options: 'i' } } },
        { tags: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    }).toArray();

    const recipesWithAuthors = await Promise.all(
      searchResults.map(recipe => this.mapRecipeWithAuthor(recipe))
    );
    return recipesWithAuthors.filter((r): r is RecipeWithAuthor => r !== undefined);
  }

  async likeRecipe(id: number): Promise<Recipe | undefined> {
    const result = await this.recipes.findOneAndUpdate(
      { id },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );
    
    return this.mapRecipe(result.value);
  }

  private async getNextUserId(): Promise<number> {
    const lastUser = await this.users.findOne({}, { sort: { id: -1 } });
    return (lastUser?.id || 0) + 1;
  }

  private async getNextRecipeId(): Promise<number> {
    const lastRecipe = await this.users.findOne({}, { sort: { id: -1 } });
    return (lastRecipe?.id || 0) + 1;
  }
}
