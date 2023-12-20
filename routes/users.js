const express = require("express");
const userCtrl = require("../controllers/userController");

const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


//*______________________________GETTIG_____________________________

//* middleware auth check first if user loged in and have a token
router.get("/profile",[ auth, userCtrl.profile]);

// Getting Author Contents
router.get("/profile/:id", [auth,userCtrl.getUserId]);

// Getting all
router.get("/allUsers",[auth, userCtrl.allUsers]);

// Getting users count
router.get("/usersCount", [auth,userCtrl.getUserCount]);

// Getting user
router.get("/getUser/:search", [auth,userCtrl.getUser]);

//* ____________________________________________CREATING_______________________________

/*   router.post('/upload-profile',auth,upload.single('profile'),userCtrl.uploadProfile); */

router.post("/register", userCtrl.register);

router.post("/login", userCtrl.login);

// change password

//? ______________________________________UPDATE________________________________________
router.patch("/change-password", [auth, userCtrl.changePassword]);
router.patch("/updateProfile", [auth, userCtrl.updateProfile]);

// Updating One

//! ___________________________________DELETE__________________________________________

router.delete("/deleteUser", [auth,admin, userCtrl.deleteUser]);

module.exports = router;
