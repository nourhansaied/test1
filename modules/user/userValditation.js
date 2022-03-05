
const { body } = require("express-validator");



const userValidation = [
  body("email").isEmail(),
  body("password").isStrongPassword().withMessage("password should have capital and special char"),
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
    body("firstName").isString(),
    body("gender").isString(),
    body("profilePic").isString(),
  
];


module.exports = userValidation;