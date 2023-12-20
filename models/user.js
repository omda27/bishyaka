const mongoose = require("mongoose");
const joi = require("joi");

const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = joi.extend(joiPasswordExtendCore);

// *schema like model of user
const UserSchema = new mongoose.Schema({
  userName: { type: String, minlength: 3, maxlength: 44 ,unique : true,required:true},
  noId: { type: String, default: "" },
  password: { type: String, required: true, minlength: 8, maxlength: 1024 },
  isAdmin: { type: Boolean, default: false   },

});

//*validation on user inputs register
function validateUser(user) {
  const JoiSchema = joi
    .object({
      userName: joi
        .string()
        .min(3)
        .max(44).required().trim()
        .lowercase(),

      password: joiPassword
        .string()
        .minOfLowercase(8)
       
        .noWhiteSpaces()
        .required()
        .messages({
          "password.minOfLowercase":
            "{#label} يجب ان يحتوي علي الاقل {#min} احرف",
 
          "password.noWhiteSpaces": "{#label} لا يجب ان يكون فارغ",
        }),
    })
    .options({ abortEarly: false });

  return JoiSchema.validate(user);
}

//*validation on user inputs in login
function validateUserLogin(user) {
  const JoiSchema = joi
    .object({
      userName: joi
      .string()
      .min(3)
      .max(44).required().trim()
      .lowercase(),

      password: joiPassword
        .string()

        .noWhiteSpaces()
        .required(),
    })
    .options({ abortEarly: false });

  return JoiSchema.validate(user);
}

//*export to use this scehma or function in different files
module.exports = mongoose.model("User", UserSchema);

module.exports.validateUser = validateUser;
module.exports.validateUserLogin = validateUserLogin;
