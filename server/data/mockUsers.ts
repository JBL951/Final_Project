import { type InsertUser } from "@shared/schema";
import bcrypt from "bcrypt";

// Pre-hashed passwords for demo (password123)
const hashedPassword = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

export const mockUsers: InsertUser[] = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: hashedPassword
  },
  {
    username: "sarah_johnson",
    email: "sarah@example.com",
    password: hashedPassword
  },
  {
    username: "mike_smith",
    email: "mike@example.com",
    password: hashedPassword
  },
  {
    username: "emma_wilson",
    email: "emma@example.com",
    password: hashedPassword
  },
  {
    username: "gordon_chef",
    email: "gordon@example.com",
    password: hashedPassword
  }
];
