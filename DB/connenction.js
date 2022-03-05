const mongoose = require("mongoose");


let connection = () => {
    return mongoose
      .connect("mongodb+srv://nourhan:Test1234@cluster0.lri9y.mongodb.net/test")
      .then(() => console.log("connected"))
      .catch((err) => console.log(err));
}


module.exports = connection;