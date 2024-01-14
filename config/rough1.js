const cartOperation = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const { productId, quantity, totalPrice } = req.body;
  
      console.log(totalPrice + "😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊");
  
      const cart = await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        {
          $set: { "items.$.quantity": quantity, totalprice: totalPrice },
        },
        { new: true }
      );
  
      const prodId = await Product.findOne({ _id: productId });
      const stock = prodId.stock;
  
      // Update the product's stock
      prodId.stock = stock - quantity;
      await prodId.save();
  
      const product = await Cart.findOne({ user: userId }).populate("items.product");
  
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });
  
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Product not found in the cart",
        });
      }
  
  
      res.json({
        success: true,
        message: "Cart updated successfully",
        subtotal: subtotals,
      });
    } catch (error) {
      console.log('Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
    }
  };

  const addtocart = async (req, res) => {
    try {
      console.log("💕💕💕💕💕💕💕💕💕💕");
      const productId = req.params.id;
      const userId = req.session.user_id;
      console.log(productId,userId);
  
      // Find the user's cart
      const cart = await Cart.findOne({ user: userId });
  
      const product = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
  
      // console.log(total_of+"❤️❤️❤️❤️❤️");
  
      let total = 0;
  
      if (product) {
        const subtotals = product.items.map((item) => {
          return {
            productId: item.product._id,
            subtotal: item.product.price * item.quantity,
          };
        });
  
        const subtotalPrices = subtotals.map((item) => item.subtotal);
        console.log(subtotalPrices  );
  
        total = subtotalPrices.reduce((acc, item) => acc + item, 0);
        console.log(total);
      } else {
        console.log("No items in the cart");
      }
  
      if (cart) {
        const existingCartItem = cart.items.find((item) =>
          item.product.equals(productId)
        );
  
        if (existingCartItem) {
          existingCartItem.quantity += 1;
        } else {
          cart.items.push({ product: productId, quantity: 1 });
        }
  
        cart.totalprice = total;
  
        await cart.save();
      } else {
        const newCart = new Cart({
          user: userId,
          items: [{ product: productId, quantity: 1 }],
          totalprice: total,
        });
  
        await newCart.save();
        res.json({ id: productId, message: 'Product added to cart successfully.' });
  
      }
  
      res.redirect("/home");
    } catch (error) {
      console.log('Try catch error in ProductAddToCart 🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
    }
  };