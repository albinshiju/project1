const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    percentage: {
        type: Number
    }
})

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;