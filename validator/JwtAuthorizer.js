const jwt = require("jsonwebtoken");

const validateToken = {
  before: async (request) => {
    try {
      console.log(request, "hejhej");
      const token = request.event.headers.Authorization.replace("Bearer ", "");

      console.log(token);

      if (!token) throw Error();

      const data = jwt.verify(token, process.env.JWT_SECRET);
      request.event.userId = data.userId;
      request.event.username = data.username;

      console.log(data);

      return request.response;
    } catch (error) {
      console.log(error, "validateToken");
    }
  },
};

module.exports = { validateToken };
