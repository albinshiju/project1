const mongoose = require('mongoose')


// const userSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     email:{
//         type:String,
//         required:true
//     },
//     mobile:{
//         type:String,
//         required:true,
//     },
//     image:{
//         type:String,
//         required:true,
//     },
//     password:{
//         type:String,
//         required:true
//     },

//     if_varified:{
//         type:Number,
//         default:0
//     },
//     is_blocked:{
//         type:Number,
//         default:0
//     },
//     token:{
//         type:String,
//         default:''
//     }

// })
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    referalcode: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,

    },
    image: {
        type: String,

    },
    password: {
        type: String,
    },

    if_varified: {
        type: Number,
        default: 0
    },
    is_blocked: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: ''
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
    }

})

module.exports = mongoose.model('user', userSchema);
