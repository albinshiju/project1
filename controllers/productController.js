const User = require('../models/userModel')     //just importing that schema
const Product = require('../models/productModel')
const Admin = require('../models/adminModel')
const Category = require('../models/categoryModel')
const fs = require('fs');
const path = require('path')
const sharp = require('sharp');

const bcrypt = require('bcrypt')
const randomstring = require('randomstring');
const { error } = require('console');
const Offer = require('../models/offerModel');






const deleteproduct = async (req, res) => {
    try {

        const id = req.params.id
        console.log(req.params.id);
        await Product.deleteOne({ _id: id })

        res.redirect('/admin/viewproducts')
    } catch (error) {
        console.log(error.message)
    }
}

const addproductPage = async (req, res) => {
    try {
        const categoriesData = await Category.find({});
        console.log(categoriesData);
        res.render('addproducts', { categories: categoriesData });
    } catch (error) {
        console.log(error.message);
    }
}


const editproductload = async (req, res) => {
    try {
        console.log("edit product load");
        const id = req.query.productId
        console.log(id);
        const adminData = await Product.findById({ _id: id })
        const data = await Product.findById({ _id: id }).populate('category').exec()
        console.log(data.category.categoryName);
        const categories = await Category.find({})
        if (adminData) {
            res.render('editproduct', { product: adminData, categories: categories, data })
        } else {
            res.redirect('/admin/viewproducts')
        }

    } catch (error) {
        console.log(error.message)
    }
}
// const editproductload = async (req, res) => {
//     try {
//         console.log("edit product load");
//         const id = req.query.productId
//         console.log(id);
//         const adminData = await Product.findById({ _id: id })
//         const categories = await Category.find({})
//         if (adminData) {
//             res.render('editproduct', { product: adminData , categories:categories})
//         } else {
//             res.redirect('/admin/viewproducts')
//         }

//     } catch (error) {
//         console.log(error.message)
//     }
// }


// const editproduct = async (req, res) => {
//     try {
//         const id = req.query.id;
//         if (!id) {
//             return res.status(400).send("Invalid product ID");
//         }

//         const existingProduct = await Product.findById(id);
//         if (!existingProduct) {
//             return res.status(404).send("Product not found");
//         }

//         // let new_image = existingProduct.image;

//         if (req.file) {
//             new_image = req.file.filename || "";
//             try {
//                 await fs.unlink(path.join("./productImages", existingProduct.image));
//             } catch (err) {
//                 console.error(err);
//             }
//         }

//         const newData = await Product.updateOne(
//             { _id: id },
//             {
//                 name: req.body.name,
//                 price: req.body.price,
//                 category: req.body.category,
//                 description: req.body.description,
//                 image: new_image
//             }
//         );

//         console.log(newData);

//         res.redirect("/admin/viewproducts");
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: err.message });
//     }
// }
const editproduct = async (req, res) => {
    const productId = req.query.id;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const stock = req.body.stock;
    const newImages = req.files.map(file => file.filename);

    // Retrieve existing images from the product in the database
    const product = await Product.findById({ _id: productId })
    const existingImages = product.images || [];
    console.log(existingImages[0]);
    console.log(product);

    // Handle new images

    // Combine existing and new images
    const allImages = [...existingImages, ...newImages];
    console.log(newImages[0]);
    console.log(allImages);

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
                $set: {
                    name: name,
                    description: description,
                    price: price,
                    stock: stock
                },
                $push: {
                    images: { $each: newImages }, // Append newImages to the existing images array
                },
            },
            { new: true }
        );


        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }
        const product = await Product.find({})
        console.log('Updated product:', updatedProduct);
        res.render('viewproducts', { product: product })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


const extractproductpage = async (req, res) => {
    try {
      const uploadedImages = req.files;
      const productImages = [];
  
      const imagePromises = uploadedImages.map(async (image) => {
        const uploadedImage = image.path;
        console.log(image.filename);
        const croppedImage = path.join(
          image.destination,
          `image_${new Date().getTime()}.jpg`
        );
        console.log(croppedImage);
        const options = {
          height: 300,
          width: 300,
        };
        await sharp(uploadedImage).resize(options).toFile(croppedImage);
  
        productImages.push(path.basename(croppedImage));
      });
  
      await Promise.all(imagePromises);
  
      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        stock: req.body.stock,
        images: productImages, 
      });
  
      await newProduct.save();
  
      res.redirect('/admin/viewproducts');
  
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  
// const extractproductpage = async (req, res) => {
//     try {
//       console.log("uploaded");
//       const product = await Product.find({}); // Assuming Product is your product model
//       const uploadedImage = req.file.path;
//       console.log(req.file.filename);
//       const croppedImage = path.join(
//         req.file.destination,
//         `product_${new Date().getTime()}.jpg`
//       );
//       console.log(croppedImage);
//       const options = {
//         height: 300, // Adjust the height as needed
//         width: 300,  // Adjust the width as needed
//         fit: "cover",
//       };

//       await sharp(uploadedImage).resize(options).toFile(croppedImage);

//       // Assuming 'images' is an array field in your Product model
//       // Adjust the model and field names as needed
//       await product.images.push(path.basename(croppedImage)); 

//       // Save the updated product with the new cropped image
//       await product.save();

//       res.redirect('/admin/products');

//     } catch (error) {
//       console.log(error);
//     }
//   };


// const extractproductpage = async (req, res) => {
//     const categories = await Category.find({})

//     try {
//         console.log("extract");
//         const images = [];

//         // Process each uploaded image
//         for (const file of req.files) {
//             const imgId = uuid.v4();

//             // Resize and compress image using sharp
//             await sharp(file.path)
//                 .resize({ width: 540, height: 720 })
//                 .jpeg({ quality: 100 })
//                 .toFile(`public/productImages/${imgId}.jpg`);

//             // Add the processed image filename to the array
//             images.push(`${imgId}.jpg`);
//         }

//         const product = new Product({
//             name: req.body.name,
//             price: req.body.price,
//             category: req.body.category,
//             description: req.body.description,
//             stock: req.body.stock,
//             images: images,
//         });

//         const adminData = await product.save();

//         if (adminData) {
//             res.redirect('/admin/viewproducts');
//         } else {
//             res.render('addproducts', { message: 'Something went wrong' ,categories });
//         }
//     } catch (error) {
//         console.log(error.message);
//         // Handle the error appropriately
//         res.render('addproducts', { message: 'Something went wrong',categories });
//     }
// };




const viewproductsforadminpage = async (req, res) => {
    try {
        const adminData = await Product.find({}).sort({ _id: -1 })

        res.render('viewproducts', { product: adminData })
    } catch (error) {
        console.log(error.message)
    }
}




const removeproduct = async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findOne({ _id: id })
        if (product.is_deleted === 1) {
            product.is_deleted = 0
        } else if (product.is_deleted === 0) {
            product.is_deleted = 1
        }
        await product.save()
        res.redirect('/admin/viewproducts')
    } catch (error) {
        console.log(error.message)
    }
}




const sortProducts = async (req, res) => {


}

const removeimage = async (req, res) => {
    try {
        const imageIndex = req.query.imageIndex;
        const productId = req.query.productId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the imageIndex is within a valid range
        if (imageIndex < 0 || imageIndex >= product.images.length) {
            return res.status(400).json({ error: 'Invalid imageIndex' });
        }

        // Remove the image from the array
        product.images.splice(imageIndex, 1);

        // Save the updated product
        await product.save();

        // Send a success response
        res.json({ message: 'Image removed successfully', product });
    } catch (error) {
        console.error(error);

        // Send an error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { removeimage };

const prdetails = async (req, res) => {

    try {
        const offers = await Offer.find({})
        const id = req.query.id
        const products = await Product.findById({ _id: id })
        const productdata = await Product.find({})
        console.log(productdata);
        if (products) {
            console.log("workin");
            res.render('prdetails', { products, offers ,productdata })
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
};



















module.exports = {

    deleteproduct,
    addproductPage,
    extractproductpage,
    viewproductsforadminpage,
    removeproduct,
    editproductload,
    editproduct,
    sortProducts,
    removeimage,
    prdetails
}