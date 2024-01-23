const User = require('../models/userModel')     //just importing that schema
const Product = require('../models/productModel')
const Admin = require('../models/adminModel')
const Orders = require('../models/orderModel')
const Category = require('../models/categoryModel')
const Coupon = require('../models/couponModel')
const fs = require('fs');
const path = require('path')

const bcrypt = require('bcrypt')
const randomstring = require('randomstring');
const { error, log } = require('console');

const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}
const adminloadregister = async (req, res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const adminData = await Admin.findOne({ email });

        if (!adminData) {
            return res.render('login', { message: "invalid email" });
        }

        const passwordMatch = await bcrypt.compare(password, adminData.password);

        if (!passwordMatch) {
            return res.render('login', { message: "email and password do no match" });
        }

        if (adminData.is_admin === 0) {

            return res.render('login', { admin: adminData, message: "you are not admin " });
        }


        req.session.admin_id = adminData._id;
        console.log("did reach home");
        return res.redirect('/admin/home');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const insertadmin = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mno;
        const image = req.file.filename;
        const password = req.body.password;

        // Check if the password has a minimum length of 8 characters
        if (password.length < 8) {
            res.render('registration', { message: 'Password must be at least 8 characters long' });
        }

        const spassword = await securePassword(password);
        const admin = new Admin({
            name,
            email,
            mobile,
            image,
            password: spassword,
        });

        const adminData = await admin.save();

        if (adminData) {
            res.render('login')
        } else {

            res.render('new-user', { message: 'Something went wrong' });
        }
    } catch (error) {
        console.log(error.message);
        res.render('new-user', { message: 'Something went wrong' });
    }
};
const loadhome = async (req, res) => {
    try {
        const usersData = await Admin.findById({ _id: req.session.admin_id })
        const dataofusers = await User.find({})

        res.render('adminindex', { admin: usersData , users:dataofusers })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        delete req.session.admin_id;
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const adminDashboard = async (req, res) => {
    try {


        const usersData = await User.find({})
        console.log(usersData);
        res.render('dashboard', { users: usersData })

    } catch (error) {
        console.log(error.message)
    }
}

const newUserLoad = async (req, res) => {
    try {
        res.render('new-user')
    } catch (error) {
        console.log(error.message)
    }
}

const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id
        const adminData = await User.findById({ _id: id })
        if (adminData) {
            res.render('edit-user', { user: adminData })
        } else {
            res.redirect('/admin/dashboard')
        }
        res.render('edit-user')
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

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id
        await User.deleteOne({ _id: id })

        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}




const blockuser = async (req, res) => {
    try {
        const id = req.query.id;
        const users = await User.findOne({ _id: id });
        console.log("❤️❤️❤️❤️");
        console.log(users);

        if (users) {
            if (users.is_blocked === 1) {
                users.is_blocked = 0;
            } else if (users.is_blocked === 0) {
                users.is_blocked = 1;
            }
            await users.save();
            res.redirect('/admin/home');
        } else {
            console.log(error);
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.log(error.message);
        // Handle any errors that may occur during the process
        res.status(500).send('Internal Server Error');
    }
};



const sharpcrop = async (req, res) => {
    try {
        console.log('sharpcrop');
        const { imagePath, x, y, width, height } = req.body;
        console.log(imagePath, '-', x, '-', y, '-', width, '-', height, '-');
        const imageDirectory = path.join(__dirname, '..', 'public', 'images');
        const imagePathOnServer = path.join(imageDirectory, path.basename(imagePath));

        console.log('Image path on server:', imagePathOnServer);

        const tempCroppedImagePath = path.join(imageDirectory, 'temp-cropped-image.png');

        await sharp(imagePathOnServer).extract({ left: x, top: y, width, height }).toFile(tempCroppedImagePath);

        // Delete the original image
        fs.unlinkSync(imagePathOnServer);

        // Rename the temporary cropped image to the original filename
        fs.renameSync(tempCroppedImagePath, imagePathOnServer);

        res.status(200).json({ message: 'Image cropped and overwritten successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error cropping image' });
    }
}




const addUser = async (req, res) => {
    try {
        const { name, email, mno } = req.body;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const hashedPassword = await securePassword(password);

        const user = new User({
            name: name,
            email: email,
            mobile: mno,
            image: image,
            password: hashedPassword,
            is_admin: 0
        });

        const productData = await user.save();

        if (productData) {
            res.redirect('/admin/dashboard');
        } else {

            res.render('new-user', { message: 'Something went wrong' });
        }
    } catch (error) {
        console.log(error.message);
        res.render('new-user', { message: 'Something went wrong' });
    }
};
// const vieworders = async (req, res) => {
//     try {
//         const searchTerm = req.query.search;
//         console.log(searchTerm, "💖🥳",req.query.page);
//         let page = 1;
//         const limit = 4;

//         const regex = new RegExp(searchTerm, 'i');
//         console.log(regex);
//         let orders, count;

//         const baseQuery = {
//             $or: [{ userId: regex }, {}],
//         };
        
//         console.log(baseQuery);
        

    
//         if (req.query.page) {
//             page = parseInt(req.query.page);
//         }

//         orders = await Orders.find(baseQuery)
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();
//         console.log(orders);
//         count = await Orders.find(baseQuery).countDocuments();

//         res.render('orders', {
//             orders,
//             totalpages: Math.ceil(count / limit),
//             currentpage: page,
//             previous: page - 1,
//             searchTerm: searchTerm, // Pass searchTerm to the view
//         });
//     } catch (error) {
//         console.error('Error retrieving orders:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

const vieworders = async (req, res) => {
    try {
        console.log("view order");
        // Assuming there is a timestamp or date field named 'createdAt'
        const orders = await Orders.find().sort();
        console.log(orders);

        res.render('orders', {
            orders,
        });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).send('Internal Server Error');
    }
};

const orderDetailView = async(req,res)=>{
    try {
        const id = req.params.id;

        const order = await Orders.findOne({_id: id});

        if(order){
            console.log('order page rendered')
            res.render("view-orderdetail", {order: order});
        }else{
            console.log('order page rendering failed !!!')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const updateorderstatus = async(req,res)=>{
    try {
        
        const orderState = req.body.orderStatus;
        const orderId = req.body.orderId;

        const order = await Orders.findOneAndUpdate(
            { _id: orderId },
            {
              $set: { // Use $set to update specific fields
                orderStatus: orderState,
              },
            },
            { new: true } // Add this option to return the updated document
          );

        const orderStatusUpdated = await order.save();

        if(orderStatusUpdated){
            console.log("order status updated");
            res.send(orderState)
        }else{
            console.log("order status not changed ");
        }

    } catch (error) {
        console.log(error.message);
    }
}

const couponmanagement = async(req,res)=>{
    try {
        const coupon = await Coupon.find({})
        res.render('couponmanagement',{coupon})
    } catch (error) {
        console.log(error.message);
    }
}

const addcoupon = async(req,res)=>{
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}
const postaddcoupon = async(req,res)=>{
    const couponCode = req.body.couponCode
    const active = req.body.active === 'on'? 1:0
    const discountPercentage = req.body.discountPercentage
    const startDate = req.body.startDate
    const expirationDate = req.body.expirationDate

    const existingCoupon = await Coupon.findOne({couponCode})
    if(existingCoupon){
        console.log("coupon code is duplicate");
        res.render('addcoupon',{message:'coupon code is duplicate'})
    }else if(discountPercentage<1){
        console.log("discount should be greater than 1");
        res.render('addcoupon',{message:'discount should be greater than 1'})
    }
    else{
        const addcoupon = new Coupon({
            couponCode,
            active,
            discountPercentage,
            startDate,
            expirationDate
        })
        const data = await addcoupon.save()
        if(data){
            console.log("saved");
            
            res.redirect('/admin/couponmanagement')
        }else{
            console.log("error");
        }
    }
}
const deletecoupon = async (req, res) => {
    try {
        const cd = req.body.id;
        console.log(cd);
        const coupon = await Coupon.findOneAndDelete({ _id: cd });
        console.log(coupon);

        if (coupon) {
            res.send({success:true})
        } else {
            // Coupon not found
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const salesreport = async(req,res)=>{
    try {
        res.render('salesreport')
    } catch (error) {
        console.log(error.message)
    }
}

const postsalesreport = async(req,res)=>{
    try {
        console.log("postsalesreport");
        // const start = '2023-11-20'
        // const end = '2023-11-26'
        const start = req.body.startDate
        const end = req.body.expirationDate
        console.log(start,end);
        const orders = await Orders.find({
            createdAt:{
                $gte:new Date(start),
                $lte:new Date(end),
            }
        })
        const alldata = []
        
        orders.forEach((order)=>{
            order.items.forEach((item)=>{
                alldata.push({
                    productName: item.name,
                    productPrice: item.price * item.quantity,
                    totalprice:order.totalprice,
                    orderid:order._id,
                    quantity:item.quantity,
                    unitprice:item.price,
                    image:item.image,
                    paymentMethod:order.PaymentMethod,
                    date:order.createdAt.toLocaleDateString()
                })
            })
        })
        console.log(alldata);
        console.log(orders.totalprice);
        res.json({alldata})


    } catch (error) {
        
    }
}
const adminabout = async(req,res)=>{
    const usersData = await Admin.findById({ _id: req.session.admin_id })

    res.render('home.ejs',{admin:usersData})
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadhome,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    securePassword,
    editUserLoad,
    updateUsers,
    deleteUser,
    blockuser,
    adminabout,
    sharpcrop,
    adminloadregister,
    insertadmin,
    vieworders,
    orderDetailView,
    updateorderstatus,
    couponmanagement,
    addcoupon,
    postaddcoupon,
    deletecoupon,
    salesreport,
    postsalesreport
}