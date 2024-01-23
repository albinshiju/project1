const User = require('../models/userModel')     //just importing that schema

const Product = require('../models/productModel')

const Admin = require('../models/adminModel')
const Category = require('../models/categoryModel')
const fs = require('fs');
const path = require('path')
const Offer = require('../models/offerModel')
const bcrypt = require('bcrypt')
const sw2 = require('sweetalert2')
const randomstring = require('randomstring');
const { error } = require('console');

const CategoryExist = async (name) => {
  try {
      const exist = await Category.findOne({ categoryName: name });

      if (exist !== null && exist !== undefined) {
          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error(error);
      return false;
  }
};



const categorypage = async(req,res)=>{
    try {
        const message = req.session.categoryMessage;


        const categoriesData = await Category.find({})
        res.render('category', { categories: categoriesData, message })
    } catch (error) {
        console.log(error.message);
    }
} 

const addcategory = async (req, res) => {
    try {
      const categoryName = req.body.categoryName.trim();
  
      if (categoryName.length > 0) {
        const exist = await CategoryExist(categoryName);
        if (!exist) {
          const categoryData = new Category({ categoryName });
          const savedCategory = await categoryData.save();
  
          if (savedCategory) {
            res.json({ success: true, message: 'Category added successfully', data: { savedCategory } });
          } else {
            res.json({ success: false, message: 'Category allready exists', data: { savedCategory } });

            // res.status(400).json({ success: false, message: 'Category already exists' });
          }
        } else {
          res.status(400).json({ success: false, message: 'Category name already exists' });
        }
      } else {
        res.status(400).json({ success: false, message: 'Category name cannot be empty or consist only of whitespace' });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
const categoryedit = async(req,res)=>{
     try {
      console.log("😍ed🤦‍♀️");
        const id = req.query.id;
        const newname = req.body.newCategoryName
        console.log(newname);
        console.log("🤣👍💕"+id);
        const cat = await Category.findByIdAndUpdate(
            {_id:id},
            {$set:{categoryName:newname}})
        await cat.save()
        res.send({cat})
    } catch (error) {
        console.log(error.message);
    }
} 
const categorystatus = async(req,res)=>{
    try {
      console.log("😍🤦‍♀️");

        const categoryId = req.body.categoryId;

        const currentStatus = await Category.findOne({ _id: categoryId }, 'active');
        console.log(currentStatus,"💖🤣👍😘😂");
        const updatedStatus = !currentStatus.active;
        console.log(updatedStatus,"😂👍👍🤣");
        console.log(updatedStatus);
    
        const updatedCategory = await Category.findByIdAndUpdate(
          { _id: categoryId },
          { $set: { active: updatedStatus } },
          { new: true }
        );

        const statusText = updatedStatus ? 'active' : 'deactive';
        res.send({ success:true, status:statusText });

    } catch (error) {
       console.log(error.message);
   }
} 
const showcategorystatus = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    console.log("showcategorystatus");
    
    // Use findOne to find the Category with the given categoryId
    const category = await Category.findOne({ _id: categoryId }, 'active');
    
    // Check if category is found and has active field
    if (category && category.active !== undefined) {
      const statusText = category.active ? 'active' : 'Inactive';
      console.log("🤣💖", statusText);
      res.send({ success: true, status: statusText });
    } else {
      // Handle the case where category or active field is not found
      console.log("Category or active field not found");
      res.status(404).send({ success: false, message: "Category not found or active field missing" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
}

const offers = async(req,res)=>{
  try {
    console.log("offers");
    const categories = await Category.find({})
    const offers = await Offer.find({}).populate('category')
    res.render('addoffers',{categories,offers})
  } catch (error) {
    console.log(error.message);
  }
}
const addoffers = async (req, res) => {
  try {
    console.log(req.body);
    const category = req.body.category;
    const percentage = req.body.percentage;

    const offerCategoryExist = await Offer.findOne({ category: category });

    if (offerCategoryExist) {
      // Offer already exists
      console.log("offer already exists");
      return res.json({ exist: 1 });
    } else {
      const newOffer = new Offer({
        category,
        percentage,
      });

      await newOffer.save();
      // Offer created
      console.log("offer created");
      return res.json({ exist: 0 });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const removeoffer = async(req,res)=>{

  console.log("remove offer");
  const offer = await Offer.findOneAndDelete({category:req.body.id})
  console.log(offer);
  res.json({success:true,message:"category removed"})
}
module.exports = {

    categorypage,
    addcategory,
    categoryedit,
    categorystatus,
    offers,
    addoffers,
    removeoffer,
    showcategorystatus
    
}