const express = require("express");
const { User } = require("../models/user.model");
const { shortUrl } = require("../models/shorturl.model");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/profile", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } }); //needs async and await otherwise the query will be executed after the render!
  res.render("user/profile", {
    username: req.session.user,
    email: user.email,
    user: req.session.user,
  });
});

router.post("/profile", isAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;

  //updating the user
  //getting the user from the database
  const user = await User.findOne({ where: { username: req.session.user } });
  if (!user) {
    // Handle the case where the user is not found
    console.error("User not found");
    return res.redirect("/login"); // Redirect to a login page or error page
  }

  //updating the data
  if (username) {
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.redirect("/profile"); // Use return here to prevent further execution
    } else {
      user.username = username;
      req.session.user = username; // Updating session
    }
  }
  //email ahndling has problem:
  //bug 1: if the email is the same (i.e. user doesnt want to update the email), it will CRASH!
  //bug 2: if user is the same, but email changed, doesnt work!
  if (email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.redirect("/profile"); // Use return here as well
    } else {
      user.email = email;
    }
  }
  // Updating the password
  if (password) {
    user.password = password;
  }
  //saving the user with the updated data
  await user.save();

  //rendering the profile page
  return res.render("user/profile", {
    username: user.username,
    email: user.email,
    user: req.session.user,
  });
});

router.get("/history", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } });
  const urls = await shortUrl.findAll({ where: { user: user.id } });
  //console.log("------- history", urls);
  res.render("user/history", { links: urls, user: req.session.user });
});

router.post("/history/:id", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } });
  const url = await shortUrl.findOne({ where: { id: req.params.id } });

  if (url.user === user.id) {
    await url.destroy();
    return res.redirect("/history");
  } else {
    return res.status(401).send("Unauthorized");
  }
});

module.exports = router;
