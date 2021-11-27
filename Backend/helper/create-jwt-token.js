const crypto = require("crypto");

const loginToken = crypto.randomBytes(64).toString("hex");
const refreshToken = crypto.randomBytes(64).toString("hex");

console.log(`JWT_LOGIN_TOKEN=${loginToken}`);
console.log(`JWT_REFRESH_TOKEN=${refreshToken}`);
