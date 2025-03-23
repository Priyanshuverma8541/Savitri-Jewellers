
// models/Cart.js
const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 }
    }]
});


// const mongoose = require('mongoose');
// const CartSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     items: [{
//         product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//         quantity: Number
//     }]
// });

// module.exports = mongoose.model('Cart', CartSchema);