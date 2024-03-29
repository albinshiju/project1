const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Orders = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Offer = require('../models/offerModel')
const Return = require('../models/returnModel')
const Banner = require('../models/bannersModel')

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const rstde = require('randomstring')
const otpStorage = {};
const config = require('../config/config')
const Wallet = require('../models/walletModel')
const WalletHistory = require('../models/walletHistoryModel')
const Decimal = require('decimal.js');

// invoicePdf()
function generateOTP() {
  const digits = '0123456789';
  let OTP = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * 10);
    OTP += digits[randomIndex];
  }

  return OTP;
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}

const insertUser = async (req, res) => {
  try {
    const id = req.session.user_id;
    const name = req.body.name;
    const username = req.body.usernamecode;
    const referalcode = req.body.referalcode;
    const email = req.body.email;
    const mobile = req.body.mno;
    const image = req.file.filename;
    const password = req.body.password;

    const minLength = 8; // Minimum length
    const hasUppercase = /[A-Z]/.test(password); // At least one uppercase letter
    const hasLowercase = /[a-z]/.test(password); // At least one lowercase letter
    const hasDigit = /\d/.test(password); // At least one digit
    const hasSpecialChar = /[!@#$%^&*]/.test(password); // At least one special character

    if (password.length < minLength) {
      return res.status(400).send('Password must be at least 8 characters long');
    } else if (!hasUppercase) {
      return res.status(400).send('Password must contain at least one uppercase letter');
    } else if (!hasLowercase) {
      return res.status(400).send('Password must contain at least one lowercase letter');
    } else if (!hasDigit) {
      return res.status(400).send('Password must contain at least one digit');
    } else if (!hasSpecialChar) {
      return res.status(400).send('Password must contain at least one special character');
    }
    
    const alreadyexistingemail = await User.findOne({email:req.body.email})
    if(alreadyexistingemail){
      return res.send(data = 1);
      
    }
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name,
      username,
      email,
      mobile,
      image,
      referalcode,
      password: spassword,
    });

    const userData = await user.save();

    if (userData) {
      const otp = generateOTP();
      otpStorage[email] = otp;
      await sendVerifyMail(email, otp);

      const refereduser = await User.findOne({ username: referalcode });
      if (refereduser) {
        await creditmoneyonreferal(refereduser.username, refereduser._id);
      }

      res.status(200).send('Registration successful');
    } else {
      res.status(500).send('Your registration has been failed');
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal server error');
  }
};

const loginLoad = async (req, res) => {
  try {

    res.render('login', { message: req.session.message });
  } catch (error) {
    console.log(error.message);
  }
};


const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    console.log('Email from request:', email);
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.if_varified === 0) {

          req.session.message = 'Please verify your mail';
          console.log(req.session.message);
          res.redirect('/login');


        } else if (userData.is_blocked === 0) {
          console.log(password);
          console.log(userData.password);
          req.session.user_id = userData._id;
          req.session.save();
          res.redirect('/home');
        } else {
          req.session.message = 'This user is blocked';
          res.redirect('/login');
        }
      } else {
        req.session.message = 'Email and password are incorrect';
        res.redirect('/login');
      }
    } else {
      req.session.message = "Email doesn't exist";
      res.redirect('/login');
    }
  } catch (error) {
    console.log("error in VerifyLogin");
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('registration');
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    const user = req.session.user_id;
    const banner = await Banner.find({})
    const cart = await Cart.findOne({ user: user })
    const userData = await User.findById({ _id: req.session.user_id });
    const productData = await Product.find({ is_deleted: 0 });
    // console.log(productData[1].stock,"😂productdta.stock");
    res.render('home1', { user: userData, products: productData, cart, message: req.session.message, banner });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    if (req.session.user_id) {
      delete req.session.user_id;
      console.log('user_id destroyed');
    }

    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};


const verifyMail = async (req, res) => {
  try {
    const updatedInfo = User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
    console.log(updatedInfo);
    res.render('email-verified');
  } catch (error) {
    console.log(error.message);
  }
};

const sendVerifyMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: 'albinshiju628@gmail.com',
      to: email,
      subject: 'Verification Mail',
      html: `<p>Hi, your OTP is: ${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log('Email has been sent', info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
};
const verificationLoad = async (req, res) => {
  try {
    res.render('otp');
  } catch (error) {
    console.log(error.message);
  }
};
const sentVerificationLink = async (req, res) => {
  try {

    res.render('otp', {
      message: 'OTP sent to your email address, please check your email',
    });
  } catch (error) {
    console.error(error.message);
    res.render('otp', { message: 'An error occurred while sending the email' });
  }
};

const verifyOTP = async (req, res) => {
  try {

    const email = req.body.email;
    const userEnteredOTP = req.body.otp;

    if (!otpStorage[email]) {
      res.render('otp', { message: 'Invalid user or OTP' });
      return;
    }

    const storedOTP = otpStorage[email];

    if (userEnteredOTP === storedOTP) {
      delete otpStorage[email];
      const user = await User.findOne({ email });
      if (user) {
        user.if_varified = 1;
        await user.save();
        res.redirect('/');
      } else {
        res.render('otp', { message: 'User not found' });
      }
    } else {
      res.render('otp', { message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.error('verify otp controller: ' + error.message);
    res.render('otp', { message: 'An error occurred while verifying the OTP' });
  }
};

const otpLoad = async (req, res) => {
  try {
    res.render('otp');
  } catch (error) {
    console.error(error.message);
  }
};


const userprofile = async (req, res) => {
  try {
    console.log(req.session.user_id + "session");
    const wallet = await Wallet.findOne({ user_id: req.session.user_id })
    console.log("wallet" + wallet);
    const addresses = await Address.find({ userId: req.session.user_id });
    const user = await User.findOne({ _id: req.session.user_id })
    return res.render('userprofile', { addresses, user, wallet });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error'); // You might want to send an error page
  }
};


const forgetpassword = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id)
    res.render('forget')
  } catch (error) {

  }
}
const extractforgetpassword = async (req, res) => {
  try {
    const email = req.body.email;

    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.if_varified === 0) {
        res.render('forget', { message: "please verify your mail" })
      } else {
        const randomstring = rstde.generate()
        const updatedData = await User.updateOne({ email: email }, { $set: { token: randomstring } })

        resetpasswordmail(userData.email, randomstring)
        res.render('forget', { message: "please check your mail to reset your password" });

      }
    } else {
      // Pass the message to the 'forget' template
      res.render('forget', { message: "User email does not exist" });
    }
  } catch (error) {
    // Handle other errors here
    console.error(error);
  }
}
const resetpasswordmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: 'albinshiju628@gmail.com',
      to: email,
      subject: 'Password Reset Mail',
      html: `<p>Hi, please click here <a href="https://speedcart.xyz/forget-password?token=${token}">Reset link</a> your password</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log('Email has been sent', info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
};
const forgetpasswordload = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token })
    if (tokenData) {
      res.render('forget-password', { user_id: tokenData._id })
    } else {
      res.render('404', { message: "token is invalid" })
    }

  } catch (error) {
    console.log(error.message);
  }
}
const resetpassword = async (req, res) => {
  try {
    const password = req.body.password;
    console.log(password);
    const user_id = req.body.user_id;

    const secure_password = await securePassword(password);

    // You should use the `await` keyword here to make sure the update completes before redirecting.
    const updatedData = await User.findByIdAndUpdate(
      user_id,
      { password: secure_password, token: '' },
      { new: true }
    );

    if (!updatedData) {
      // Handle the case when the user is not found with the specified `user_id`.
      return res.status(404).send("User not found");
    }

    // Redirect to the desired page or send a success response.
    res.redirect('/');
  } catch (error) {
    // Handle errors here
    console.error(error);
    res.status(500).send("An error occurred");
  }
}
const editUserLoad = async (req, res) => {
  try {
    // const id = req.session.user_id
    // console.log(id);
    // const adminData = await User.findById({ _id: id })
    const adminData = await User.findById(req.session.user_id)
    console.log(adminData);
    if (adminData) {
      res.render('edit-user', { user: adminData })
    } else {
      res.redirect('/admin/dashboard')
    }
  } catch (error) {
    console.log(error.message)
  }

}
const updateUsers = async (req, res) => {
  try {

    await User.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } })
    res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error.message)
  }
}
const extracteditUserLoad = async (req, res) => {
  try {
    await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } })
    res.redirect('/')
  } catch (error) {
    console.log(error.message);
  }
}
const usermgt = async (req, res) => {
  res.render('addressmgt')
}
const extractusermgt = async (req, res) => {

}
const showaddress = async (req, res) => {
  res.render("showaddress")
}
const showaddress1 = async (req, res) => {
  res.render("showaddress2")
}
const saveaddress = async (req, res) => {
  try {
    const page = req.params.page;
    console.log(page);
    const userId = req.session.user_id
    const addressSchema = await Address.findOne({ userId: userId })
    if (!addressSchema) {

      const newAddress = new Address({
        userId: userId,
        address: [{
          firstName: req.body.firstname,
          lastName: req.body.secondname,
          landmark: req.body.landmark,
          addressDetail: req.body.address,
          state: req.body.state,
          zip: req.body.zip,
          phone: req.body.mobile
        }]
      });
      await newAddress.save();
    } else {
      const addAddress = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        landmark: req.body.landmark,
        addressDetail: req.body.addressDetail,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
      };
      addressSchema.address.push(addAddress);
      await addressSchema.save();

    }
    if (page === 'page1') {
      res.redirect('/cart/checkout')

    } else {
      res.redirect('/userprofile')

    }


  } catch (error) {
    console.error('Error saving Address:', error);
  }
}
const ordersummary = async (req, res) => {
  try {
    const addressIndex = req.body.selectedAddress;
    const orderTotal = req.body.orderTotal;
    const payment = req.body.payment;
    const userId = req.session.user_id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    const addressSchema = await Address.findOne({ userId: userId });

    if (!cart) {
      console.log("Cart is not available");
    }

    const index = addressSchema.address[addressIndex];

    const items = cart.items.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      prodId: item.product._id,
      image: item.product.image,
      quantity: item.quantity,
      category: item.product.category,

    }));

    const orderSave = new Orders({
      userId: userId,
      items: items,
      address: index,
      totalprice: orderTotal,
      PaymentMethod: payment,
    });

    await orderSave.save();

    const newOrder = orderSave._id;



    const order = await Orders.find({ userId: userId });

    if (orderSave.PaymentMethod === 'COD') {
      const codSuccess = true;
      res.send({ codSuccess, id: newOrder })
    } else if (orderSave.PaymentMethod === 'Razorpay') {
      console.log("raxorpay 🙌🙌🙌🙌🙌📀📀");
      res.send({ newOrderId: newOrder })

    }


  } catch (error) {
    console.log('Try catch error in checkoutAjaxAddress  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
}
const extractcheckout = async (req, res) => {
  try {
    res.send('hi')
  } catch (error) {
    console.log(error.message)
  }
}

const changepassword = async (req, res) => {
  try {
    res.render('changepassword')
  } catch (error) {
    console.log(error.message);
  }
}

const checkrazorpay = async (req, res) => {
}
// const checkaddress = async (req, res) => {
//   try {
//     const addressIndex = req.body.selectedAddress;
//     const orderTotal = req.body.orderTotal;
//     const payment = req.body.payment;
//     const userId = req.session.user_id;
//     const cart = await Cart.findOne({ user: userId }).populate("items.product");
//     const addressSchema = await Address.findOne({ userId: userId });

//     if (!cart) {
//       console.log("Cart is not available");
//       return res.status(400).send("Cart not available");
//     }

//     const index = addressSchema.address[addressIndex];

//     const items = cart.items.map((item) => ({
//       name: item.product.name,
//       price: item.product.price,
//       prodId: item.product._id,
//       image: item.product.images[0],
//       quantity: item.quantity,
//       category: item.product.category,
//       subtotal: item.quantity * item.product.price,
//     }));

//     // Fetch offers based on product categories
//     const categoryIds = items.map((item) => item.category);
//     const data = await Offer.find({ category: { $in: categoryIds } });

//     // Calculate offer price for each item
//     const itemsWithOffer = items.map((item) => {
//       const matchingOffer = data.find((offer) => offer.category.equals(item.category));
//       if (matchingOffer) {
//         // Apply offer percentage to calculate the discounted price
//         const discountedPrice = item.price - (item.price * matchingOffer.percentage / 100);
//         return {
//           ...item,
//           offerprice: discountedPrice,
//           offersubtotal: discountedPrice * item.quantity,
//         };
//       }
//       return item; // No offer for this category, keep the original price
//     });

//     const orderSave = new Orders({
//       userId: userId,
//       items: itemsWithOffer, // Use the updated items array with offer prices
//       address: index,
//       totalprice: orderTotal,
//       PaymentMethod: payment,
//       paymentStatus: 'pending', // Adjust as needed
//       deliveryStatus: 'pending', // Adjust as needed
//       orderStatus: 'pending',
//     });

//     await orderSave.save();
//     await deductFromWallet(userId, orderTotal);
//     // await Cart.findOneAndDelete({ user: userId });

//     const newOrder = orderSave._id;

//     // Handle different payment methods
//     if (orderSave.PaymentMethod === 'COD') {
//       const codSuccess = true;
//       res.send({ codSuccess, id: newOrder });
//     } else if (orderSave.PaymentMethod === 'Razorpay') {
//       const razorpaySuccess = true;
//       res.send({ razorpaySuccess, id: newOrder });
//     } else if (orderSave.PaymentMethod === 'Wallet') {
//       const wallet = await Wallet.findOne({ user_id: userId });

//       if (wallet.walletBalance === 0) {
//         res.send({ walletSuccess: false, id: newOrder });
//       } else {
//         const walletSuccess = true;
//         res.send({ walletSuccess, id: newOrder });
//       }
//     } else {
//       console.log("Error Ajax 😒😒😒😒😒😒😒😒😒😒😒😒😒😒");
//     }
//   } catch (error) {
//     console.log('Try catch error in checkoutAjaxAddress 🤷‍♂️📀🤷‍♀️');
//     console.log(error.message);
//     res.status(500).send('Internal Server Error');
//   }
// };
const checkaddress = async (req, res) => {
  try {
    const couponCode = req.body.couponCode
    console.log("❤️🥳0",req.body.couponCode);
    const addressIndex = req.body.selectedAddress;
    const orderTotal = req.body.orderTotal;
    const payment = req.body.payment;
    const userId = req.session.user_id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    const addressSchema = await Address.findOne({ userId: userId });

    if (!cart) {
      console.log("Cart is not available");
      return res.status(400).send("Cart not available");
    }

    const index = addressSchema.address[addressIndex];

    const items = cart.items.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      prodId: item.product._id,
      image: item.product.images[0],
      quantity: item.quantity,
      category: item.product.category,
      subtotal: item.quantity * item.product.price,
    }));

    // Fetch offers based on product categories
    const categoryIds = items.map((item) => item.category);
    const data = await Offer.find({ category: { $in: categoryIds } });

    // Calculate offer price for each item
    const itemsWithOffer = items.map((item) => {
      const matchingOffer = data.find((offer) => offer.category.equals(item.category));
      if (matchingOffer) {
        // Apply offer percentage to calculate the discounted price
        const discountedPrice = item.price - (item.price * matchingOffer.percentage / 100);
        return {
          ...item,
          offerprice: discountedPrice,
          offersubtotal: discountedPrice * item.quantity,
        };
      }
      return item; // No offer for this category, keep the original price
    });
    console.log(couponCode,"👌👍");
    const orderSave = new Orders({
      userId: userId,
      items: itemsWithOffer, // Use the updated items array with offer prices
      address: index,
      totalprice: orderTotal,
      PaymentMethod: payment,
      paymentStatus: 'pending', // Adjust as needed
      deliveryStatus: 'pending', // Adjust as needed
      orderStatus: 'pending',
      couponCode:couponCode
    });

    await orderSave.save();
    // await deductFromWallet(userId, orderTotal);
    // await Cart.findOneAndDelete({ user: userId });

    const newOrder = orderSave._id;

    // Handle different payment methods
    if (orderSave.PaymentMethod === 'COD') {
      const codSuccess = true;
      res.send({ codSuccess, id: newOrder });
    } else if (orderSave.PaymentMethod === 'Razorpay') {
      const razorpaySuccess = true;
      res.send({ razorpaySuccess, id: newOrder });
    } else if (orderSave.PaymentMethod === 'Wallet') {
      const wallet = await Wallet.findOne({ user_id: userId });

      if (wallet.walletBalance === 0) {
        res.send({ walletSuccess: false, id: newOrder });
      } else {
        const walletSuccess = true;
        res.send({ walletSuccess, id: newOrder });
      }
    } else {
      console.log("Error Ajax 😒😒😒😒😒😒😒😒😒😒😒😒😒😒");
    }
  } catch (error) {
    console.log('Try catch error in checkoutAjaxAddress 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};
const placeorder = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user_id;

    // Update order status to 'orderPlaced'
    const data = await Orders.findOneAndUpdate(
      { _id: id },
      { $set: { orderPlaced: true } },
      { new: true }
    );
    data.save();
    const order = await Orders.findById(id);

    if (order) {
      // If the order is found, now find the corresponding coupon
      const coupon = await Coupon.findOne({ couponCode: order.couponCode });

      if (coupon) {
        coupon.active = false
        await coupon.save()
          // Coupon found, you can use it here
          console.log('Coupon found:', coupon);
      } else {
          console.log('Coupon not found for the provided order.');
      }
    } else {
        console.log('Order not found.');
    }

    // Delete items from the user's cart
    await Cart.findOneAndDelete({ user: userId });

    // Iterate through the items in the order and update product stock
    for (const item of data.items) {
      const productId = item.prodId;
      const quantity = item.quantity;

      // Find the product using the productId
      const product = await Product.findOne({ _id: productId });

      // Update the product stock
      if (product) {
        product.stock -= quantity;
        await product.save();
      }
    }

    // Deduct the order total from the user's wallet
    const orderTotal = data.totalprice;
    await deductFromWallet(userId, orderTotal);

    // Render the place order page with order details
    res.render('placeorder', { details: data });
  } catch (error) {
    console.log(error.message);
    res.json("error");
  }
};

const deductFromWallet = async (userId, orderTotal) => {
  try {
    console.log(userId, "🤣❤️😊😍🙌😘");

    const wallet = await Wallet.findOne({ user_id: userId });
    // const wallet = await Wallet.findById("65919b234afc7edbec00bbd2")
    console.log(wallet.walletBalance, "😘💕👍");
    if (wallet.walletBalance >= orderTotal) {
      wallet.walletBalance -= orderTotal;
      await wallet.save();
      console.log("Order total deducted from wallet balance");

      const walletHistoryDebit = new WalletHistory({
        user_id: userId,
        Balance: wallet.walletBalance,
        amount: orderTotal,
        status: "Debit",
      });
      await walletHistoryDebit.save();
    } else {
      console.log("Insufficient funds in the wallet");
    }
  } catch (error) {
    console.log('Error in deductFromWallet function 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};


const checkoutaddress = async (req, res) => {
  console.log("hi");
}
const checkusername = async (req, res) => {
  console.log("checkusername");
}
const showorders = async (req, res) => {
  const id = req.session.user_id
  const offers = await Offer.find({})
  const orders = await Orders.find({ userId: id, canceled: false ,orderPlaced:true}).sort({ createdAt: -1 })
  // console.log(orders);
  const returnorder = await Return.find({})
  // console.log("🤣",returnorder);
  if (orders.length > 0) {
    res.render('showorders', { orders: orders, returnorder, offers })
  } else {
    res.render('showorders', { orders: orders, returnorder, offers })
  }


}
const cartremove = async (req, res) => {
  try {
    const productId = req.params.productId
    const id = req.session.user_id
    const cart = await Cart.findOne({ user: id })
    if (cart) {
      await Cart.findOneAndUpdate(
        { user: id },
        { $pull: { items: { product: productId } } },
        { new: true }
      )
      // const productdata = await Product.findOneAndUpdate(
      //   { _id: productId },
      //   { $inc: { stock: 1 } },
      // )
      // await productdata.save()
      console.log(productId);
      res.send('success')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const updatepassword = async (req, res) => {
  try {
    const oldpassword = req.body.oldpassword
    const password = req.body.password
    const cpassword = req.body.cpassword
    const id = req.session.user_id
    console.log(oldpassword, password, cpassword);
    if (oldpassword.trim() != '' && password.trim() != '' && cpassword.trim() != '') {
      if (cpassword === password) {
        const user = await User.findById({ _id: req.session.user_id })
        const passwordmatch = await bcrypt.compare(oldpassword, user.password)
        if (passwordmatch) {
          const passwordhash = await securePassword(password)
          await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { password: passwordhash } })
          req.session.message = "password changed"
          console.log("😘😘😘😘😘😘");
          res.render('changepassword', { message: "success" })
        } else {
          // oldpassword doesnt match
          res.render('changepassword', { message: "old password doesnt match" })
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

const cancelorder = async (req, res) => {
  try {
    console.log("cancel order🤦‍♀️❤️");
    const userId = req.session.user_id
    const orderId = req.params.orderId;
    console.log(req.session.user_id,"👌👌👌👌👌" + orderId);

    const order = await Orders.findOneAndUpdate(
      { _id: orderId },
      { $set: { canceled: true } },
      { new: true }
    );

    if (!order) {
      console.log("Order not found");
      return res.status(404).json({ error: 'Order not found' });
    }

    // Correct the case when accessing paymentMethod
    if (order.PaymentMethod === "Razorpay" || order.PaymentMethod === "Wallet") {
      console.log("💖payment method",order.PaymentMethod);

      const walletexist = await Wallet.findOne({ user_id: req.session.user_id });
      console.log("Order totalprice:", order.totalprice);
      console.log("Existing Wallet:", walletexist ? walletexist.walletBalance : 'Wallet not found');

      if (!walletexist) {
        const wallet = new Wallet({
          user_id: req.session.user_id,
          walletBalance: order.totalprice
          // Add other wallet properties as needed
        });
        await wallet.save(); // Save the new wallet to the database
      } else {
        walletexist.walletBalance = new Decimal(walletexist.walletBalance).plus(order.totalprice).toNumber();
        await walletexist.save();
      }
      const walletHistoryDebit = new WalletHistory({
        user_id: userId,
        Balance: walletexist.walletBalance,
        amount: order.totalprice,
        status: "Credit",
      });
      await walletHistoryDebit.save();
      // Additional logic for existing wallet goes here if needed
    }

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message }); // Handle errors properly
  }
};

// const returnproduct = async (req, res) => {

//   const orderId = req.params.orderId
//   const itemId = req.params.itemId
//   const orderdata = await Orders.findById(orderId)
//   console.log('😍😍😍😍😍',orderdata);
//   try {
//     const updatedOrder = await Orders.findOneAndUpdate(
//       { _id: orderId },
//       { $pull: { items: { _id: itemId } } },
//       { new: true }
//     );
//     await updatedOrder.save()

//     if (updatedOrder) {
//       console.log('Item removed successfully:', updatedOrder);
//       res.send(updatedOrder); // Send the updated order back to the client
//     } else {
//       res.send('Order not found');
//     }
//   } catch (err) {
//     console.error('Error updating order:', err);
//     res.status(500).send('Internal server error');
//   }

// }

const returnproduct = async (req, res) => {

  const orderId = req.params.orderId
  const itemId = req.params.itemId
  const orderdata = await Orders.findById(orderId)
  console.log('😍😍😍😍😍', orderdata);
  try {
    const updatedOrder = await Orders.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.return': false } },
      { new: true }
    );

    await updatedOrder.save()

    if (updatedOrder) {
      console.log('Item removed successfully:', updatedOrder);
      res.send(updatedOrder);
    } else {
      res.send('Order not found');
    }
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).send('Internal server error');
  }

}
const deleteaddress = async (req, res) => {
  const addressId = req.params.addressId
  console.log('😍😍😍😍😍');
  await Address.findOneAndUpdate({ userId: req.session.user_id },
    { $pull: { address: { _id: addressId } } })
  console.log("💕💕💕💕");
  res.redirect('/userprofile')
}

const allproducts = async (req, res) => {
  try {
    const productsdata = await Product.find({});
    const categories = await Category.find({ active: true }); // Fetch active categories
    const offers = await Offer.find();
    const searchTerm = req.query.search;
    const categoryFilter = req.query.category;

    let page = 1;
    const limit = 3;

    const regex = new RegExp(searchTerm, 'i');

    let products, count;

    const baseQuery = {
      $or: [{ name: regex }, { price: { $regex: regex } }],
      is_deleted: 0,
    };

    if (categoryFilter) {
      baseQuery.category = categoryFilter;
    }

    // Add the condition to filter by the "active" field in the "Category" model
    // baseQuery['category.active'] = false;

    if (searchTerm || categoryFilter) {
      products = await Product.find(baseQuery).exec();
      count = products.length;
    } else {
      if (req.query.page) {
        page = parseInt(req.query.page);
      }

      products = await Product.find(baseQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      count = await Product.find(baseQuery).countDocuments();
    }

    res.render('allproducts', {
      categories,
      offers,
      productsdata,
      products,
      totalpages: Math.ceil(count / limit),
      currentpage: page,
      previous: page - 1,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
};

const wallethistory = async (req, res) => {
  try {
    const ui = req.session.user_id
    const wallethistory = await WalletHistory.find({ user_id: ui }).sort({ createdAt: -1 })
    console.log(wallethistory);
    res.render('wallethistory', { wallethistory: wallethistory })
  } catch (error) {
    console.log(error);
  }
}







const checkcoupon = async (req, res) => {
  try {
    console.log("👍👍👍👍👍👍");
    console.log(req.body.couponCode);
    const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });

    if (coupon && coupon.active) {
      console.log("yes, it's there and active");
      // Assuming you want to set active to false when the coupon is applied
      // await Coupon.findByIdAndUpdate(coupon._id, { $set: { active: false } });

      res.json({ valid: true, discountPercentage: coupon.discountPercentage, message: 'Coupon applied successfully', messageColor: 'green' });
      console.log(coupon.discountPercentage);

    } else if (coupon && !coupon.active) {
      console.log("it's there but not active");
      res.json({ valid: false, message: 'Coupon is has been already used' });
    } else {
      console.log("it's not there");
      res.json({ valid: false, message: 'Coupon not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, error: 'Internal Server Error' });
  }
};
async function creditmoneyonreferal(data, id) {
  try {
    const useri = await User.findById(id);
    console.log(id, "🤣🤣🤣");

    console.log(data);
    const refereduser = await User.findOne({ username: data });
    console.log(refereduser, "🙌🙌❤️🙌🙌");

    if (useri && refereduser) {
      const creditto = await Wallet.findOne({ user_id: refereduser._id });
      creditto.walletBalance += 50;
      await creditto.save();

      const walletHistoryDebit = new WalletHistory({
        user_id: useri._id,
        Balance: creditto.walletBalance,
        amount: "50",
        status: "Refferal Credit",
      });
      await walletHistoryDebit.save();
      console.log("wallet😍😍😍", creditto.walletBalance);
    } else {
      console.log("User not found or referred user not found");
    }

    console.log("money credited");
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  verifyMail,
  sendVerifyMail,
  verificationLoad,
  otpLoad,
  verifyOTP,
  sentVerificationLink,
  userprofile,
  forgetpassword,
  extractforgetpassword,
  resetpasswordmail,
  forgetpasswordload,
  resetpassword,
  editUserLoad,
  extracteditUserLoad,
  updateUsers,
  usermgt,
  extractusermgt,
  showaddress,
  showaddress1,
  saveaddress,
  ordersummary,
  extractcheckout,
  changepassword,
  checkaddress,
  placeorder,
  checkoutaddress,
  showorders,
  cartremove,
  updatepassword,
  cancelorder,
  deleteaddress,
  allproducts,
  checkcoupon,
  wallethistory,
  checkusername,
  returnproduct


};
