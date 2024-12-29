const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Chat = require('./models/chat.js');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for MongoDB connection
let isConnected = false; // Track the connection status
async function connectDB() {
    if (!isConnected) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            isConnected = true;
            console.log("MongoDB connection successful");
        } catch (error) {
            console.error("MongoDB connection error:", error);
        }
    }
}

// Middleware
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
app.get("/", (req, res) => {
    res.send("Setup is working");
});

app.get('/chats', async (req, res) => {
    await connectDB(); // Ensure DB connection
    try {
        const chats = await Chat.find();
        res.render('index', { chats });
    } catch (err) {
        console.error("Error fetching chats:", err);
        res.status(500).send("Error fetching chats");
    }
});

app.get("/chats/new", (req, res) => {
    res.render('new');
});

app.get("/chats/:id/edit", async (req, res) => {
    await connectDB();
    const { id } = req.params;
    try {
        const chat = await Chat.findById(id);
        res.render('edit', { chat });
    } catch (err) {
        console.error("Error fetching chat:", err);
        res.status(500).send("Error fetching chat");
    }
});

app.post("/chats", async (req, res) => {
    await connectDB();
    const { from, to, msg } = req.body;
    const newChat = new Chat({ from, to, msg, created_at: new Date() });

    try {
        await newChat.save();
        console.log("Chat was saved");
        res.redirect("/chats");
    } catch (err) {
        console.error("Error saving chat:", err);
        res.status(500).send("Error saving chat");
    }
});

app.put("/chats/:id", async (req, res) => {
    await connectDB();
    const { id } = req.params;
    const { msg: newMsg } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            id,
            { msg: newMsg },
            { runValidators: true, new: true }
        );
        console.log(updatedChat);
        res.redirect("/chats");
    } catch (err) {
        console.error("Error updating chat:", err);
        res.status(500).send("Error updating chat");
    }
});

app.delete("/chats/:id", async (req, res) => {
    await connectDB();
    const { id } = req.params;

    try {
        const deleteChat = await Chat.findByIdAndDelete(id);
        console.log(deleteChat);
        res.redirect("/chats");
    } catch (err) {
        console.error("Error deleting chat:", err);
        res.status(500).send("Error deleting chat");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for Vercel
