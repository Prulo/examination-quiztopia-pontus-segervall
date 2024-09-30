const { v4: uuidv4 } = require("uuid");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");

const createQuiz = async (event) => {
  const token = event.headers.Authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { title, questions } = JSON.parse(event.body);

  const quizId = uuidv4();
  const params = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    Item: { quizId, title, userId: decoded.userId, questions },
  };

  try {
    await docClient.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Quiz created successfully", quizId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating quiz",
        error: error.message,
      }),
    };
  }
};

module.exports = { createQuiz };
