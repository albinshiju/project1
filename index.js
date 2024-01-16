
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://albindamn:3nVPSVKDGU8v5yeL@cluster0.qfzk5do.mongodb.net/project1")
require("dotenv").config();
const express =  require('express')
const app = express()

const userRoute = require('./routes/userRoute');
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute)



app.listen(3000,(req,res)=>{
    console.log("server is 3000");  
})