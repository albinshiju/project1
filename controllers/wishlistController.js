const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel")
const mongoose = require('mongoose');
const Offer = require('../models/offerModel')
const addToWishlist = async (req, res) => {
    try {
      console.log("addtowishlist");
      const productId = req.params.productId;
      const userId = req.session.user_id;
  
      const product = await Product.findById(productId);
  
      
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      let existingItem = await Wishlist.findOne({ product_id: productId, user_id: userId });
  
      if (!existingItem) {
       
      
     const wishlist = new Wishlist({
          product_id: productId,
          user_id: userId,
          
          price: product.price,
          productname:product.name,
          image:product.images[0],


        });
  
        
        await  wishlist.save();
      }
        
      
      
     console.log("Product added to wishlist")
     return res.status(200).json({ message: 'Product added to wishlist successfully' });

    } catch (error) {
      console.error(error.message);
      res.render('error',{status: 500,message: 'Internal Server Error' });
    }
  }

  const deleteWishlistProduct = async (req, res) => {
    try {
      const { id } = req.query;
      await Wishlist.deleteMany({ product_id: id });
      res.redirect('/wishlist');
    } catch (error) {
      console.log(error.message);
      res.render('error',{status: 500,message: 'Internal Server Error' });
    }
  };
const wishlist = async(req,res)=>{
  try {
    const offers = await Offer.find({})
    const category = await Category.find({})
    const wishlist = await Wishlist.find({user_id:req.session.user_id})
    console.log(wishlist);
    res.render('wishlist',{wishlist,offers,category})
  } catch (error) {
    console.log(error);
  }
}
const remove = async(req,res)=>{
  
  console.log("remove",req.params.id);
  const data = await Wishlist.findByIdAndDelete(req.params.id);

  if (data) {
      console.log("Document deleted successfully:", data);
      res.redirect('/wishlist')
  } else {
      console.log("Document not found");
  }
  
}
  module.exports = {
    addToWishlist,
    wishlist,
    deleteWishlistProduct,
    remove
  }