const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const registerUser = async (event) => {
  const { username, password } = JSON.parse(event.body);

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Username and password are required" }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const params = {
    TableName: process.env.DYNAMODB_TABLE_USERS,
    Item: { userId, username, password: hashedPassword },
  };

  try {
    await docClient.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error registering user",
        error: error.message,
      }),
    };
  }
};

module.exports = { registerUser };
