
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");


// 🏠 Home Route
const home = async (req, res) => {
    try {
        res.status(200).json({ message: "Welcome to the Jewelry E-Commerce API!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 🔹 Register a New User
const register = async (req, res) => {
    try {
        // Validate input data
        const value = await registrationSchema.validateAsync(req.body);

        const { name, email, password, address, role } = req.body;

        // Check if the user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // Create new user
        const user = new User({ name, email, password, address, role: role || "customer" });
        await user.save();

        // Generate JWT token
        const token = user.generateToken();

        return res.status(201).json({
            message: "User Registration Successful.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);

        if (error.isJoi) {
            return res.status(400).json({ error: "Validation Failed", details: error.details.map(err => err.message) });
        }

        res.status(500).json({ error: "User registration failed." });
    }
};

// 🔑 User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Compare hashed passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate JWT Token
        const token = user.generateToken();

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// 👤 Get User Profile (Protected)
const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve user profile." });
    }
};

// 🔍 Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
};

// 🔍 Get User by ID (Admin Only)
const getUserById = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied." });
        }

        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user." });
    }
};

// ✏️ Update User (Protected)
const updateUser = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: "Unauthorized." });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Failed to update user." });
    }
};

// ❌ Delete User (Admin Only)
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete user." });
    }
};

module.exports = { home, register, login, getProfile, getAllUsers, getUserById, updateUser, deleteUser };
