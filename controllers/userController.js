const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../models/user");
const _ = require("lodash");
const { validateUserLogin } = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { CLIENT_URL } = process.env;

const userCtrl = {
  getUserId: async (req, res) => {
    try {
      //* find the user info by his id and not show the password in response

      const user = await Users.findOne({ _id: ObjectId(req.params.id) })
       
        .select("-password -__v ");
      console.log(req.params.id);
      console.log(user);
      return res
        .status(200)
        .json({ status: true, message: "Get user success", profile: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },

  register: async (req, res) => {
    //* take the inputs from user and validate them
    //* register by phone or userName just change email below to phone or userName
    const {
      userName,
      password: plainTextPassword,
    } = req.body;
    // console.log(userName.replace(/\s+/g, ''))
    //   let userNameCheck =userName.replace(/\s+/g, '')

    const validateError = validateUser(req.body);

    //* if validate error just send to user an error message
    let errors = [];

    if (validateError.error) {
      for (i = 0; i < validateError.error.details.length; i++) {
        errors[i] = validateError.error.details[i].message;
      }
      console.log(errors);
      console.log(validateError.error);
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    //* check in database by email
    //* register by phone or userName just change email below to phone or userName
    let user = await Users.findOne({ userName }).lean();

    //* if exist return an error messge
    if (user) {
      return res
        .status(400)
        .json({ status: false, message:[ "UserName already in use"] });
    }
    try {
      //* take from user userName , email and password and not care for any value else
      user = new Users(_.pick(req.body, ["userName", "password"]));
   

      //* crypt the password using bcrypt package
      user.password = await bcrypt.hash(plainTextPassword, 10);
      //   user.userName = userNameCheck
      //* generate token that have his id
      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        "privateKey"
      );

      //* then save the user
      await user.save();

      console.log(user);

      //* send his token in header and his data in body
      // return res.header('x-auth-token', token).json(_.pick(user, ['_id', 'userName', 'email','phone','token']),token)
      return res.status(200).json({
        status: true,
        message: ["Register Success"],
        id: user._id,
        userName: user.userName,
        token: token,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message:[ error.message] });
    }
  },

  login: async (req, res) => {
    //* take the inputs from user and validate them
    const { userName, password: plainTextPassword } = req.body;

    const validateError = validateUserLogin(req.body);

    //* if validate error just send to user an error message
    console.log("error", validateError.error);
    let errors = [];

    if (validateError.error) {
      for (i = 0; i < validateError.error.details.length; i++) {
        errors[i] = validateError.error.details[i].message;
      }
      console.log(errors);
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    //* check in database by email
    let user = await Users.findOne({ userName }).lean();

    //* if not exist return an error messge
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: ["Invalid userName"] });
    }

    try {
      //* compare between password and crypted password of user
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      console.log(checkPassword);
      //* if password doesnt match return to user an error message
      if (!checkPassword) {
        return res
          .status(400)
          .json({ status: false, message: ["Invalid userName or password" ]});
      }

      //* generate token that have his id and if admin or not
      //  const token= createAccessToken(  { id: user._id, isAdmin: user.isAdmin })
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        "privateKey"
      );

      console.log(token);
      return res.status(200).json({
        status: true,
        message: ["Login Success"],
        token: token,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  profile: async (req, res) => {
    const token = req.header("x-auth-token");
    try {
      const user = jwt.verify(token, "privateKey");
      console.log(user);
      const id = user.id;
      console.log(id);

      //* find the user info by his id and not show the password at response
      const profile = await Users.findById(id)
        
        .select("-password -__v ");
      console.log(req.params.id);
      console.log(profile);
      return res
        .status(200)
        .json({ status: true, message: "Profile", profile });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },

  allUsers: async (req, res) => {
    try {

      const count = await Users.count();
      const users = await Users.find()
        
        .select("-password -__v");
      return res
        .status(200)
        .json({ status: true, message: "Get users", users ,count});
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  },

  getUser: async (req, res) => {
    let search = req.params.search;
    try {
      const users = await Users.find({ userName: search })

        .select("-password -__v ");
      return res.status(200).json({ status: true, message: "Get user", users });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  },

  getUserCount: async (req, res) => {
    let search = req.params.search;
    try {
      const users = await Users.count();
      return res.status(200).json({ status: true, message: "Get user", users });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  },

  changePassword: async (req, res) => {
    //! take the password from user and validate it
    const { oldPassword: oldPassword, password: plainTextPassword } = req.body;

    //? take the token from header
    const token = req.header("x-auth-token");

    //! validate the password if not string
    if (!plainTextPassword || typeof plainTextPassword !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Old password Invalid" });
    }
    //! validate the password if less than 8 char
    if (plainTextPassword.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password too small. Should be atleast 8 characters",
      });
    }

    try {
      //* decode the token to get user data
      const user = jwt.verify(token, "privateKey");
      /*  console.log(user) */

      //* get user id
      const userId = user.id;
      console.log(userId);

      //* check in database by email
      let userCheck = await Users.findById(ObjectId(userId)).lean();
      console.log(userCheck._id);

      console.log(userCheck.password);

      //* compare between password and crypted password of user
      const checkPassword = await bcrypt.compare(
        oldPassword,
        userCheck.password
      );

      console.log(checkPassword);
      console.log(oldPassword);
      console.log(userCheck.password);

      //* if password doesnt match return to user an error message
      if (!checkPassword) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid password" });
      }

      //* incrypt new password
      const newPassword = await bcrypt.hash(plainTextPassword, 10);

      //* find the user by id and change the password
      await Users.updateOne(
        { _id: userId },
        {
          $set: { password: newPassword },
        }
      );
      console.log(userId);
      console.log(newPassword);

      return res
        .status(200)
        .json({ status: true, message: "password changed" });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, message: error.message });
    }
  },
  updateProfile: async (req, res) => {
    const token = req.header("x-auth-token");
    const userName = req.query.userName;
    const noId = req.query.noId;


    try {
      const user = jwt.verify(token, "privateKey");

      const check = await Users.findById(ObjectId(user.id));
      if (check) {
        let result;
          if(userName == 'true'){
            result = await Users.updateOne(
              {
                _id: user.id,
              },
              {
                $set: {
                  userName: req.body.userName
                },
              }
            );
      
          }else if(noId == 'true'){
            result = await Users.updateOne(
              {
                _id: user.id,
              },
              {
                $set: {
                  noId: req.body.noId
                },
              }
            );
          }
          console.log(result);
          return res.status(202).json({ status: true, message: "Accepted" });
      } else {
        return res.status(404).json({ status: false, message: "Not Found" });
      }
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    const token = req.header("x-auth-token");
    try {
      const user = jwt.verify(token, "privateKey");

      const check = await Users.findById(ObjectId(user.id));
      if (check) {
       
        let result;

        result = await Users.deleteOne({
          _id: user.id,
        });
        console.log(result);
        return res.status(202).json({ status: true, message: "Accepted" });
      } else {
        return res.status(404).json({ status: false, message: "Not Found" });
      }
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, "privateKey", {
    expiresIn: "1m",
  });
};

module.exports = userCtrl;
