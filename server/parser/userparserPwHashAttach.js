const users = require("../import/usersImport.json");
const pwHashes = require("../convertToUserPwHashes.json");
const fs = require("fs");

users.forEach((user) => {
  const found = pwHashes.find((e) => e.email == user.email);

  if (found) {
    user.password = found.password;
    user.birthday = found.birthday;
  }
});

fs.writeFile("users2.json", JSON.stringify(users, null, 2), "utf8", (err) => {
  console.log(err);
});
