// models/Product.js
const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [String],
    // createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);