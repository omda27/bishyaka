const express = require("express");
const Country = require("../models/country");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { CLIENT_URL } = process.env;

const userCtrl = {
  

  allCountry: async (req, res) => {
    try {

      // const count = await Country.count();
      const country = await Country.find()
        
        .select("-__v");
      return res
        .status(200)
        .json({ status: 1, message: "Get Country", country });
    } catch (err) {
      return res.status(500).json({ status: 0, message: err.message });
    }
  },

  
};


module.exports = userCtrl;
