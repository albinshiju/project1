const express = require('express')
const user_route = express()
const session = require('express-session')
const config = require('../config/config')
const Product = require('../models/productModel')
const noCache = require('nocache');

user_route.use(session({
    resave:true,
    saveUnintialized:true,
    secret:"secret"
}))
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const isBlocked = require('../middleware/isBlocked')


user_route.set('view engine','ejs')

user_route.set('views','./views/users')
const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))


const multer = require('multer')
const path = require("path")

user_route.use(express.static('public'))

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
const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const paymentController = require('../controllers/paymentController')
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController')
const orderController = require('../controllers/orderController')
const invoiceController = require('../controllers/invoiceController')




// wishlist


user_route.get('/', noCache(),isBlocked.blockChecker, auth.isLogin, userController.loadHome);
user_route.get('/register', noCache(),isBlocked.blockChecker, auth.isLogout, userController.loadRegister);
user_route.post('/register', noCache(),isBlocked.blockChecker, upload.single('image'), userController.insertUser);
user_route.get('/verification', noCache(),isBlocked.blockChecker, userController.verificationLoad);
user_route.post('/verification', noCache(),isBlocked.blockChecker, userController.sentVerificationLink);

user_route.get('/checkusernameexist',userController.checkusername)



user_route.get('/verify', noCache(),isBlocked.blockChecker, userController.verifyMail);
user_route.get('/login', noCache(),isBlocked.blockChecker, auth.isLogout, userController.loginLoad);
user_route.post('/login', noCache(),isBlocked.blockChecker, userController.verifyLogin);
user_route.get('/home', noCache(),isBlocked.blockChecker, auth.isLogin, userController.loadHome);
user_route.get('/logout', noCache(),isBlocked.blockChecker, auth.isLogin, userController.userLogout);

user_route.get('/otp', noCache(),isBlocked.blockChecker, userController.otpLoad);
user_route.post('/verifyOTP', noCache(),isBlocked.blockChecker, userController.verifyOTP);
user_route.get('/userprofile',isBlocked.blockChecker,userController.userprofile)
user_route.get('/forget',isBlocked.blockChecker,userController.forgetpassword)
user_route.post('/forget',isBlocked.blockChecker,userController.extractforgetpassword)
user_route.get('/forget-password',isBlocked.blockChecker,userController.forgetpasswordload)
user_route.post('/forget-password',isBlocked.blockChecker,userController.resetpassword)
user_route.get('/editprofile',isBlocked.blockChecker,userController.editUserLoad)
user_route.post('/editprofile',isBlocked.blockChecker,userController.extracteditUserLoad)
user_route.get('/changepassword',isBlocked.blockChecker,userController.changepassword)
user_route.post('/checkout-address',isBlocked.blockChecker, userController.checkoutAjaxAddress)
user_route.get('/addressmgt',isBlocked.blockChecker,userController.usermgt)
user_route.post('/addressmgt',isBlocked.blockChecker,userController.extractusermgt)
user_route.get('/showaddress',isBlocked.blockChecker,userController.showaddress)
user_route.post('/showaddress',isBlocked.blockChecker,userController.saveaddress)
user_route.get('/addaddresscheckoutpage',isBlocked.blockChecker,userController.showaddress)
user_route.post('/addaddresscheckoutpage/:page',isBlocked.blockChecker,userController.saveaddress)
user_route.post('/checkout',isBlocked.blockChecker,userController.extractcheckout)
user_route.post('/beforeordersummary',isBlocked.blockChecker,userController.ordersummary)
user_route.get('/place-order/:id',isBlocked.blockChecker,userController.placeorder)
user_route.get('/showorders',isBlocked.blockChecker,userController.showorders)
user_route.post('/cartremove/:productId',isBlocked.blockChecker,userController.cartremove)
user_route.post('/updatepassword',isBlocked.blockChecker,userController.updatepassword)
user_route.get('/allproducts',isBlocked.blockChecker, userController.allproducts);

/* cartttt */
user_route.get('/cart',isBlocked.blockChecker,cartController.cart)
user_route.post('/cart/updateqty',isBlocked.blockChecker,cartController.cartOperation);
user_route.get('/cart/checkout',isBlocked.blockChecker,cartController.checkoutpage)
// wishlist
user_route.get('/removeproductwishlist/:id',isBlocked.blockChecker,wishlistController.remove)

user_route.get('/download-invoice/:id',isBlocked.blockChecker,invoiceController.downloadinvoice)



user_route.post('/addToWishlist/:productId',auth.isLogin,noCache(),wishlistController.addToWishlist);
user_route.get('/wishlist',auth.isLogin,noCache(),wishlistController.wishlist);

user_route.get('/deleteWishlistProduct',auth.isLogin,noCache(),wishlistController.deleteWishlistProduct)


user_route.post('/checkCoupon',isBlocked.blockChecker,userController.checkcoupon)
user_route.post('/verifypayment',isBlocked.blockChecker,paymentController.verifypayment)

user_route.get(`/sortProducts`,isBlocked.blockChecker,productController.sortProducts)

user_route.get("/cart/addtocart/:id",isBlocked.blockChecker,cartController.addtocart)
// user_route.get('/addtocart',isBlocked.blockChecker,cartController.addtocart)
user_route.post('/cart/cancelorder/:orderId',isBlocked.blockChecker,userController.cancelorder)
user_route.post('/cart/returnproductseperate/:orderId/:itemId',isBlocked.blockChecker,userController.returnproduct)

// /cart/cancelproduct/${orderId}/${itemId}
user_route.get('/deleteaddress/:addressId',isBlocked.blockChecker,userController.deleteaddress)

user_route.get('/wallethistory',isBlocked.blockChecker,userController.wallethistory)
// return order
user_route.get('/returnorder/:orderId/:itemId',isBlocked.blockChecker,orderController.returnorder)
user_route.post('/returnorder/:orderId/:itemId',isBlocked.blockChecker,orderController.postreturnorder)

user_route.get('/canceledorders',orderController.canceledorder)

/* payment */
user_route.post('/createOrder',isBlocked.blockChecker,paymentController.createOrder)



user_route.get('/prdetails',isBlocked.blockChecker, productController.prdetails)






module.exports = user_route;  