import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcrypt";
import path from "path";
import { storage } from "./storage";
import { authenticateToken, type AuthenticatedRequest } from "./middleware/auth";
import { generateToken } from "./utils/jwt";
import { 
  insertUserSchema, 
  loginSchema, 
  insertRecipeSchema, 
  updateRecipeSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static landing page route
  app.get("/landing", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "landing.html"));
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Recipe routes
  app.get("/api/recipes/public", async (req, res) => {
    try {
      const recipes = await storage.getPublicRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/recipes/my", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const recipes = await storage.getUserRecipes(req.user!.userId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeWithAuthor(id);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/recipes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      console.log("Recipe creation request:", {
        body: req.body,
        user: req.user,
        headers: req.headers.authorization ? 'Token present' : 'No token'
      });
      
      const recipeData = insertRecipeSchema.parse(req.body);

      const recipe = await storage.createRecipe({
        ...recipeData,
        authorId: req.user!.userId,
      });

      console.log("Recipe created successfully:", recipe.id);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Recipe creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid recipe data" });
      }
    }
  });

  app.put("/api/recipes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Recipe update request:", {
        recipeId: id,
        body: req.body,
        user: req.user
      });
      
      const updateData = updateRecipeSchema.parse(req.body);

      // Check if recipe exists and belongs to user
      const existingRecipe = await storage.getRecipe(id);
      if (!existingRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (existingRecipe.authorId !== req.user!.userId) {
        return res.status(403).json({ message: "Not authorized to update this recipe" });
      }

      const updatedRecipe = await storage.updateRecipe(id, updateData);
      console.log("Recipe updated successfully:", updatedRecipe?.id);
      res.json(updatedRecipe);
    } catch (error) {
      console.error("Recipe update error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid recipe data" });
      }
    }
  });

  app.delete("/api/recipes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      // Check if recipe exists and belongs to user
      const existingRecipe = await storage.getRecipe(id);
      if (!existingRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (existingRecipe.authorId !== req.user!.userId) {
        return res.status(403).json({ message: "Not authorized to delete this recipe" });
      }

      const deleted = await storage.deleteRecipe(id);
      if (deleted) {
        res.json({ message: "Recipe deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete recipe" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/recipes/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }

      const recipes = await storage.searchRecipes(query);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/recipes/:id/like", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.likeRecipe(id);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  // Setup Socket.IO for real-time features
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_recipe", (recipeId) => {
      socket.join(`recipe_${recipeId}`);
      console.log(`User ${socket.id} joined recipe ${recipeId}`);
    });

    socket.on("leave_recipe", (recipeId) => {
      socket.leave(`recipe_${recipeId}`);
      console.log(`User ${socket.id} left recipe ${recipeId}`);
    });

    socket.on("recipe_liked", (data) => {
      // Broadcast recipe like update to all users viewing the recipe
      socket.to(`recipe_${data.recipeId}`).emit("recipe_updated", {
        recipeId: data.recipeId,
        likes: data.likes,
        type: "like"
      });

      // Broadcast to general recipe feed
      socket.broadcast.emit("recipe_feed_update", {
        recipeId: data.recipeId,
        likes: data.likes,
        type: "like"
      });
    });

    socket.on("new_recipe_created", (recipeData) => {
      // Broadcast new recipe to all connected users
      if (recipeData.isPublic) {
        socket.broadcast.emit("new_recipe_available", recipeData);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}