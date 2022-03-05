const userModel = require("../../../DB/user.model")
const sendEmail = require("../../../common/email.js")

var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const {createInvoice} = require("../../../common/createInvoice");
const clint = new OAuth2Client(process.env.GOOGLECLIENTID);
const signUp = async (req, res) => {
    try {

        let { email, password, profilePic,gender,firstName } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
             res.status(400).json({ message: "user already exist" });
        } else {
            let addUser = new userModel({ email, password, profilePic, gender, firstName });
            let added =await addUser.save();
            let token = jwt.sign({ id: added._id }, process.env.JWTKEY, { expiresIn: 60 });
            let refreshToken = jwt.sign({ id: added._id }, process.env.JWTKEY);
            
    
            let message = `<a href='${req.protocol}://${req.headers.host}/user/confirm/${token}'>confirm email</a>
            <br/>
            <a href='${req.protocol}://${req.headers.host}/user/resend_confirmation/${refreshToken}'>Click here to resend confirmation</a>
            `;
            let pdfData = {
              path: "invoice.pdf",
              filename: "invoice.pdf",
              contentType: "application/pdf",
            };
            sendEmail(email, message, pdfData);
            res.status(201).json({message:"added", added})
        }
        
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
}


const resendConfirmEmail =async (req, res) => {
    let { token } = req.params;
    if (!token) {
        res.status(400).json({message:"invalid token"})
    } else {
         let {id} = jwt.verify(token, process.env.JWTKEY);
        let user = await userModel.findOne({ _id: id, confirmed: false }, {});
        if (user) {
              let token = jwt.sign({ id }, process.env.JWTKEY, { expiresIn: 60 });
            let refreshToken = jwt.sign({ id }, process.env.JWTKEY);
            
            let message = `<a href='${req.protocol}://${req.headers.host}/user/confirm/${token}'>confirm email</a>
            <br/>
            <a href='${req.protocol}://${req.headers.host}/user/resend_confirmation/${refreshToken}'>Click here to resend confirmation</a>
            `;
            sendEmail(user.email, message);
            res.status(200).json({message:"Done",token})
        } else {
             res.status(500).json({message:"invalid token"})
        }
    }
}


const signIn = async(req, res) => {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, function (err, result) {
              // result == true
                if (result) {
                    // login
                    let token = jwt.sign({ id: user._id, isLogin: true }, process.env.JWTKEY);
                  const invoice = {
                    shipping: {
                      name: "John Doe",
                      address: "1234 Main Street",
                      city: "San Francisco",
                      state: "CA",
                      country: "US",
                      postal_code: 94111,
                    },
                    items: [
                    ],
                    subtotal: 8000,
                    paid: 0,
                    invoice_nr: 1234,
                  };
                    invoice.items.push(user)
                    createInvoice(invoice, "myData.pdf");
                    let pdfData = {
                      path: "myData.pdf",
                      filename: "myData.pdf",
                      contentType: "application/pdf",
                    };
                      sendEmail(user.email, "<h1>hello from the other side<h1>", pdfData);
                      res.status(200).json({ message: "welcome", token });
                } else {
                    res.status(400).json({message:"in-valid password"})
                }
            });
            
        } else {
            res.status(400).json({message:"email not exist"})
        }
    } catch (error) {
        
    }
}


const confirmEmail = async (req, res) => {
    try {
        
        const { token } = req.params;
        var {id} = jwt.verify(token, process.env.JWTKEY);
        let user = await userModel.findOne({ _id: id, confirmed: false }, {});
        if (user) {
            let updatedUser = await userModel.findByIdAndUpdate(id, { confirmed: true }, { new: true });
            res.status(200).json({ message: "updated", updatedUser });
        } else {
            res.status(400).json({ message: "Invalid user" });
        }

    } catch (error) {
                res.status(500).json({ message: "Error", error });

    }
}

const updateName = async(req, res) => {

    try {
        let { userName } = req.body;
        let user = await userModel.findByIdAndUpdate({ _id: req.user._id }, { userName },{new:true});
            res.status(200).json({ message: "updated", user });

    } catch (error) {
                        res.status(500).json({ message: "Error", error });

    }
}


const uploadProfilePic =async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        res.json({message:"invalid image"})
    } else {
            const imageURL = `${req.protocol}://${req.headers.host}/${req.file.path}`;
            let user = await userModel.findByIdAndUpdate(req.user._id, { profilePic: imageURL }, { new: true });
            res.json({ message: "updated", user });
    }

}

const googleLogin = (req, res) => {
  const { name, photoUrl, firstName, lastName, response } = req.body;
  console.log(name, photoUrl, firstName, lastName, response);
  const idToken = response.id_token;
    clint.verifyIdToken({ idToken, audience: process.env.GOOGLECLIENTID }).then(async (response) => {
      console.log(response);
      const { email_verified, email } = response.payload;

      if (email_verified) {
        const user = await userModel.findOne({ email });

        if (user) {
  //         //user already exist just login
          const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.JWTKEY, { expiresIn: 3600 });
          res.status(200).json({ message: "Done already exist and login", token, status: 200 });
        } else {
          const newUser = await userModel.insertMany({ userName: name, firstName, lastName, email, confirmed: true, profilePic: photoUrl });
          const token = jwt.sign({ id: newUser._id, isLoggedIn: true }, process.env.JWTKEY, { expiresIn: 3600 });
          res.status(201).json({ message: "Done signup then login", token, status: 201 });
        }
      } else {
        res.status(400).json({ message: "in-valid google account" });
      }
    });
//   res.json("welcone to our web");
}

const uploadCoverPic = async (req, res) => {

  if (req.files.length == 0 || !req.files) {
    res.json({ message: "invalid images" });
  } else {
      let allImages= []
      for (let i = 0; i < req.files.length; i++) {
        let imageURL = `${req.protocol}://${req.headers.host}/${req.files[i].path}`;
        allImages.push(imageURL);
     
      }
         let user = await userModel.findByIdAndUpdate(req.user._id, { coverPics: allImages }, { new: true });
         res.json({ message: "updated", user });

  }
};

const getAllUsers = async (req, res) => {
    console.log(req);
    let { page, limit } = req.query;
    console.log(page, limit);
    if (!page) {
        page = 1
    }
    if (!limit) {
        limit = 4
    }
    let skipItems =(page-1) *limit
    let allUser = await userModel.find({}).select("-password").limit(limit).skip(skipItems);
    res.json({ message: "Done", allUser });
}
module.exports = { getAllUsers,signUp, confirmEmail, signIn, updateName, uploadProfilePic, uploadCoverPic, googleLogin, resendConfirmEmail };