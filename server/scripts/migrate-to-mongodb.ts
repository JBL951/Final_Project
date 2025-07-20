import { MongoStorage } from '../storage/mongodb';
import { mockUsers } from '../data/mockUsers';
import { mockRecipes } from '../data/mockRecipes';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.DATABASE_URL;
if (!mongoUri) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function migrate() {
  console.log('Starting migration to MongoDB...');
  const storage = new MongoStorage(mongoUri as string);
  
  try {
    // Connect to MongoDB
    await storage.connect();
    console.log('Connected to MongoDB successfully');
    console.log('Migrating users...');
    for (const user of mockUsers) {
      try {
        await storage.createUser(user);
        console.log(`✓ Migrated user: ${user.email}`);
      } catch (error) {
        console.error(`✗ Error migrating user ${user.email}:`, error);
      }
    }
    
    // Migrate recipes
    console.log('\nMigrating recipes...');
    for (const recipe of mockRecipes) {
      try {
        await storage.createRecipe(recipe);
        console.log(`✓ Migrated recipe: ${recipe.title}`);
      } catch (error) {
        console.error(`✗ Error migrating recipe ${recipe.title}:`, error);
      }
    }
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await storage.disconnect();
    process.exit(0);
  }
}

migrate();
