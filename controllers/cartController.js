const Product = require('../models/productModel')
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const Offer = require('../models/offerModel')
const getTotalCount = async function (id) {
  try {
    const user = await User.findById({ _id: id });
    if (user.cart) {
      const cart = user.cart;
      const count = cart.reduce((count, item) => count + item.qty, 0);
      return count;
    } else return 0;
  } catch (error) {
    throw new Error('error while calculating net total price');
  }
};
const getTotalSum = async function (id) {
  try {
    const userData = await User.findById({ _id: id });
    if (userData.cart) {
      const cart = userData.cart;
      const sum = cart.reduce((sum, item) => sum + item.total_price, 0);
      return sum;
    } else return 0;
  } catch (error) {
    console.error(error.message);
    throw new Error('error while calculating net total price of cart item');
  }
};
const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
    return categories;
  } catch (error) {
    throw new Error('Could not find categories');
  }
};
const cart = async (req, res) => {
  try {
    const offers = await Offer.find({})
    console.log(offers);
    const user = req.session.user_id;
    const product = await Product.find({})
    const cart = await Cart.findOne({ user: user }).populate(
      "items.product"
    );
    const headCategory = await getCategory();

    res.render("cart", {product,offers, cart ,message: req.session.message });
  } catch (error) {
    console.log('Try catch error in CartPage 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};


const addtocart = async (req, res) => {
  try {
    console.log("addtocart");
    const productId = req.params.id;
    const userId = req.session.user_id;
    const cart = await Cart.findOne({ user: userId });

    const product = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    let total = 0;

    const productstock = await Product.findOne({ _id: productId });

    if (productstock) {
      console.log("🙌🙌🙌", productstock.stock);

      if (productstock.stock > 0) {
        await Product.updateOne(
          { _id: productId },
          { $inc: { stock: -1 } }
        );
        await productstock.save();

        if (product) {
          const subtotals = product.items.map((item) => {
            return {
              productId: item.product._id,
              subtotal: item.product.price * item.quantity,
            };
          });


          const subtotalPrices = subtotals.map((item) => item.subtotal);
          console.log(subtotalPrices);

          total = subtotalPrices.reduce((acc, item) => acc + item, 0);
          console.log(total);
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
          // res.redirect('/')


        } else {
          const newCart = new Cart({
            user: userId,
            items: [{ product: productId, quantity: 1 }],
            totalprice: total,
          });

          await newCart.save();

        }

      } else {
        console.log("Stock is already at 0. Cannot decrement further.");
        

      }
    }
  } catch (error) {
    console.log('Try catch error in ProductAddToCart 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};


const cartOperation = async (req, res) => {
  try {
    const offer = await Offer.find({})
    const userId = req.session.user_id;
    const { productId, quantity, totalPrice, dosomething } = req.body;
    
    const dosomethingvalue = dosomething === 'true';//syntax for bool
    
    console.log( dosomethingvalue, "😒value");
    
    const productstock = await Product.findOne({ _id: productId });
    
    if (productstock) {
      const stockChange = dosomethingvalue ? 1 : -1;//ternary
      if (productstock.stock > 0) {
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: stockChange } }
      );
      console.log(`😜 ${dosomethingvalue ? 'Decreased' : 'Increased'} stock by ${Math.abs(stockChange)}`);
      const cart = await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        {
          $set: { "items.$.quantity": quantity, totalprice: totalPrice },
        },
        { new: true }
      );
  
      const product = await Cart.findOne({ user: userId }).populate("items.product");
      
      // const subtotals = product.items.map((item) => {
      //   return {
      //     productId: item.product._id,
      //     subtotal: item.product.price * item.quantity,
      //   };
      // });
      const subtotals = product.items.map((item) => {
        const productOffer = offer.find(offer => offer.category.equals(item.product.category));
      
        return {
          productId: item.product._id,
          subtotal: productOffer
            ? (item.product.price - (item.product.price * productOffer.percentage / 100)) * item.quantity
            : item.product.price * item.quantity,
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
    }else{
      console.log("product stock less than 0");
    }
  }
  } catch (error) {
    console.log('Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};





// const extractcheckoutpage = async (req, res) => {
//   try {
//     const userId = req.session.user_id
//     const addressSchema = await Address.findOne({ userId: userId })
//     if (!addressSchema) {

//       const newAddress = new Address({
//         userId: userId,
//         address: [{
//           firstName: req.body.firstname,
//           lastName: req.body.secondname,
//           landmark: req.body.landmark,
//           addressDetail: req.body.address,
//           state: req.body.state,
//           zip: req.body.zip,
//           phone: req.body.mobile
//         }]
//       });
//       await newAddress.save();
//     } else {
//       const addAddress = {
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         landmark: req.body.landmark,
//         addressDetail: req.body.addressDetail,
//         state: req.body.state,
//         zip: req.body.zip,
//         phone: req.body.phone,
//       };
//       addressSchema.address.push(addAddress);
//       await addressSchema.save();

//     }
//   } catch (error) {
//     console.error('Error saving Address:', error);
//     // Handle the error as needed
//   }
// }

const checkoutpage = async (req, res) => {
  try {
    const offers = await Offer.find({})
    const address = await Address.findOne({ userId: req.session.user_id })
    const cart = await Cart.findOne({ user: req.session.user_id }).populate('items.product')
    const wallet = await Wallet.findOne({ user_id: req.session.user_id })
    console.log("❤️👌",address);
    res.render('checkout', { address, cart: cart, wallet , offers})
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addtocart,
  cart,


  cartOperation,
  checkoutpage,


}