const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // to populate product details

// ✅ Debug log middleware
router.use((req, res, next) => {
  console.log("🛒 Cart route hit:", req.method, req.originalUrl);
  next();
});

// 🔹 GET cart for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📦 Fetching cart for:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(200).json({ userId, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// 🔹 POST: Add product to cart
router.post('/add/:userId', async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.userId;

  console.log("➕ Adding to cart:", { userId, productId, quantity });

  // Validate input
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid userId or productId format' });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("🛍️ No existing cart. Creating new cart.");
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      console.log("📦 Product already in cart, increasing quantity");
      cart.items[itemIndex].quantity += quantity;
    } else {
      console.log("🆕 New product added to cart");
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('❌ Error in add-to-cart:', error);
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
});

// 🔹 PUT: Update quantity of a cart item
router.put('/update', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// 🔹 DELETE: Remove product from cart
router.delete('/remove/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    const populatedCart = await cart.populate('items.productId');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Cart = require('../models/Cart');
// const Product = require('../models/Product'); // to populate product details

// // 🔹 GET cart for a specific user
// router.use((req, res, next) => {
//   console.log("Cart route hit:", req.method, req.originalUrl);
//   next();
// });

// router.get('/:userId', async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');

//     if (!cart) {
//       return res.status(200).json({ userId: req.params.userId, items: [] });
//     }

//     res.status(200).json(cart);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
//   }
// });

// // 🔹 POST: Add product to cart
// router.post('/add/:userId', async (req, res) => {
//   const {productId, quantity } = req.body;
//   const userId = req.params.userId;

//   if (!userId || !productId || !quantity) {
//     return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
//   }

//   try {
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }

//     const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

//     if (itemIndex > -1) {
//       cart.items[itemIndex].quantity += quantity;
//     } else {
//       cart.items.push({ productId, quantity });
//     }

//     await cart.save();
//     const populatedCart = await cart.populate('items.productId');
//     res.status(200).json(populatedCart);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to add to cart', error: error.message });
//   }
// });

// // 🔹 PUT: Update quantity of a cart item
// router.put('/update', async (req, res) => {
//   const { userId, productId, quantity } = req.body;

//   if (!userId || !productId || !quantity) {
//     return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
//   }

//   try {
//     const cart = await Cart.findOne({ userId });

//     if (!cart) return res.status(404).json({ message: 'Cart not found' });

//     const item = cart.items.find(item => item.productId.toString() === productId);
//     if (!item) return res.status(404).json({ message: 'Product not in cart' });

//     item.quantity = quantity;
//     await cart.save();

//     const populatedCart = await cart.populate('items.productId');
//     res.status(200).json(populatedCart);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update cart', error: error.message });
//   }
// });

// // 🔹 DELETE: Remove product from cart
// router.delete('/remove/:userId/:productId', async (req, res) => {
//   const { userId, productId } = req.params;

//   try {
//     const cart = await Cart.findOne({ userId });

//     if (!cart) return res.status(404).json({ message: 'Cart not found' });

//     cart.items = cart.items.filter(item => item.productId.toString() !== productId);
//     await cart.save();

//     const populatedCart = await cart.populate('items.productId');
//     res.status(200).json(populatedCart);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
//   }
// });

// module.exports = router;

