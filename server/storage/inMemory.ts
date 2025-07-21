
import { IStorage } from '../storage';
import { type User, type Recipe, type InsertUser, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from '@shared/schema';
import { mockUsers } from '../data/mockUsers';
import { mockRecipes } from '../data/mockRecipes';
import bcrypt from 'bcrypt';

export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private recipes: Recipe[] = [];
  private userIdCounter: number = 1;
  private recipeIdCounter: number = 1;

  async connect() {
    console.log('✅ In-memory storage connected');
  }

  async disconnect() {
    console.log('📡 In-memory storage disconnected');
  }

  async initializeWithMockData() {
    // Load mock users
    for (const mockUser of mockUsers) {
      const user: User = {
        ...mockUser,
        id: this.userIdCounter++,
      };
      this.users.push(user);
    }

    // Load mock recipes
    for (const mockRecipe of mockRecipes) {
      const recipe: Recipe = {
        ...mockRecipe,
        id: this.recipeIdCounter++,
      };
      this.recipes.push(recipe);
    }

    console.log(`📚 Loaded ${this.users.length} mock users and ${this.recipes.length} mock recipes`);
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = this.users.find(
      u => u.email === user.email || u.username === user.username
    );
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      ...user,
      id: this.userIdCounter++,
      createdAt: new Date(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  // Recipe methods
  async createRecipe(recipe: InsertRecipe & { authorId: number }): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: this.recipeIdCounter++,
      createdAt: new Date(),
      likes: 0,
    };
    
    this.recipes.push(newRecipe);
    return newRecipe;
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.find(recipe => recipe.id === id);
  }

  async getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined> {
    const recipe = this.recipes.find(r => r.id === id);
    if (!recipe) return undefined;

    const author = this.users.find(u => u.id === recipe.authorId);
    if (!author) return undefined;

    return {
      ...recipe,
      author: {
        id: author.id,
        username: author.username,
      }
    };
  }

  async getPublicRecipes(): Promise<RecipeWithAuthor[]> {
    const publicRecipes = this.recipes.filter(recipe => recipe.isPublic);
    
    return publicRecipes.map(recipe => {
      const author = this.users.find(u => u.id === recipe.authorId);
      return {
        ...recipe,
        author: {
          id: author?.id || 0,
          username: author?.username || 'Unknown',
        }
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserRecipes(userId: number): Promise<Recipe[]> {
    return this.recipes
      .filter(recipe => recipe.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateRecipe(id: number, updateData: UpdateRecipe): Promise<Recipe | undefined> {
    const recipeIndex = this.recipes.findIndex(recipe => recipe.id === id);
    if (recipeIndex === -1) return undefined;

    this.recipes[recipeIndex] = { ...this.recipes[recipeIndex], ...updateData };
    return this.recipes[recipeIndex];
  }

  async deleteRecipe(id: number): Promise<boolean> {
    const recipeIndex = this.recipes.findIndex(recipe => recipe.id === id);
    if (recipeIndex === -1) return false;

    this.recipes.splice(recipeIndex, 1);
    return true;
  }

  async searchRecipes(query: string): Promise<RecipeWithAuthor[]> {
    const lowerQuery = query.toLowerCase();
    const matchingRecipes = this.recipes.filter(recipe => 
      recipe.isPublic && (
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowerQuery)) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );

    return matchingRecipes.map(recipe => {
      const author = this.users.find(u => u.id === recipe.authorId);
      return {
        ...recipe,
        author: {
          id: author?.id || 0,
          username: author?.username || 'Unknown',
        }
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async likeRecipe(id: number): Promise<Recipe | undefined> {
    const recipe = this.recipes.find(r => r.id === id);
    if (!recipe) return undefined;

    recipe.likes += 1;
    return recipe;
  }
}
