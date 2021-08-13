const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
    },
    clientEmailIds: {
      type: Array,
      default: [],
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

//Hashing password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  try {
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_AUTH_TOKEN
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

//Hide unnecessary info
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.tokens;
  return userObj;
};

module.exports = mongoose.model("User", userSchema);
