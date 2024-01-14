const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const showgraph = async(req,res)=>{
    try {
        res.render('graphs')
    } catch (error) {
        console.log(error);
    }
}

async function getBarChartData(req, res) {
    try {
      const paymentMethodData = await Order.aggregate([
        {
          $group: {
            _id: '$PaymentMethod', 
            count: { $sum: 1 }, 
          },
        },
      ]);
      
      console.log(paymentMethodData);
      // Extract payment method labels and data
      const labels = paymentMethodData.map((method) => method._id);
      const data = paymentMethodData.map((method) => method.count);
  
      const barChartData = {
        labels: labels,
        data: data,
      };
      console.log(barChartData)
  
      res.json(barChartData);
    } catch (error) {
      console.error('Error fetching payment method data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  }
  const pieChart = async (req, res) => {
    try {
      const categoryData = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'categories', // Assuming your Category model is named 'Category'
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        {
          $unwind: '$categoryInfo',
        },
        {
          $project: {
            _id: 0,
            categoryName: '$categoryInfo.categoryName', // Change 'name' to the actual field name in your Category model
            count: 1,
          },
        },
      ]);
  
      // Iterate through categoryData array and log categoryInfo for each element
      console.log(categoryData);
      const labels = categoryData.map((element) => element.categoryName)
      const data = categoryData.map((element) => element.count)

      const pieData = {
        labels:labels,
        data:data
      }
      res.json(pieData)
    } catch (error) {
      console.log(error);
    }
  };
  
  

module.exports = {
    getBarChartData,
    showgraph,
    pieChart
}