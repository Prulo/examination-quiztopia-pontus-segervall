const jwt = require("jsonwebtoken");

const jwtAuthorizer = (event) => {
  const token = event.headers.Authorization;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    event.user = decoded;
    return true;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = { jwtAuthorizer };
