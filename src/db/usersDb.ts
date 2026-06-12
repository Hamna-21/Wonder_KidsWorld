/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DB_FILE = path.join(process.cwd(), "users-database.json");
const JWT_SECRET = process.env.JWT_SECRET || "wonderkids-cosmic-secret-key-135";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "wonderkids-cosmic-refresh-token-987";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Opted out in returned json
  avatar: string;
  role: "Parent" | "Child" | "Admin";
  ageGroup: "3-5" | "6-8" | "9-12" | "";
  createdAt: string;
}

// Memory cache of refresh tokens to support easy revoke/auto-logout on expiration
const activeRefreshTokens = new Set<string>();

// Rate limiting in-memory map
const requestCountMap = new Map<string, { count: number; lastReset: number }>();

export function getRateLimiter(maxRequests: number = 60, windowMs: number = 60000) {
  return (req: any, res: any, next: any) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
    const now = Date.now();
    
    let rate = requestCountMap.get(ip);
    if (!rate || (now - rate.lastReset > windowMs)) {
      rate = { count: 1, lastReset: now };
      requestCountMap.set(ip, rate);
      return next();
    }
    
    rate.count++;
    if (rate.count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests to WonderKids Auth, please wait a minute!"
      });
    }
    
    next();
  };
}

export function loadUsers(): User[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Seed initial users if database is blank
      const salt = bcrypt.genSaltSync(10);
      const seedUsers: User[] = [
        {
          id: "u-parent-1",
          name: "Hamna Mushtaq",
          email: "parent@wonderkids.com",
          password: bcrypt.hashSync("password123", salt),
          avatar: "🐰",
          role: "Parent",
          ageGroup: "",
          createdAt: new Date().toISOString()
        },
        {
          id: "u-child-1",
          name: "Hamna",
          email: "child@wonderkids.com",
          password: bcrypt.hashSync("password123", salt),
          avatar: "🦁",
          role: "Child",
          ageGroup: "6-8",
          createdAt: new Date().toISOString()
        },
        {
          id: "u-admin-1",
          name: "Super Admin",
          email: "admin@wonderkids.com",
          password: bcrypt.hashSync("password123", salt),
          avatar: "🧙‍♂️",
          role: "Admin",
          ageGroup: "",
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(seedUsers, null, 2), "utf8");
      return seedUsers;
    }
    
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.error("Failed to read user database, fallback to empty array:", err);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save user database to filesystem:", err);
  }
}

export function generateTokens(user: User) {
  // Access Token expires in 15 minutes
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, ageGroup: user.ageGroup },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Refresh Token expires in 7 days
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  activeRefreshTokens.add(refreshToken);

  return { accessToken, refreshToken };
}

export function registerRefreshToken(token: string) {
  activeRefreshTokens.add(token);
}

export function revokeRefreshToken(token: string) {
  activeRefreshTokens.delete(token);
}

export function isValidRefreshToken(token: string): boolean {
  return activeRefreshTokens.has(token);
}

// Middleware to verify ACCESS JWT tokens for security
export function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Magical token is missing!" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.user = verified;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Magical ticket expired! Please refresh session.", expired: true });
    }
    return res.status(403).json({ error: "Invalid token. Security fairy blocks access!" });
  }
}
