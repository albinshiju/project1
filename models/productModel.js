const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: { type: String, required: true, unique: false }, // Set unique to false

    price:{
        type:String,
        required:true
    },
    category: {
        type: Schema.Types.ObjectId, // Reference to Category schema
        ref: 'Category', // Reference to the 'Category' model
        required: true,
      },
    description:{
        type:String,
        required:true,
    },
    stock: {
        type: Number,
        required: true,
    },
    images:[{
        type:String,
        required:true
    }],
    is_deleted:{
        type:Number,
        default:0
    },
    subtotalprice:{
        type:Number,
        
    },
    
})

module.exports = mongoose.model('Product',userSchema);
