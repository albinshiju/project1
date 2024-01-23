const { timeStamp } = require('console');
const mongoose =require('mongoose');
const Schema = mongoose.Schema;


const WishlistSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
      },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
      },
    offerprice:{
      type:Number,
      default:0
    } ,
    price:Number,
    productname:String,
    image:String,

},

 {
    timestamps: true, 

});





const Wishlist = mongoose.model(
    "Wishlist",WishlistSchema
);
module.exports =Wishlist;