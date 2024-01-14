
const cartOperation = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId, quantity, totalPrice } = req.body;

        console.log(totalPrice + "😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊");

        const productstock = await Product.findOne({ _id: productId });

        if (productstock) {
            if (productstock.stock > 0) {
                await Product.updateOne(
                    { _id: productId },
                    { $inc: { stock: -1 } }
                );

                
            }
        }
    } catch (error) {
        console.log('Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
        // Handle the error appropriately (send an error response, log, etc.)
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// old

const cartOperation = async (req, res) => {
    try {
      
      const cart = await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        {
          $set: { "items.$.quantity": quantity, totalprice: totalPrice },
        },
        { new: true }
      );
  
      const product = await Cart.findOne({ user: userId }).populate("items.product");
  
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });
  
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Product not found in the cart",
        });
      }
      res.json({
        success: true,
        message: "Cart updated successfully",
        subtotal: subtotals,
      });
    } catch (error) {
      console.log('Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
    }
  };

  const cartOperation = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const { productId, quantity, totalPrice } = req.body;
  
      console.log(totalPrice + "😊😊😊😊😊😊😊😊😊😊😊😊😊😊😊");
      
      const cart = await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        {
          $set: { "items.$.quantity": quantity, totalprice: totalPrice },
        },
        { new: true }
      );
  
      const prodId = await Product.findOne({ _id: productId });
      const stock = prodId.stock;
  
  
      // Update the product's stock
      prodId.stock = stock - quantity;
      await prodId.save();
      console.log("stock🎶💖😜", stock);
  
  
      const product = await Cart.findOne({ user: userId }).populate("items.product");
  
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });
  
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Product not found in the cart",
        });
      }
      res.json({
        success: true,
        message: "Cart updated successfully",
        subtotal: subtotals,
      });
    } catch (error) {
      console.log('Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
    }
  };

  const extractproductpage = async (req, res) => {
    try {
      console.log("extract");
      const images = req.files.map(file => file.filename);
  
      // Crop images using Sharp
      const croppedImages = await Promise.all(images.map(async imageFilename => {
        const buffer = await sharp(imageFilename)
          // Adjust cropping parameters as needed
          .resize(300, 300)     // Example: Crop to 300x300 pixels
          // .extract({ left: 100, top: 100, width: 200, height: 200 }) // Example: Extract a specific region
          .toBuffer();
        const croppedFilename = `cropped_${imageFilename}`;
        await sharp(buffer).toFile(croppedFilename);
        return croppedFilename;
      }));
  
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        stock: req.body.stock,
        images: croppedImages,
      });
  
      const adminData = await product.save();
  
      if (adminData) {
        res.redirect('/admin/viewproducts');
      } else {
        res.render('addproducts', { message: 'Something went wrong' });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const extractproductpage = async (req, res) => {
    try{
        let proId=req.params.id
    let Image=req.files.Image
    let product=await productCollection.findOne({_id:ObjectId(proId)})
        let count=product.Images.length
        let response={}
        if(count>=5){
            response.err="Maximum 5 images are Accepted"
            
            req.session.addProImageErr=response.err
            res.redirect('/admin/add-productImg/'+req.params.id)
        }else{
        let imgId=uuid.v4()
        productCollection.updateOne({_id:ObjectId(proId)},{$push:{Images:imgId}})
        
        

        // Image.mv('./public/product-images/'+imgId+'.jpg',(err)=>{
        //     if(err){
        //         console.log(err);
        //     }
        // })
        
        await sharp(req.files.Image.tempFilePath)
        .resize({width:540,height:720})
        .jpeg({
            quality:100
        })
        .toFile(`public/product-images/${imgId}.jpg`)

        response.status=true
        res.redirect('/admin/products')
        } 
    }
    catch(err){
        next(err)
    }
},