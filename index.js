const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Chat = require('./models/chat.js');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB Connection
const dburl = process.env.MONGO_URI;
async function connectDB() {
    try {
        await mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit process if DB connection fails
    }
}

// Connect to DB before starting the server
connectDB();

// Middleware
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// Export the app (for serverless deployment)
module.exports = app;
// Routes
app.get("/", (req, res) => {
    res.send("Setup is working");
});

app.get('/chats', async (req, res) => {
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
    const { id } = req.params;
    try {
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).send("Chat not found");
        }
        res.render('edit', { chat });
    } catch (err) {
        console.error("Error fetching chat:", err);
        res.status(500).send("Error fetching chat");
    }
});

app.post("/chats", async (req, res) => {
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
    const { id } = req.params;
    const { msg: newMsg } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            id,
            { msg: newMsg },
            { runValidators: true, new: true }
        );
        if (!updatedChat) {
            return res.status(404).send("Chat not found");
        }
        console.log("Chat updated:", updatedChat);
        res.redirect("/chats");
    } catch (err) {
        console.error("Error updating chat:", err);
        res.status(500).send("Error updating chat");
    }
});

app.delete("/chats/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedChat = await Chat.findByIdAndDelete(id);
        if (!deletedChat) {
            return res.status(404).send("Chat not found");
        }
        console.log("Chat deleted:", deletedChat);
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
