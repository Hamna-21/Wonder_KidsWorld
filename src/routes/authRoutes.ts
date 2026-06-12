/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
  loadUsers, 
  saveUsers, 
  generateTokens, 
  isValidRefreshToken, 
  revokeRefreshToken, 
  registerRefreshToken,
  authenticateJWT,
  getRateLimiter,
  User 
} from "../db/usersDb";

const router = express.Router();

// Apply auth rate limiter to prevent brute force attacks (max 30 auth attempts per IP per minute)
const authLimiter = getRateLimiter(30, 60000);

/**
 * @route POST /api/auth/register
 * @desc Register parent and child profile
 */
router.post("/register", authLimiter, (req, res) => {
  try {
    const { parentName, childNickname, email, password, confirmPassword, ageGroup } = req.body;

    // Input Validation
    if (!parentName || !childNickname || !email || !password || !confirmPassword || !ageGroup) {
      return res.status(400).json({ error: "Please fill in all magical puzzle fields!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Oops! Passwords do not match like twins." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Magic password must have at least 6 stars (characters)!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please write a real email to keep account safe!" });
    }

    const users = loadUsers();
    
    // Check if email already exists
    const duplicate = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: "Email is already claimed by another explorer!" });
    }

    // Hash password with secure bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create primary Parent user
    const parentId = `u-parent-${Date.now()}`;
    const newParent: User = {
      id: parentId,
      name: parentName,
      email: email,
      password: hashedPassword,
      avatar: "🦊", // Default guide mascot avatar
      role: "Parent",
      ageGroup: "",
      createdAt: new Date().toISOString()
    };

    // Create linked Child user associated with the email
    const childId = `u-child-${Date.now()}`;
    const newChild: User = {
      id: childId,
      name: childNickname,
      email: `child_${email}`, // unique internal email linking
      password: hashedPassword, // child can login with same or simply through parent
      avatar: "🦁",
      role: "Child",
      ageGroup: ageGroup as any,
      createdAt: new Date().toISOString()
    };

    users.push(newParent, newChild);
    saveUsers(users);

    // Generate tokens for Parent
    const { accessToken, refreshToken } = generateTokens(newParent);

    res.status(201).json({
      message: "Yippee! Profile registered successfully!",
      accessToken,
      refreshToken,
      user: {
        id: newParent.id,
        name: newParent.name,
        email: newParent.email,
        role: newParent.role,
        avatar: newParent.avatar,
        childProfile: {
          id: newChild.id,
          name: newChild.name,
          ageGroup: newChild.ageGroup,
          avatar: newChild.avatar
        }
      }
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration helper got stuck. Let's try again!" });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate Parent or Child user & return tokens
 */
router.post("/login", authLimiter, (req, res) => {
  try {
    const { email, password, role = "Parent" } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter your email and password key!" });
    }

    const users = loadUsers();
    
    // Find matching user (allow standard email or matched child linked internal email)
    const targetEmail = role === "Child" && !email.startsWith("child_") && email.includes("@") 
      ? `child_${email}` 
      : email;

    const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    
    if (!user || !user.password) {
      return res.status(400).json({ error: "Incorrect email or password, explorer!" });
    }

    // Verify Password
    const isMatched = bcrypt.compareSync(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ error: "Incorrect email or password, explorer!" });
    }

    // Fetch linked kid profile if login is parent
    let childProfile = null;
    if (user.role === "Parent") {
      const child = users.find(u => u.email === `child_${user.email}`);
      if (child) {
        childProfile = {
          id: child.id,
          name: child.name,
          ageGroup: child.ageGroup,
          avatar: child.avatar
        };
      }
    }

    // Generate response tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: `Welcome back, ${user.name}! Let's enter the gate!`,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ageGroup: user.ageGroup,
        childProfile
      }
    });

  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login system caught in a small cloud. Try again!" });
  }
});

/**
 * @route POST /api/auth/google
 * @desc Playful Google Sign-In secure API Simulator
 */
router.post("/google", authLimiter, (req, res) => {
  try {
    const { googleEmail, name, imageUrl } = req.body;

    if (!googleEmail || !name) {
      return res.status(400).json({ error: "Missing magical Google sign details!" });
    }

    const users = loadUsers();
    let user = users.find(u => u.email.toLowerCase() === googleEmail.toLowerCase());

    if (!user) {
      // Create registered user if they don't exist yet
      user = {
        id: `u-g-${Date.now()}`,
        name: name,
        email: googleEmail,
        avatar: "⭐",
        role: "Parent",
        ageGroup: "",
        createdAt: new Date().toISOString()
      };
      
      // Seed a child default profile linked to Google user
      const child: User = {
        id: `u-child-${Date.now()}`,
        name: `${name}'s Kid`,
        email: `child_${googleEmail}`,
        avatar: "🐨",
        role: "Child",
        ageGroup: "6-8",
        createdAt: new Date().toISOString()
      };

      users.push(user, child);
      saveUsers(users);
    }

    // Get child profile
    const child = users.find(u => u.email === `child_${user!.email}`);

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: "Google flight landed successfully! Welcome explorer!",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        childProfile: child ? {
          id: child.id,
          name: child.name,
          ageGroup: child.ageGroup,
          avatar: child.avatar
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Google ticket booth is out of energy!" });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Exchange valid refresh token for a brand new access token
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is empty, please sign in!" });
  }

  if (!isValidRefreshToken(refreshToken)) {
    return res.status(403).json({ error: "Refresh ticket has been revoked or expired! Please login." });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "wonderkids-cosmic-refresh-token-987") as any;
    
    const users = loadUsers();
    const user = users.find(u => u.id === payload.id);

    if (!user) {
      return res.status(404).json({ error: "Explorer profile not found." });
    }

    const { accessToken } = generateTokens(user);
    res.json({ accessToken });

  } catch (err) {
    return res.status(403).json({ error: "Session expired or invalid! Security gate closed." });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Revoke session tokens safely
 */
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  res.json({ status: "success", message: "Logged out from Cosmic Station!" });
});

/**
 * @route GET /api/auth/me
 * @desc Returns current active user configuration
 */
router.get("/me", authenticateJWT, (req: any, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: "Profile vanished in thin air!" });
  }

  // Find linked profile
  const linkedChild = users.find(u => u.email === `child_${user.email}`);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      ageGroup: user.ageGroup,
      childProfile: linkedChild ? {
        id: linkedChild.id,
        name: linkedChild.name,
        ageGroup: linkedChild.ageGroup,
        avatar: linkedChild.avatar
      } : null
    }
  });
});

/**
 * @route POST /api/auth/update-profile
 * @desc Update user or linked child settings
 */
router.post("/update-profile", authenticateJWT, (req: any, res) => {
  try {
    const { name, avatar, ageGroup, childAvatar, childName } = req.body;
    const users = loadUsers();
    
    const parentIndex = users.findIndex(u => u.id === req.user.id);
    if (parentIndex === -1) {
      return res.status(404).json({ error: "Profile not found!" });
    }

    if (name) users[parentIndex].name = name;
    if (avatar) users[parentIndex].avatar = avatar;

    // Update child profile if supplied
    const childIndex = users.findIndex(u => u.email === `child_${users[parentIndex].email}`);
    if (childIndex !== -1) {
      if (childName) users[childIndex].name = childName;
      if (childAvatar) users[childIndex].avatar = childAvatar;
      if (ageGroup) users[childIndex].ageGroup = ageGroup;
    }

    saveUsers(users);
    res.json({ 
      message: "Profile updated like a shiny star!", 
      user: {
        id: users[parentIndex].id,
        name: users[parentIndex].name,
        email: users[parentIndex].email,
        role: users[parentIndex].role,
        avatar: users[parentIndex].avatar,
        childProfile: childIndex !== -1 ? {
          id: users[childIndex].id,
          name: users[childIndex].name,
          ageGroup: users[childIndex].ageGroup,
          avatar: users[childIndex].avatar
        } : null
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Could not update values." });
  }
});

export default router;
