const jwt = require("jsonwebtoken");
const userModel = require("../DB/user.model");
const endPoints = require("../modules/user/endPoints");


const auth = (data) => {
  return async (req, res, next) => {
    // console.log(req.headers);
    let headerToken = req.headers["authorization"];
    if (!headerToken || !headerToken.startsWith("Bearer")) {
      res.status(400).json({ message: "invalid token" });
    } else {
      let token = headerToken.split(" ")[1];
      var { id } = jwt.verify(token, process.env.JWTKEY);
      let user = await userModel.findOne({ _id: id }).select("-password");
      if (!user) {
        res.status(500).json({ message: "user not exist" });
      } else {
        req.user = user;
        if (data.includes(user.role)) {
          next();
        } else {
          res.status(500).json({ message: "not auth" });
        }
      }
    }
  };
};


module.exports = { auth };