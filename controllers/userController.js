// const User = require("../models/user-model");
// const bcrypt =require("bcryptjs");
// // const registrationSchema = require("../validators/auth-validator");
// const jwt = require('jsonwebtoken');

// const home = async (req,res) =>{
//     try {
//         res
//             .status(200)
//             .send("Welcome to Homepage using controller");
//     } catch (error) {
//         console.log(error);
//     }
// };
// const register = async (req,res) =>{
//     try {
//         const value = await registrationSchema.validateAsync(req.body);
//         console.log("req.body: ", req.body);
//         const {username, email, phone, password} = req.body;
//         const userExist = await User.findOne({email: email});
//         if(userExist){
//             return res.status(400).json({msg: "Email is already registered."});
//         }else{
//             // const saltRound = 10;
//             // const hash_password = await bcrypt.hash(password, saltRound);
//             const userData = await User.create({username, email, phone, password});
//             return res
//                 .status(200)
//                 .json({
//                     msg: "User Ragistration Successful.", 
//                     token: await userData.generateToken()
//                 });
//         }
//     } catch (error) {
//         const errorMessages = error.details.map((err) => {
//             return `${err.context.label} - ${err.message}`;
//           });
//         res.status(404).send({msg: "User registration failed.", errors: errorMessages});
//     }
// };


// const login = async (req,res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ error: "Email and password are required" });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ error: "User not found" });
//         }

//         if (!user.password || typeof user.password !== "string") {
//             return res.status(500).json({ error: "Invalid stored password format" });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ error: "Invalid credentials" });
//         }

//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

//         res.status(200).json({ message: "Login successful", token });
//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
    
// };
// module.exports = {home, register, login};

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const registrationSchema = require("../validators/auth-validator");

const home = async (req, res) => {
    try {
        res.status(200).send("Welcome to Homepage using controller");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 🔹 Register New User
const register = async (req, res) => {
    try {
        // Validate request data
        const value = await registrationSchema.validateAsync(req.body);

        const { name, email, password, address } = req.body;

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ msg: "Email is already registered." });
        }

        // Create new user
        const user = new User({ name, email, password, address });
        await user.save();

        // Generate JWT token
        const token = user.generateToken();

        return res.status(201).json({
            msg: "User Registration Successful.",
            token,
        });
    } catch (error) {
        console.error(error);

        if (error.isJoi) {
            const errorMessages = error.details.map((err) => `${err.context.label} - ${err.message}`);
            return res.status(400).json({ msg: "Validation Failed", errors: errorMessages });
        }

        res.status(500).json({ msg: "User registration failed.", error: error.message });
    }
};

// 🔑 User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // Compare password
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(401).json({ msg: "Invalid Credentials" });
        }

        // Generate token
        const token = user.generateToken();

        return res.status(200).json({
            msg: "User Login Successful.",
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

module.exports = { home, register, login };
