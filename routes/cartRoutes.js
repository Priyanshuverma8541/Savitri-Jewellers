const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Get all cart items for a user
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
});

// Add item to cart
router.post('/', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }
        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ error: "Failed to add item to cart" });
    }
});

// Update cart item quantity
router.put('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
                await cart.save();
                return res.json(cart);
            }
        }
        res.status(404).json({ error: "Cart item not found" });
    } catch (error) {
        res.status(400).json({ error: "Failed to update cart item" });
    }
});

// Remove item from cart
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            return res.json({ message: "Cart item removed" });
        }
        res.status(404).json({ error: "Cart item not found" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove cart item" });
    }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Cart = require('../models/Cart');

// // Get all cart items
// router.get('/:userId', async (req, res) => {
//         try {
//             const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
//             res.json(cart ? cart.items : []);
//         } catch (error) {
//             res.status(500).json({ error: "Failed to fetch cart items" });
//         }
// });

// // Add item to cart
// router.post('/', async (req, res) => {
//     try {
//         const newCartItem = new Cart(req.body);
//         await newCartItem.save();
//         res.status(201).json(newCartItem);
//     } catch (error) {
//         res.status(400).json({ error: "Failed to add item to cart" });
//     }
// });

// // Update cart item
// router.put('/:id', async (req, res) => {
//     try {
//         const updatedCartItem = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json(updatedCartItem);
//     } catch (error) {
//         res.status(400).json({ error: "Failed to update cart item" });
//     }
// });

// // Remove item from cart
// router.delete('/:id', async (req, res) => {
//     try {
//         await Cart.findByIdAndDelete(req.params.id);
//         res.json({ message: "Cart item removed" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to remove cart item" });
//     }
// });

// module.exports = router;
