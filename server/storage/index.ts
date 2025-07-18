import { users, recipes, type User, type InsertUser, type Recipe, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from "@shared/schema";
import { mockUsers } from "./data/mockUsers";
import { mockRecipes } from "./data/mockRecipes";
import { MongoStorage } from "./mongoStorage";

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Recipe methods
  getRecipes(): Promise<RecipeWithAuthor[]>;
  getRecipeById(id: string): Promise<RecipeWithAuthor | undefined>;
  getRecipesByAuthor(authorId: string): Promise<RecipeWithAuthor[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: UpdateRecipe): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
}

class MemStorage implements IStorage {
  private users: User[] = [...mockUsers];
  private recipes: Recipe[] = [...mockRecipes];

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: crypto.randomUUID(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = {
      ...this.users[index],
      ...user,
      updatedAt: new Date()
    };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async getRecipes(): Promise<RecipeWithAuthor[]> {
    return this.recipes.map(recipe => {
      const author = this.users.find(user => user.id === recipe.authorId);
      return {
        ...recipe,
        author: author || null
      };
    });
  }

  async getRecipeById(id: string): Promise<RecipeWithAuthor | undefined> {
    const recipe = this.recipes.find(r => r.id === id);
    if (!recipe) return undefined;
    
    const author = this.users.find(user => user.id === recipe.authorId);
    return {
      ...recipe,
      author: author || null
    };
  }

  async getRecipesByAuthor(authorId: string): Promise<RecipeWithAuthor[]> {
    const authorRecipes = this.recipes.filter(recipe => recipe.authorId === authorId);
    const author = this.users.find(user => user.id === authorId);
    
    return authorRecipes.map(recipe => ({
      ...recipe,
      author: author || null
    }));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      ...recipe,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.recipes.push(newRecipe);
    return newRecipe;
  }

  async updateRecipe(id: string, recipe: UpdateRecipe): Promise<Recipe | undefined> {
    const index = this.recipes.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    this.recipes[index] = {
      ...this.recipes[index],
      ...recipe,
      updatedAt: new Date()
    };
    return this.recipes[index];
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const index = this.recipes.findIndex(recipe => recipe.id === id);
    if (index === -1) return false;
    this.recipes.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();

// Export MongoDB storage for production use
export const mongoStorage = new MongoStorage();

// Use MongoDB storage if DATABASE_URL is provided, otherwise use in-memory storage
export const getStorage = (): IStorage => {
  if (process.env.DATABASE_URL || process.env.MONGODB_URI) {
    return mongoStorage;
  }
  return storage;
};