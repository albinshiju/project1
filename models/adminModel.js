const mongoose = require('mongoose');
const schema = mongoose.Schema;

const adminSchema = new schema({
  name: {
    type: String,
    required: true,

  },
  mobile: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    default: 0
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
