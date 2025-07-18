@@ .. @@
 import { users, recipes, type User, type InsertUser, type Recipe, type InsertRecipe, type UpdateRecipe, type RecipeWithAuthor } from "@shared/schema";
 import { mockUsers } from "./data/mockUsers";
 import { mockRecipes } from "./data/mockRecipes";
+import { MongoStorage } from "./mongoStorage";

 export interface IStorage {
@@ .. @@
 export const storage = new MemStorage();
+
+// Export MongoDB storage for production use
+export const mongoStorage = new MongoStorage();
+
+// Use MongoDB storage if DATABASE_URL is provided, otherwise use in-memory storage
+export const getStorage = (): IStorage => {
+  if (process.env.DATABASE_URL || process.env.MONGODB_URI) {
+    return mongoStorage;
+  }
+  return storage;
+};