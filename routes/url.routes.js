const express = require("express");
const { User } = require("../models/user.model");
const { shortUrl } = require("../models/shorturl.model");
const { generateUniqueString } = require("../utils/generateUniqueString");
const router = express.Router();

router.get("/", (req, res) => {
  // console.log("------- session's user", req.session.user);
  // console.log("------- session", req.session);
  res.render("index", { shortUrl: "", user: req.session.user }); //key empty so it doesnt error on the first load -> used for post to / (url shortener)
});

router.post("/", async (req, res) => {
  const { original_url } = req.body;

  const key = generateUniqueString();

  if (req.session.user) {
    const user = await User.findOne({ where: { username: req.session.user } });
    await shortUrl.create({
      url: original_url,
      key,
      user: user.id,
    });
  } else {
    await shortUrl.create({
      url: original_url,
      key,
      user: 0, // 0 means the url is not associated with any user
    });
  }

  res.render("index", {
    shortUrl: `http://localhost:3000/u/${key}`,
    user: req.session.user,
  });
});

router.get("/u/:key", async (req, res) => {
  //by using ':' we can access the key in req.params.key
  const dest = await shortUrl.findOne({ where: { key: req.params.key } });
  if (!dest) {
    return res.status(404).send("URL not found  :(");
  }
  res.redirect(dest.url);
});

module.exports = router;
