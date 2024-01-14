const Orders = require('../models/orderModel')
const Return = require('../models/returnModel')
const canceledorder = async(req,res)=>{
    const id = req.session.user_id
    const orders = await Orders.find({ userId: id, canceled: true }).sort({createdAt:-1})
    console.log(orders);
  
    if (orders.length > 0) {
      res.render('Corder', { orders: orders })
    } else {
      res.render('Corder', { orders: orders })
    }
}
const returnorder = async(req,res)=>{

  const orderId = req.params.orderId
  const itemId = req.params.itemId

  const order = await Orders.findOne(
    { _id: orderId, "items._id": itemId },
    { 'items.$': 1 }
  );
  
  console.log("order", order);
  
  res.render('returnorder',{order})
}
const postreturnorder = async(req,res)=>{
  const returnReason = req.body.returnReason
  const orderId = req.params.orderId
  const itemId = req.params.itemId
  const orders = await Orders.find()
  const order = await Orders.findOneAndUpdate(
    { _id: orderId, 'items._id': itemId },
    { $set: { 'items.$.return': false , 'items.$.reason': returnReason}},
    { new: true }
  );
  await order.save()
  console.log(orderId,itemId)
    res.redirect('/showorders')
}
const returnapproval = async(req,res)=>{
  const pipeline = [
    {
      $unwind: '$items', // Split the items array into separate documents
    },
    {
      $match: {
        'items.return': false, // Filter documents where items.return is true
      },
    },
  ];


  const result = await Orders.aggregate(pipeline).exec(); // Remove the count() method
  const count = result.length; // Use the length property to get the count of results
      console.log("💖💖",result);
    res.render('returnapproval',{orders:result})
}
const approveorder = async(req,res)=>{
  try {
    const { orderId, itemId } = req.params;
    console.log("💖💖", "approveOrder", orderId, itemId);
    const order = await Orders.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const itemToUpdate = order.items.find(item=>item._id.toString()===itemId)
    if (!itemToUpdate) {
      return res.status(404).json({ success: false, error: 'Item not found in order' });
    }
    itemToUpdate.return = true;
    itemToUpdate.returnApproval = true;

    await order.save();

    res.status(200).json({ success: true, message: 'Return approval updated successfully' });

  } catch (error) {
    console.log(error);
  }

  // const returned = await Return.findOne({orderno:req.params.id})
  // returned.status = "approved"
  // await returned.save()
  // res.status(200).json({success:true });

}
module.exports = {
    canceledorder,
    returnorder,
    postreturnorder,
    returnapproval,
    approveorder
}