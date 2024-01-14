const isLogin = async(req,res,next)=>{
    try{
        if(req.session.admin_id){
            
            next()
        }else{
            res.redirect('/admin/login')
        }
        
    }catch(error){
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }else{
            next()
        }
        
    }catch(error){
        console.log(error.message)
    }
}
// const addtocart = async (req, res) => {
//     try {
//         const cart = await Cart.findOne({ user: userId });
  
//         const product = await Cart.findOne({ user: userId }).populate(
//           "items.product"
//         );
//         let total = 0;
//       const productId = req.params.id;
//       const userId = req.session.user_id;
//       const productstock = await Product.findOne({ _id: productId });

//       if (productstock) {
//         console.log("🙌🙌🙌", productstock.stock);
      
//         if (productstock.stock > 0) {
//           await Product.updateOne(
//             { _id: productId },
//             { $inc: { stock: -1 } }
//           );
//           await productstock.save();
          
//       if (product) {
//         const subtotals = product.items.map((item) => {
//           return {
//             productId: item.product._id,
//             subtotal: item.product.price * item.quantity,
//           };
//         });
  
//         const subtotalPrices = subtotals.map((item) => item.subtotal);
//         console.log(subtotalPrices  );
  
//         total = subtotalPrices.reduce((acc, item) => acc + item, 0);
//         console.log(total);
//       } 
  
//       if (cart) {
//         const existingCartItem = cart.items.find((item) =>
//           item.product.equals(productId)
//         );
  
//         if (existingCartItem) {
//           existingCartItem.quantity += 1;
//         } else {
//           cart.items.push({ product: productId, quantity: 1 });
//         }
  
//         cart.totalprice = total;   
  
//         await cart.save();
//       } else {
//         const newCart = new Cart({
//           user: userId,
//           items: [{ product: productId, quantity: 1 }],
//           totalprice: total,
//         });
  
//         await newCart.save();
//         res.json({ id: productId, message: 'Product added to cart successfully.' });
  
//       }
//         } else {
//           console.log("Stock is already at 0. Cannot decrement further.");
//         }
//       } 
//     } catch (error) {
//       console.log('Try catch error in ProductAddToCart 🤷‍♂️📀🤷‍♀️');
//       console.log(error.message);
//     }
//   };
  
module.exports = {
    isLogin,
    isLogout
}