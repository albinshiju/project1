const User = require('../models/userModel')

const blockChecker = async (req, res, next) => {
    try {
      const user = req.session.user_id;
        console.log(user);
      console.log("something");
     
      if (user) {
        const userDb = await User.findOne({ _id: user });
        console.log(userDb);
       
        if (userDb.is_blocked === 1) {
          req.session.destroy();
          res.redirect("/");
        } else {
          next();
        }
      }else{
        next()
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  };

  module.exports = {
    blockChecker
  }

