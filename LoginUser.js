const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const dynamoDBClient = new DynamoDBClient({ region: "eu-north-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const loginUser = async (event) => {
  const body = JSON.parse(event.body);
  const { userId, password } = body; // Now using userId instead of username

  if (!userId || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "User ID and password are required" }),
    };
  }

  try {
    // Fetch user from DynamoDB by userId
    const params = {
      TableName: process.env.DYNAMODB_TABLE_USERS,
      Key: { userId: userId }, // Adjust to use userId instead of username
    };
    const data = await docClient.send(new GetCommand(params));

    if (!data.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid user ID or password" }),
      };
    }

    // Compare password
    const isPasswordValid = bcrypt.compareSync(password, data.Item.password);
    if (!isPasswordValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid user ID or password" }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: data.Item.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", token }),
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error logging in",
        error: error.message,
      }),
    };
  }
};

module.exports = { loginUser };
