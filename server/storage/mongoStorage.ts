import User, { IUser } from '../models/User';
import Recipe, { IRecipe } from '../models/Recipe';
import { IStorage } from './index';
import { 
  User as UserType, 
  InsertUser, 
  Recipe as RecipeType, 
  InsertRecipe, 
  UpdateRecipe, 
  RecipeWithAuthor 
} from "@shared/schema";
import mongoose from 'mongoose';

export class MongoStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      const user = await User.findById(id);
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<UserType> {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return this.mapUserToType(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Recipe operations
  async getRecipe(id: number): Promise<RecipeType | undefined> {
    try {
      const recipe = await Recipe.findById(id);
      return recipe ? this.mapRecipeToType(recipe) : undefined;
    } catch (error) {
      console.error('Error getting recipe:', error);
      return undefined;
    }
  }

  async getRecipeWithAuthor(id: number): Promise<RecipeWithAuthor | undefined> {
    try {
      const recipe = await Recipe.findById(id).populate('authorId', 'username');
      if (!recipe) return undefined;

      const populatedRecipe = recipe as any;
      return {
        ...this.mapRecipeToType(recipe),
        author: {
          id: populatedRecipe.authorId._id.toString(),
          username: populatedRecipe.authorId.username,
        },
      };
    } catch (error) {
      console.error('Error getting recipe with author:', error);
      return undefined;
    }
  }

  async getPublicRecipes(): Promise<RecipeWithAuthor[]> {
    try {
      const recipes = await Recipe.find({ isPublic: true })
        .populate('authorId', 'username')
        .sort({ createdAt: -1 });

      return recipes.map(recipe => {
        const populatedRecipe = recipe as any;
        return {
          ...this.mapRecipeToType(recipe),
          author: {
            id: populatedRecipe.authorId._id.toString(),
            username: populatedRecipe.authorId.username,
          },
        };
      });
    } catch (error) {
      console.error('Error getting public recipes:', error);
      return [];
    }
  }

  async getUserRecipes(userId: number): Promise<RecipeType[]> {
    try {
      const recipes = await Recipe.find({ authorId: userId })
        .sort({ createdAt: -1 });
      
      return recipes.map(recipe => this.mapRecipeToType(recipe));
    } catch (error) {
      console.error('Error getting user recipes:', error);
      return [];
    }
  }

  async createRecipe(recipeData: InsertRecipe & { authorId: number }): Promise<RecipeType> {
    try {
      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();
      return this.mapRecipeToType(savedRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw new Error('Failed to create recipe');
    }
  }

  async updateRecipe(id: number, updateData: UpdateRecipe): Promise<RecipeType | undefined> {
    try {
      const recipe = await Recipe.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      return recipe ? this.mapRecipeToType(recipe) : undefined;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe');
    }
  }

  async deleteRecipe(id: number): Promise<boolean> {
    try {
      const result = await Recipe.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }

  async searchRecipes(query: string): Promise<RecipeWithAuthor[]> {
    try {
      const recipes = await Recipe.find({
        isPublic: true,
        $text: { $search: query }
      })
      .populate('authorId', 'username')
      .sort({ score: { $meta: 'textScore' } });

      return recipes.map(recipe => {
        const populatedRecipe = recipe as any;
        return {
          ...this.mapRecipeToType(recipe),
          author: {
            id: populatedRecipe.authorId._id.toString(),
            username: populatedRecipe.authorId.username,
          },
        };
      });
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }

  async likeRecipe(id: number): Promise<RecipeType | undefined> {
    try {
      const recipe = await Recipe.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      );
      return recipe ? this.mapRecipeToType(recipe) : undefined;
    } catch (error) {
      console.error('Error liking recipe:', error);
      return undefined;
    }
  }

  // Helper methods to map Mongoose documents to our types
  private mapUserToType(user: IUser): UserType {
    return {
      id: parseInt(user.id),
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
    };
  }

  private mapRecipeToType(recipe: IRecipe): RecipeType {
    return {
      id: parseInt(recipe.id),
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      imageUrl: recipe.imageUrl || null,
      cookTime: recipe.cookTime,
      authorId: parseInt(recipe.authorId.toString()),
      isPublic: recipe.isPublic,
      likes: recipe.likes,
      createdAt: recipe.createdAt,
    };
  }
}