const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    firstName: { type: String, maxlength: 30, required: true },
    lastName: { type: String, maxlength: 30, required: true },
    grandFatherName: { type: String, maxlength: 30 },
    email: { type: String, required: true },
    phone: { type: String, maxlength: 13 },
    password: { type: String, required: true },
    status: { type: Boolean },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next)
{
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

userSchema.methods.isValidPassword = async function (password)
{
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
  grandFatherName: Joi.string().max(30).optional().allow(""),
  email: Joi.string().email().required(),
  phone: Joi.string().max(13).optional().allow(""),
  password: Joi.string().required(),
  status: Joi.boolean().optional(),
});


module.exports = { User, userValidationSchema };
