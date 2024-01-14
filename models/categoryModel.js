const mongoose = require("mongoose")

const Schema = mongoose.Schema

const categorySchema = new Schema({
    categoryName : {
        type:String,
        trim:"true",
        uppercase:"true"

    },
    active:{
        type:Boolean,
        default:true
    }
})
module.exports  = mongoose.model("Category",categorySchema)

