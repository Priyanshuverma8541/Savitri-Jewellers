// Main file to start the server and connect to MongoDB
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const cors = require("cors");
const connectCloudinary = require("./config/cloudinary");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");

// Load environment variables
dotenv.config();

const app = express(); // ✅ Declare app FIRST
const PORT = process.env.PORT || 8080;

// ✅ CORS Configuration (Allow Frontend Access)
app.use(cors({
    origin: "https://savitri-jewellers-frontend.onrender.com", // ✅ Allow frontend requests
    // origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors()); // ✅ Handle preflight requests

// ✅ MongoDB Connection
const dburl = process.env.MONGO_URI;
mongoose.set("strictQuery", false);

async function connectDB() {
    try {
        await mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

// ✅ Middleware Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ✅ Connect to Database and Cloudinary
connectDB();
connectCloudinary();

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/carts", require("./routes/cartRoutes"));
app.use("/api/payment", paymentRoutes);

// ✅ Handle Unknown Routes (404)
app.use((req, res) => {
    res.status(404).json({ message: "❌ API route not found" });
});

// ✅ Start the Server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// ✅ Graceful Shutdown Handling
const shutdown = async () => {
    console.log("🛑 Server shutting down...");
    await mongoose.disconnect();
    server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (err) => {
    console.error("⚠️ Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("⚠️ Unhandled Rejection:", err);
    process.exit(1);
});

