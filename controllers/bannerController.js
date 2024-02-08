const sharp = require('sharp');
const fs = require("fs");
const path = require('path');
const Banners = require("../models/bannersModel");
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

const showBanners = async (req, res) => {
  try {
    const banner = await Banners.find({});
    res.render('banners',{banner});
  } catch (error) {

    console.log(error);
  }
};

// const addBanner = async (req, res) => {
//   try {
//     const uploadedBanner = req.file.path;
//     const croppedBanner = path.join(
//       req.file.destination,
//       `banner_${new Date().getTime()}.jpg`
//     );
//         const options = {
//       height: 450,
//       width: 1200,
//       fit: "cover",
//   }
//     console.log("banner",req.file);
//     const data = new Banners({
//       image:req.file.filename
//     })
//     await data.save()



//   //   res.status(200).json({ message: "success" });

//   //   fs.unlink(uploadedBanner, (error) => {
//   //     if (error) console.log(error);
//   //   });
//   //   fs.unlink(croppedBanner, (error) => {
//   //     if (error) console.log(error);
//   //   });
//   } catch (error) {
//     console.log(error);
//   }
// };

const addBanner = async (req, res) => {
  try {
    const uploadedBanner = req.file.path;
    console.log(req.file.filename);
    const croppedBanner = path.join(
      req.file.destination,
      `banner_${new Date().getTime()}.jpg`
    );
    console.log(croppedBanner);
    const options = {
      height: 450,
      width: 900,
      fit: "cover",
    };

    await sharp(uploadedBanner).resize(options).toFile(croppedBanner);

    await new Banners({
      image: path.basename(croppedBanner), 
    }).save();

    res.redirect('/admin/banners')

  } catch (error) {
    console.log(error);
  }
};

// const addBanner = async (req, res) => {
//   try {
//     const uploadedBanner = req.file.path;
//     console.log(req.file.filename);

//     await new Banners({
//       image: path.basename(uploadedBanner), 
//     }).save();

//     res.redirect('/admin/banners')

//   } catch (error) {
//     console.log(error);
//   }
// };



// const enableBanner = async (req, res) => {
//   try {
//     const banner = req.body.banner;
//     await Banners.findByIdAndUpdate(banner, {
//       $set: { isActive: true },
//     });
//     res.status(200).json({ message: "success" });
//   } catch (error) {
//     const statusCode = errorHandler.getStatusCode(error);
//     res.status(statusCode).render("error", { error: error });
//     console.log(error);
//   }
// };

// const disableBanner = async (req, res) => {
//   try {
//     const banner = req.body.banner;
//     await Banners.findByIdAndUpdate(banner, {
//       $set: { isActive: false },
//     });
//     res.status(200).json({ message: "success" });
//   } catch (error) {
//     const statusCode = errorHandler.getStatusCode(error);
//     res.status(statusCode).render("error", { error: error });
//     console.log(error);
//   }
// };

const deleteBanner = async (req, res) => {
  try {
    console.log("deletebanner");
    const banner = req.params.bannerId;
    console.log(banner);
    await Banners.findByIdAndDelete(banner);
    res.status(200).json({ message: "success" });
  } catch (error) {

    console.log(error);
  }
};



module.exports = {
  showBanners,
  addBanner,
  // enableBanner,
  // disableBanner,
  deleteBanner,
};