const router = require("express").Router();
const { signUp, confirmEmail, signIn, updateName, uploadProfilePic, uploadCoverPic, googleLogin, resendConfirmEmail, getAllUsers } = require("./controller/user.controller");
const userValidation = require("./userValditation.js") 
const handleValidation = require("../../middleware/validation.js")
const { auth } = require("../../middleware/auth.js")
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "_" + file.originalname);
  },
});
function fileFilter(req, file, cb) {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

    console.log(file);
  // To reject this file pass `false`, like so:
    if (file.mimetype == "image/jpeg") {
          cb(null, true);
    } else {
          cb(null, false);
    }


}
const endPoints = require("./endPoints.js")
// userValidation;
router.post("/user/signup", userValidation, handleValidation(), signUp);

router.post("/user/signin",userValidation[0,1], signIn);

router.patch("/user/updateName", auth(endPoints.updateName), updateName);
const upload = multer({ storage: storage, fileFilter });

router.patch("/user/addProfilePic", auth(endPoints.updateName), upload.single('avatar'), uploadProfilePic);
router.patch("/user/addCoverPic", auth(endPoints.updateName), upload.array("avatar"), uploadCoverPic);

router.post("/user/googleLogin", googleLogin);
router.get("/user/allUsers",getAllUsers)

router.get("/user/confirm/:token", confirmEmail)
router.get("/user/resend_confirmation/:token", resendConfirmEmail);




module.exports = router;