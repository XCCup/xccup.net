const users = require("../test/testdatasets/users.json");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

users.forEach((user) => {
  const tempGliders = user.gliders;
  tempGliders.forEach((glider) => {
    glider.id = uuidv4();
  });

  user.defaultGlider = tempGliders[0]?.id;
});

fs.writeFile("users2.json", JSON.stringify(users, null, 2), "utf8", (err) => {
  console.log(err);
});
