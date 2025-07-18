import { users, recipes, type User, type InsertUser, type Recipe, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from "@shared/schema";
import { mockUsers } from "./data/mockUsers";
import { mockRecipes } from "./data/mockRecipes";

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

export const storage = new MemStorage();
