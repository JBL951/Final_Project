import jwt from "jsonwebtoken";
import { type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "07ecac2932dc3dd6daa060c05a854eda";

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
