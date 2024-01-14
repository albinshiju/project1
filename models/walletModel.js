const mongoose = require('mongoose');
const User = require("../models/userModel");
const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
 walletBalance: {
    type: Number,
    default: 0, 
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
},
amount : {
    type : Number,
    default:0,
    required:true,
}
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;