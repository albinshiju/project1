const Razorpay = require('razorpay');
const Orders = require('../models/orderModel')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
})

const createOrder = async(req,res)=>{
    try {
        const orderId = req.body.orderId;
        console.log(orderId);
      
        const newOrder = await Orders.findOne({_id:orderId});
        console.log(newOrder + "⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔🔥");
        var options = {
          amount: newOrder.totalprice * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: "razorUser@gmail.com"
        };
        razorpayInstance.orders.create(options, function(err, order) {
      
          console.log(order);
          res.status(200).send({
            success:true,
            msg:'Order Created',
            order_id:orderId,
            amount: newOrder.totalprice * 100,
            key_id:RAZORPAY_ID_KEY,
            product_name:req.body.name,
            description:req.body.description,
            contact:"+91 9947243674",
            name: "albin S",
            email: "albindamn@gmail.com",
            
        });
      
        });
      } catch (error) {
        console.log('Try catch error in PaymentCheckout  🤷‍♂📀🤷‍♀');
        console.log(error.message);
      }
      
}

const verifypayment = async(req,res)=>{
    try {
        console.log(req.body, "Success of order 📀📀📀📀📀📀😁😁❤❤");
        const orderId = req.body.orderId;
    
        // Assuming the payment status is considered successful without any verification
        await Orders.updateOne(
          { _id: orderId },
          {
            $set: {
              paymentstatus: "placed",
            },
          }
        );
    
        console.log("Payment is considered successful");
        res.json({ status: true });
      } catch (error) {
        console.log('Try catch error in verifyPayment 🤷‍♂📀🤷‍♀');
        console.log(error.message);
        res.json({ status: false, errMsg: "Error processing payment" });
      }
}

module.exports = {
    createOrder,
    verifypayment
}