const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const returnSchema = new Schema({
    status:{
        type: String,
        default:"pending"
    },
    // Request Sent
    // Approved
    orderno:{
        type: String,
    },
    reason:{
        type: String,
    },

});

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;