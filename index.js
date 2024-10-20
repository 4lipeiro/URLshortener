const express = require("express");
const { sequelize } = require("./db");
const { Sequelize, DataTypes } = require("sequelize");
const session = require("express-session");
const { isAuthenticated } = require("./middlewares/auth.middleware");
const crypto = require("crypto");

function generateUniqueString(length = 5) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
  // bug 3: the generated string may contain / and some other characters that are not allowed in the url
}

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Configure session middleware
app.use(
  session({
    secret: "your_secret_key", // Replace with a secure secret in production
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // Set secure: true in production with HTTPS
  })
);

//Database
// Define a User model
const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    forget_pass: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    timestamps: true, // This will add the createdAt and updatedAt columns
  }
);
// Define the URL model
const shortUrl = sequelize.define("shortUrl", {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user: {
    type: DataTypes.INTEGER,
  },
});

// Synchronize the model with the database
sequelize
  .sync({ force: false }) // force: true will drop the table if it already exists
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Unable to sync database:", error);
  });

app.get("/", (req, res) => {
  console.log("------- session's user", req.session.user);
  console.log("------- session", req.session);
  res.render("index", { shortUrl: "" }); //key empty so it dowsnt error on the first load -> used for post to / (url shortener)
});

app.get("/login", (req, res) => {
  res.render("user/login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ where: { username } });

  if (!existingUser) {
    res.send({ message: "User does not exist" });
    return;
  }

  if (existingUser.password == password) {
    req.session.user = username;
    res.redirect("/");
  } else {
    res.send({ message: "Password is incorrect" });
    return;
  }
});

app.get("/register", (req, res) => {
  res.render("user/register");
});
app.post("/register", async (req, res) => {
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
    const user = await User.create({ username, email, password });
    //res.send(user); //{"id":1,"username":"asd","email":"asd@awsd.com","password":"asd","updatedAt":"2024-10-20T08:41:23.951Z","createdAt":"2024-10-20T08:41:23.951Z"}
    console.log("------- User created successfully:", user);
  } catch (error) {
    res.send(error.message);
  }

  //console.log("------- redirecting to login page");
  res.redirect("/login");
});

app.get("/profile", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } }); //needs async and await otherwise the query will be executed after the render!
  res.render("user/profile", { username: req.session.user, email: user.email });
});
app.post("/profile", isAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;

  //updating the user
  //getting the user from the database
  const user = await User.findOne({ where: { username: req.session.user } });
  //updating the data
  if (username) {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).send("User already exists");
    } else {
      user.username = username;
      req.session.user = username; //updating session
    }
  }

  //email ahndling has problem:
  //bug 1: if the email is the same (i.e. user doesnt want to update the email), it will error!
  //bug 2: if the email is the same but user is new, after clicking on save, it says email already exits, but if i go backward and click on save again, the app crashes!
  if (email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).send("Email already exists");
    } else {
      user.email = email;
    }
  }

  if (password) {
    user.password = password;
  }
  //saving the user with the updated data
  user.save();

  //rendering the profile page
  res.render("user/profile", { username: username, email: email });
});

app.post("/", async (req, res) => {
  const { original_url } = req.body;

  const key = generateUniqueString();

  if (req.session.user) {
    const user  = await User.findOne({ where: { username: req.session.user } });
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

  res.render("index", { shortUrl: `http://localhost:3000/u/${key}` });
});

app.get("/u/:key", async (req, res) => {
  //by using : we can access the key in req.params.key
  const dest = await shortUrl.findOne({ where: { key: req.params.key } });
  if (!dest) {
    return res.status(404).send("URL not found  :(");
  }
  res.redirect(dest.url);
});

app.get("/forget", (req, res) => {
  res.render("user/forget", { msg: "" });
});
app.post("/forget", async (req, res) => {
  const { username } = req.body;
  const randStr = generateUniqueString(20);

  const user = await User.findOne({ where: { username } });

  if (user) {
    user.forget_pass = randStr;
    console.log(`http://localhost:3000/forget/${randStr}`);
    //this link should be emailed to the user
    user.save();
  }

  res.render("user/forget", {
    msg: "email ahs been sent. Check your email for the reset link",
  });
});
app.get("/forget/:forget_key", (req, res) => {
  res.render("user/reset-password", { msg: "" });
});
app.post("/forget/:forget_key", async (req, res) => {
  const { password, confirm_password } = req.body;

  if (password == confirm_password) {
    const user = await User.findOne({
      where: { forget_pass: req.params.forget_key },
    });
    if (user) {
      user.password = password;
      user.save();
      res.render("user/reset-password", { msg: "Password has been changed!" });
    } else {
      res.render("user/reset-password", { msg: "link invalid." });
    }
  } else {
    res.render("user/reset-password", { msg: "Passwords do not match!" });
  }
});

app.get("/history", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } });
  const urls = await shortUrl.findAll({ where: { user: user.id } });
  console.log("------- history", urls);
  res.render("user/history", { links: urls });
});
app.post("/history/:id", isAuthenticated, async (req, res) => {
  const user = await User.findOne({ where: { username: req.session.user } });
  const url = await shortUrl.findOne({ where: { id: req.params.id } });

  if (url.user == user.id) {
    url.destroy();
    res.redirect("/history");
  } else {
    res.status(401).send("Unauthorized");
  }
});
//old stuff
app.get("/send", (req, res) => {
  res.send("it used res.send! Not res.render!");
});
app.get("/ejs", (req, res) => {
  res.render("archive/sample", { name: "Ali" });
});
app.post("/post", (req, res) => {
  res.send("psot!");
});

//listening on port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
