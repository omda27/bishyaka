const mongoose = require("mongoose");


// *schema like model of Country
const CountrySchema = new mongoose.Schema({
  name: { type: String, },
  dial_code: { type: String, default: "" },
  code: { type: String,  },

});

//*export to use this scehma or function in different files
module.exports = mongoose.model("Country", CountrySchema);
