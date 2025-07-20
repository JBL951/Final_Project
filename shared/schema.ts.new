import { z } from "zod";

// Base schemas
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date()
});

const recipeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  imageUrl: z.string().nullable(),
  cookTime: z.string(),
  authorId: z.number(),
  isPublic: z.boolean(),
  likes: z.number(),
  createdAt: z.date()
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeWithAuthor = Recipe & {
  author: {
    id: number;
    username: string;
  };
};

// Operation types
export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type InsertRecipe = Omit<Recipe, 'id' | 'likes' | 'createdAt'>;
export type UpdateRecipe = Partial<InsertRecipe>;

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const insertRecipeSchema = recipeSchema.omit({ 
  id: true, 
  likes: true, 
  createdAt: true 
}).extend({
  isPublic: z.boolean().default(true)
});

export const updateRecipeSchema = insertRecipeSchema.partial();
