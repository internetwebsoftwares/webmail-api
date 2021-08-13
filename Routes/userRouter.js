const router = require("express").Router();
const User = require("../Models/userModel");
const isEmail = require("validator/lib/isEmail");
const bcrypt = require("bcryptjs");
const auth = require("../Middlewares/auth");

//Register a user
router.post("/register", async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.send("Please fill every field");
  }
  if (firstName.length < 3) {
    return res.send("Firstname must be of atleast 3 characters long.");
  }

  if (lastName.length < 3) {
    return res.send("Lastname must be of atleast 3 characters long.");
  }

  if (!isEmail(email)) {
    return res.send("Invalid email address.");
  }

  if (password.length < 7) {
    return res.send("Password must be of atleast 7 characters long.");
  }

  const isEmailAvailable = await User.findOne({ email });
  if (isEmailAvailable) {
    return res.send("There is already an account with this email.");
  }

  try {
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });
    const token = await user.generateAuthToken();
    await user.save();
    res.send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Login
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.send("Please fill every field");
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.send("No user found with this email");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.send("Incorrect password");
  }
  try {
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

//read all users
router.get("/users/all", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Update user
router.patch("/user/update-profile", auth, async (req, res) => {
  let availableUpdates = ["firstName", "lastName"];
  try {
    const userUpdating = Object.keys(req.body);
    const isValidOperation = userUpdating.every((update) =>
      availableUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.send("Invalid updates");
    }
    userUpdating.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send("Profile updated successfully.");
  } catch (error) {
    res.status(500).send(error);
  }
});

//Change password
router.patch("/user/password/change", auth, async (req, res) => {
  let { currPass, newPass } = req.body;
  try {
    const isPasswordCorrect = await bcrypt.compare(currPass, req.user.password);

    if (!isPasswordCorrect) {
      return res.send("Incorrect current password");
    }

    if (newPass.length < 7) {
      return res.send("Password must be of atleast 7 characters long");
    }

    req.user.password = newPass;
    await req.user.save();
    res.send("Password changed.");
  } catch (error) {
    res.status(500).send(error);
  }
});

//Logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send("Logged out successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
