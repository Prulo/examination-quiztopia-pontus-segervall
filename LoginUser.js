const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const loginUser = async (event) => {
  const { username, password } = JSON.parse(event.body);

  const params = {
    TableName: process.env.DYNAMODB_TABLE_USERS,
    Key: { username },
  };

  try {
    const result = await docClient.send(new GetCommand(params));

    if (!result.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      result.Item.password
    );
    if (!isPasswordValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid password" }),
      };
    }

    const token = jwt.sign(
      { userId: result.Item.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
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
