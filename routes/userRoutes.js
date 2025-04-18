const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Register User
// 🔹 Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        // ❌ DO NOT hash password here — Schema will do it!
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generate token
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        res.status(201).json({ message: "User registered successfully", token, user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user. " + error.message });
    }
});


// 🔑 User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        res.json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ error: "Login failed. " + error.message });
    }
});

// 🔍 Get all users (Admin Only)
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// 🆕 ✅ Get Current User (`/me` Route)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password from response
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

// 🔍 Get User Profile (Self-access only)
router.get("/profile", authMiddleware, async (req, res) => {
    res.json(req.user);
});

// 🆔 Get user by ID (Admin Only)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// ✏️ Update user (User can update self, Admin can update any)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.id.toString() !== req.params.id) {
            return res.status(403).json({ error: "Unauthorized." });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: "Failed to update user." });
    }
});

// ❌ Delete user (Admin Only)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

module.exports = router;
