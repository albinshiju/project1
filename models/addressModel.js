const mongoose = require('mongoose');
const Schema =  mongoose.Schema;



const addressSchema = new Schema({
    userId:{
        type: String,
        required: true,
    },
    address: [
        {
            firstName: String,
            lastName: String,
            landmark: String,
            addressDetail: String,
            state: String,
            zip: Number,
            phone: Number
        }
    ],
})

const Address= mongoose.model("Address", addressSchema);
module.exports = Address;