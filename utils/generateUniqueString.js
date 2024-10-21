const crypto = require("crypto");

function generateUniqueString(length = 5) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
  // bug 3: the generated string may contain / and some other characters that are not allowed in the url
}

module.exports = { generateUniqueString };
