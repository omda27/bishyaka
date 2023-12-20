const express = require("express");
const countriesCtrl = require("../controllers/countryController");

const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


//*______________________________GETTIG_____________________________

// Getting all
router.get("/allCountries", countriesCtrl.allCountry);


//* ____________________________________________CREATING_______________________________


// change password

//? ______________________________________UPDATE________________________________________

// Updating One

//! ___________________________________DELETE__________________________________________


module.exports = router;
