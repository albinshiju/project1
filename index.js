
const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")
require("dotenv").config();
const express =  require('express')
const app = express()

const userRoute = require('./routes/userRoute');
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute)



app.listen(1212,(req,res)=>{
    console.log("server is 1212");  
})