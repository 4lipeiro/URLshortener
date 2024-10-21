const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const urlRoutes = require("./routes/url.routes");

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

// Use the routes
app.use(authRoutes);
app.use(userRoutes);
app.use(urlRoutes);

//listening on port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
