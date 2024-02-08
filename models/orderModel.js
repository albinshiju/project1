const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    items: [
        {
        name: {    
            type: String,
            required: true
        },
        category: {
            type: Schema.Types.ObjectId, // Reference to Category schema
            ref: 'Category', // Reference to the 'Category' model
            required: true,
          },
        price: {
            type: String,
            required: true
        },
        subtotal:{
            type: Number,
            default: 0.00
        },
        offerprice:{
            type: Number,
            default: 0.00
        },
        offersubtotal:{
            type: Number,
            default: 0.00
        },
        prodId: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        deliveredAt: {
            type: Date,
            default: null
        },

        return: {
            type: Boolean,
            default: null

        },
        returnstatus: {
            type: String,
            default: null

        },
        reason: {
            type: String,
            default: null
        },
        canceled: {
            type: String,
            default: null

        },
        orderStatus:{
            type: String,
            default: 'pending'
            
        },
        returnApproval: {
            type: Boolean,
            default: null

        },
        
    }
    ],
    address:  {
            firstName: String,
            lastName: String,
            landmark: String,
            addressDetail: String,
            state: String,
            zip: Number,
            phone: Number
        }
    ,
    totalprice:{
       type: Number
    },
    
    paymentStatus: {
        type: String
    },
    PaymentMethod: {
        type: String
    },
    deliveryStatus:{
        type: String,
        default: 'pending'
    }, 
    orderStatus:{
        type: String,
        default: 'pending'
        
    },
    canceled: {
        type: Boolean,
        default: false
    },
    returned: {
        type: Boolean,
        default: false
    },
    returnApprovel:{
      type: Boolean,
      default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    orderPlaced: {
        type: Boolean,
        default: false
    },
    couponCode:{
        type:String,
        // default:"null"
    }
});

const Orders = mongoose.model('Orders', orderSchema);


module.exports = Orders;