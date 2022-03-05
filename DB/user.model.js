const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, required: true },
  firstName: String,
  password: { type: String },
    gender: { type: String, default: 'male' },
    confirmed: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    profilePic: String,
    coverPics: Array,
  flowers: Array,
    status: String
    
});

userSchema.pre("save",function(next){
  this.password = bcrypt.hashSync(this.password, parseInt(process.env.SALTROUNDS));
  next()
});
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;