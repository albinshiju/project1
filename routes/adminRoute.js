const express = require('express')
const admin_route = express()
const session = require('express-session')
const config = require('../config/config')
const noCache = require('nocache')
admin_route.use(session({
    resave:true,
    saveUnintialized:true,
    secret:"secret"
}))
admin_route.use(express.json());

const bodyParser = require("body-parser")
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const adminAuth = require("../middleware/adminAuth")


admin_route.use(express.static('public'))

const multer = require('multer')
const path = require("path")

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload = multer({storage:storage})


const storage2 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload2 = multer({storage:storage2})

const storage3 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/bannerImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload3 = multer({storage:storage3})


// const storage2 = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "../public/productImages");
//     },
//     filename: (req, file, cb) => {
//       let ext = path.extname(file.originalname);
//       cb(null, file.fieldname + "-" + Date.now() + ext);
//     },
//   });
  
//   const upload2 = multer({
//     storage: storage2,
//   });
const bannerController = require('../controllers/bannerController')
const orderController = require('../controllers/orderController')
const chartController = require('../controllers/chartController')
const adminController = require("../controllers/adminController")
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const { isObjectIdOrHexString } = require('mongoose')
const categoryModel = require('../models/categoryModel')
admin_route.get('/',noCache(),adminAuth.isLogin,adminController.loadhome)
admin_route.get('/register',adminAuth.isLogout,adminController.adminloadregister)
admin_route.post('/register',upload.single('image'),adminController.insertadmin)


admin_route.get('/login', noCache(), adminAuth.isLogout, adminController.loadLogin);
admin_route.post('/login', noCache(),adminController.verifyLogin);

admin_route.get('/home',noCache(),adminAuth.isLogin,adminController.loadhome)
admin_route.get('/about',adminController.adminabout)



admin_route.post('/register',upload.single('image'),adminController.insertadmin)
admin_route.get('/logout',adminAuth.isLogin,adminController.logout)
admin_route.get('/dashboard',adminAuth.isLogin,adminController.adminDashboard)
admin_route.get('/new-user',adminAuth.isLogin,adminController.newUserLoad)
admin_route.get('/blockuser',adminAuth.isLogin,adminController.blockuser)

admin_route.post('/new-user',upload.single('image'),adminController.addUser)
admin_route.get('/edit-user',adminAuth.isLogin,adminController.editUserLoad)
admin_route.post('/edit-user',adminController.updateUsers)
admin_route.get('/delete-user/:id',adminController.deleteUser)



admin_route.get('/deleteproduct/:id',productController.deleteproduct)
admin_route.get('/addproducts',adminAuth.isLogin,productController.addproductPage)
admin_route.post('/addproducts',adminAuth.isLogin,upload2.array('images'),productController.extractproductpage)

admin_route.get('/editproducts',adminAuth.isLogin,productController.editproductload)

admin_route.post('/edit-product',adminAuth.isLogin,upload2.array('images', 5),productController.editproduct)
admin_route.get('/removeimage',adminAuth.isLogin,productController.removeimage)

admin_route.get('/viewproducts',adminAuth.isLogin,productController.viewproductsforadminpage)
admin_route.get('/removeproduct/:id',adminAuth.isLogin,productController.removeproduct)

admin_route.get('/couponmanagement',adminAuth.isLogin,adminController.couponmanagement)
admin_route.get('/addcoupon',adminAuth.isLogin,adminController.addcoupon)
admin_route.post('/addcoupon',adminAuth.isLogin,adminController.postaddcoupon)

admin_route.get('/deletecoupon',adminAuth.isLogin,adminController.deletecoupon)

admin_route.get('/category',adminAuth.isLogin,categoryController.categorypage)
admin_route.post('/addcategory',adminAuth.isLogin,categoryController.addcategory)
admin_route.put('/categoryedit',categoryController.categoryedit)
admin_route.post('/categoryedit',categoryController.categorystatus)

// banner
admin_route.get('/banners',adminAuth.isLogin,bannerController.showBanners)
admin_route.post('/uploadbanner',upload3.single('image'),adminAuth.isLogin,bannerController.addBanner)
admin_route.post('/deletebanner/:bannerId',adminAuth.isLogin,bannerController.deleteBanner)



// graph
admin_route.get('/graph',chartController.showgraph)
admin_route.get('/graph/bar',adminAuth.isLogin,chartController.getBarChartData)
admin_route.get('/graph/pie',adminAuth.isLogin,chartController.pieChart)

admin_route.delete('/removeoffer',categoryController.removeoffer)

admin_route.get('/salesreport',adminAuth.isLogin,adminController.salesreport)
admin_route.post('/salesreport',adminAuth.isLogin,adminController.postsalesreport)

admin_route.get('/offers',adminAuth.isLogin,categoryController.offers)
admin_route.post("/offers",adminAuth.isLogin,categoryController.addoffers)
admin_route.get("/returnapproval",adminAuth.isLogin,orderController.returnapproval)
admin_route.post("/approveOrder/:orderId/:itemId",adminAuth.isLogin,orderController.approveorder)

admin_route.get('/orders',adminAuth.isLogin,adminController.vieworders)

admin_route.get('/view-orderdetail/:id', adminController.orderDetailView)
admin_route.post('/update-order-status' , adminController.updateorderstatus)
admin_route.post('/cropimage',adminAuth.isLogin, adminController.sharpcrop);
// admin_route.get('*',(req,res)=>{
//     res.redirect('/admin')
// })



module.exports = admin_route;