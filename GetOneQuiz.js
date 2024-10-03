const { db } = require("./db.js");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

const getQuiz = async (event) => {
  const { quizId } = event.pathParameters; // Get quizId from the path parameters

  const params = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    Key: { quizId },
  };

  try {
    const { Item } = await db.send(new GetCommand(params));

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Quiz not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not retrieve the quiz" }),
    };
  }
};

module.exports = { getQuiz };
