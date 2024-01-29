
const mongoose = require('mongoose')
require("dotenv").config();
const { MONGO_URL} = process.env;

// mongoose.connect(MONGO_URL).then(
//     console.log("database connected")
// ).catch(error=>{
//     console.log("database error",error);
// })
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")
const express =  require('express')
const app = express()
var hello = 1

const userRoute = require('./routes/userRoute');
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute)
app.get('*',(req,res)=>{
    res.redirect('/errorpage')
})



app.listen(3000,(req,res)=>{ 
    console.log("server is 3000");  
})