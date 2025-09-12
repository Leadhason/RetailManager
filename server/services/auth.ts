import jwt from "jsonwebtoken";
import { type User } from "@shared/schema";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback_secret";

export interface AuthToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  static verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
      return null;
    }
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await storage.verifyPassword(email, password);
    if (!user || !user.isActive) {
      return null;
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await storage.getUser(decoded.id);
    return user?.isActive ? user : null;
  }

  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'view_only': 1,
      'staff': 2,
      'store_manager': 3,
      'super_admin': 4
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }
}
