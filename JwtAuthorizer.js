const jwt = require("jsonwebtoken");

const jwtAuthorizer = (event, context, callback) => {
  // Try to get the token from the Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;

  // If no token is provided, deny access
  if (!token) {
    console.log("No token provided");
    return callback("Unauthorized"); // Deny access
  }

  try {
    // Log the token for debugging
    console.log("Token received:", token);

    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log the decoded token for debugging
    console.log("Decoded token:", decoded);

    // Set user info on the event for downstream usage
    event.user = decoded;

    // Create an IAM policy document
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: event.methodArn, // Allow access to the invoked method
        },
      ],
    };

    // Callback with success
    callback(null, {
      principalId: decoded.userId, // Set the principal ID for the request
      policyDocument,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Token verification failed:", error.message);
    callback("Unauthorized"); // Deny access
  }
};

module.exports = { jwtAuthorizer };
