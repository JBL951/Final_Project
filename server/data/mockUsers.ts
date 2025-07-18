import { type User } from "@shared/schema";
import bcrypt from "bcrypt";

// Pre-hashed passwords for demo (password123)
const hashedPassword = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

export const mockUsers: Omit<User, "id">[] = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: hashedPassword,
    createdAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    username: "sarah_johnson",
    email: "sarah@example.com",
    password: hashedPassword,
    createdAt: new Date("2024-01-20T14:15:00Z"),
  },
  {
    username: "mike_chen",
    email: "mike@example.com",
    password: hashedPassword,
    createdAt: new Date("2024-01-25T09:45:00Z"),
  },
  {
    username: "emma_davis",
    email: "emma@example.com",
    password: hashedPassword,
    createdAt: new Date("2024-02-01T16:20:00Z"),
  },
  {
    username: "gordon_ramsay",
    email: "gordon@example.com",
    password: hashedPassword,
    createdAt: new Date("2024-02-05T11:10:00Z"),
  },
];
