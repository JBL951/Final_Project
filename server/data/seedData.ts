import bcrypt from "bcrypt";
import User from "../models/User";
import Recipe from "../models/Recipe";
import connectDB from "../config/database";

const seedUsers = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
  },
  {
    username: "sarah_johnson",
    email: "sarah@example.com",
    password: "password123",
  },
  {
    username: "mike_chen",
    email: "mike@example.com",
    password: "password123",
  },
  {
    username: "emma_davis",
    email: "emma@example.com",
    password: "password123",
  },
  {
    username: "gordon_ramsay",
    email: "gordon@example.com",
    password: "password123",
  },
];

const seedRecipes = [
  {
    title: "Creamy Garlic Pasta",
    description: "A rich and creamy pasta dish with roasted garlic and fresh herbs",
    ingredients: [
      "1 lb fettuccine pasta",
      "6 cloves garlic, minced",
      "1 cup heavy cream",
      "1/2 cup grated Parmesan cheese",
      "2 tbsp butter",
      "2 tbsp olive oil",
      "1/4 cup fresh parsley, chopped",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Cook pasta according to package directions until al dente",
      "Heat olive oil and butter in a large skillet over medium heat",
      "Add minced garlic and sauté for 1-2 minutes until fragrant",
      "Pour in heavy cream and bring to a gentle simmer",
      "Add cooked pasta and toss with the cream sauce",
      "Stir in Parmesan cheese and parsley",
      "Season with salt and pepper to taste"
    ],
    tags: ["pasta", "creamy", "garlic", "dinner", "italian"],
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=240",
    cookTime: "25 mins",
    isPublic: true,
    userEmail: "sarah@example.com",
  },
  {
    title: "Rainbow Buddha Bowl",
    description: "Nutritious bowl packed with colorful vegetables and quinoa",
    ingredients: [
      "1 cup quinoa",
      "2 cups mixed greens",
      "1 avocado, sliced",
      "1 cup cherry tomatoes, halved",
      "1 cucumber, diced",
      "1/2 cup shredded carrots",
      "1/2 cup chickpeas",
      "1/4 cup hemp seeds",
      "Tahini dressing"
    ],
    instructions: [
      "Cook quinoa according to package directions and let cool",
      "Wash and prepare all vegetables",
      "Arrange mixed greens in a bowl",
      "Top with cooked quinoa",
      "Add avocado, tomatoes, cucumber, and carrots",
      "Sprinkle with chickpeas and hemp seeds",
      "Drizzle with tahini dressing before serving"
    ],
    tags: ["healthy", "vegetarian", "buddha-bowl", "quinoa", "lunch"],
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=240",
    cookTime: "15 mins",
    isPublic: true,
    userEmail: "mike@example.com",
  },
  {
    title: "Chocolate Berry Cake",
    description: "Decadent chocolate cake topped with fresh seasonal berries",
    ingredients: [
      "2 cups all-purpose flour",
      "3/4 cup cocoa powder",
      "2 cups sugar",
      "2 tsp baking soda",
      "1 tsp baking powder",
      "1 tsp salt",
      "2 eggs",
      "1 cup buttermilk",
      "1/2 cup vegetable oil",
      "2 cups mixed berries"
    ],
    instructions: [
      "Preheat oven to 350°F and grease two 9-inch round pans",
      "Mix dry ingredients in a large bowl",
      "In another bowl, whisk together eggs, buttermilk, and oil",
      "Combine wet and dry ingredients until just mixed",
      "Divide batter between prepared pans",
      "Bake for 30-35 minutes until toothpick comes out clean",
      "Cool completely before frosting and adding berries"
    ],
    tags: ["dessert", "chocolate", "cake", "berries", "sweet"],
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=240",
    cookTime: "45 mins",
    isPublic: true,
    userEmail: "emma@example.com",
  },
  {
    title: "Fresh Caprese Salad",
    description: "Classic Italian salad with fresh ingredients",
    ingredients: [
      "4 large tomatoes, sliced",
      "1 lb fresh mozzarella, sliced",
      "1/2 cup fresh basil leaves",
      "1/4 cup extra virgin olive oil",
      "2 tbsp balsamic vinegar",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Arrange tomato and mozzarella slices on a platter",
      "Tuck basil leaves between the tomato and cheese",
      "Drizzle with olive oil and balsamic vinegar",
      "Season with salt and pepper",
      "Serve immediately at room temperature"
    ],
    tags: ["salad", "italian", "fresh", "caprese", "appetizer"],
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
    cookTime: "10 mins",
    isPublic: true,
    userEmail: "john@example.com",
  },
  {
    title: "Classic Beef Wellington",
    description: "Show-stopping centerpiece with beef tenderloin wrapped in puff pastry",
    ingredients: [
      "2 lbs beef tenderloin",
      "1 lb puff pastry",
      "8 oz prosciutto",
      "1 lb mushrooms, finely chopped",
      "2 tbsp Dijon mustard",
      "1 egg for wash",
      "2 tbsp olive oil",
      "Salt and pepper"
    ],
    instructions: [
      "Season beef with salt and pepper, sear in hot oil until browned",
      "Brush with mustard and let cool completely",
      "Sauté mushrooms until moisture evaporates",
      "Lay prosciutto on plastic wrap, spread mushrooms",
      "Place beef on top and wrap tightly",
      "Wrap in puff pastry, seal edges",
      "Brush with egg wash and bake at 400°F for 25-30 minutes"
    ],
    tags: ["beef", "wellington", "gourmet", "dinner", "special-occasion"],
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    cookTime: "2 hours 30 minutes",
    isPublic: true,
    userEmail: "gordon@example.com",
  },
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${userData.username}`);
    }

    // Create recipes
    for (const recipeData of seedRecipes) {
      const user = createdUsers.find(u => u.email === recipeData.userEmail);
      if (user) {
        const recipe = new Recipe({
          ...recipeData,
          authorId: user._id,
        });
        await recipe.save();
        console.log(`🍽️  Created recipe: ${recipeData.title}`);
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${seedRecipes.length} recipes`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}