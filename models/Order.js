// models/Order.js
const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);


// const mongoose = require('mongoose');
// const OrderSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     products: [{
//         product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//         quantity: Number
//     }],
//     totalAmount: Number,
//     status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Order', OrderSchema);