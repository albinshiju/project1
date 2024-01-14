const easyinvoice = require('easyinvoice');
const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');

const path = require('path');
const fs = require('fs');

let imgPath = path.resolve('img', 'invoice.png');

function base64_encode(imgpath) {
  let png = fs.readFileSync(imgPath);
  return Buffer.from(png).toString('base64');
}

const generateInvoiceData = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    const vatPercentage = 0.18;

    const clientInfo = {
      "company": `${order.address.firstName} ${order.address.lastName}`,
      "address": order.address.addressDetail,
      "zip": order.address.zip,
      "city": order.address.state,
      "country": ` ${"+91"} ${order.address.phone}`
    };

    const information = {
      "number": order._id.toString(),
    };
    ;


    const products = order.items.map(async (product) => {
      const offer = await Offer.findOne({ category: product.category });

      const priceWithOffer = offer
        ? product.price - (product.price * offer.percentage) / 100
        : product.price;

      return {
        "description": product.name,
        "quantity": product.quantity, 
        "price": priceWithOffer,
      };
    });

    const productsWithPrices = await Promise.all(products);
    const total = {
        "total": order.totalprice, // Defaults to 'Total'
        "vat": order.totalprice
    }
    return {
      "customize": {},
      "images": {
        "logo": base64_encode(imgPath),
        "background": "https://public.budgetinvoice.com/img/watermark-draft.jpg"
      },
      "sender": {
        "company": "Speedcart.com",
        "address": "Church Street 123",
        "zip": "1234 AB",
        "city": "Kollam",
        "country": "Kerala"
      },
      "client": clientInfo,
      "information": information,
      "products": productsWithPrices,
      total: total,
  vat: vatPercentage,
      "bottom-notice": "Kindly pay your invoice within 15 days.",
      "settings": {
        "currency": "INR",
      },
      "translate": {},
    };
  } catch (error) {
    console.error('Error generating invoice data:', error);
    throw error; 
  }
};

const invoicePdf = async (data) => {
  try {
    let result = await easyinvoice.createInvoice(data);
    fs.writeFileSync(`./invoice/invoice${Date.now()}.pdf`, result.pdf, 'base64');
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

const downloadinvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const invoiceData = await generateInvoiceData(id);

    const result = await easyinvoice.createInvoice(invoiceData);
    const pdfBuffer = Buffer.from(result.pdf, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating and downloading invoice:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  downloadinvoice
};
