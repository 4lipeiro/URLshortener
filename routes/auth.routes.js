const express = require("express");
const { User } = require("../models/user.model");
const router = express.Router();
const { Sequelize } = require("sequelize");
const { generateUniqueString } = require("../utils/generateUniqueString");

router.get("/login", (req, res) => {
  res.render("user/login", { user: req.session.user });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ where: { username } });

  if (!existingUser) {
    return res.send({ message: "User does not exist" });
  }

  if (existingUser.password === password) {
    req.session.user = username;
    return res.redirect("/");
  } else {
    return res.send({ message: "Password is incorrect" });
  }
});

router.get("/register", (req, res) => {
  res.render("user/register", { user: req.session.user });
});

router.post("/register", async (req, res) => {
  // get the data from the form
  const { username, email, password, confirm_password } = req.body;

  // get the user from the database
  const existingUser = await User.findOne({
    where: {
      [Sequelize.Op.or]: [{ username }, { email }], // extended form of {username: username} is where: { username: username }
    },
  });

  //console.log("------- existing user", existingUser);

  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  if (password !== confirm_password) {
    return res.status(400).send("Passwords do not match");
  }

  if (!password) {
    return res.status(400).send("Password cannot be empty");
  }

  try {
    await User.create({ username, email, password });
    //res.send(user); //{"id":1,"username":"asd","email":"asd@awsd.com","password":"asd","updatedAt":"2024-10-20T08:41:23.951Z","createdAt":"2024-10-20T08:41:23.951Z"}
    return res.redirect("/login");
    //console.log("------- User created successfully:", user);
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/forget", (req, res) => {
  res.render("user/forget", { msg: "", user: req.session.user });
});

// Additional routes for password reset...
router.post("/forget", async (req, res) => {
  const { username } = req.body;
  const randStr = generateUniqueString(20);
  const user = await User.findOne({ where: { username } });

  if (user) {
    user.forget_pass = randStr;
    console.log(`*****   http://localhost:3000/forget/${randStr}   *****`); //this link should be emailed to the user
    user.save(); // Ensure this saves the updated user data.
  }

  res.render("user/forget", {
    msg: "email has been sent. Check your email for the reset link",
    user: req.session.user,
  });
});

// Add other routes for handling reset...
router.get("/forget/:forget_key", (req, res) => {
  res.render("user/reset-password", { msg: "", user: req.session.user });
});

router.post("/forget/:forget_key", async (req, res) => {
  const { password, confirm_password } = req.body;

  if (password === confirm_password) {
    const user = await User.findOne({
      where: { forget_pass: req.params.forget_key },
    });
    if (user) {
      user.password = password;
      user.save();
      return res.render("user/reset-password", {
        msg: "Password has been changed!",
        user: req.session.user,
      });
    } else {
      return res.render("user/reset-password", {
        msg: "link invalid.",
        user: req.session.user,
      });
    }
  } else {
    return res.render("user/reset-password", {
      msg: "Passwords do not match!",
      user: req.session.user,
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
