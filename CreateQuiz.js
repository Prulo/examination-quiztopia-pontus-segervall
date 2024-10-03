const { db } = require("./db.js");
const middy = require("@middy/core");
const { validateToken } = require("./JwtAuthorizer.js");
const { v4: uuidv4 } = require("uuid");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");

const createQuiz = async (event) => {
  if (event.error) {
    return {
      statusCode: event.error.statusCode,
      body: JSON.stringify({ message: event.error.message }),
    };
  }

  const { quizName } = JSON.parse(event.body);

  if (!quizName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Quiz name is required" }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    Item: {
      quizId: uuidv4(),
      quizName: quizName,
      creator: event.userId,
      creatorUsername: event.username,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await db.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Quiz created successfully",
        quizId: params.Item.quizId,
      }),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not create the quiz" }),
    };
  }
};

const handler = middy(createQuiz).use(validateToken);
module.exports = { handler };
