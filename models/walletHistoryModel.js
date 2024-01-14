const mongoose = require('mongoose');
const User = require("../models/userModel");
const walletHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
 Balance: {
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
    required:false,
},
status : {
    type : String,
    required: true,
}
});

const WalletHistory = mongoose.model('WalletHistory', walletHistorySchema);

module.exports = WalletHistory;