const { db } = require("./db.js");
const middy = require("@middy/core");
const { validateToken } = require("./JwtAuthorizer.js");
const { GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const deleteQuizzes = async (event) => {
  const { quizId } = event.pathParameters;

  // Fetch the quiz to verify ownership
  const getParams = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    Key: { quizId },
  };

  try {
    const quizData = await db.send(new GetCommand(getParams));

    // Check if the quiz exists
    if (!quizData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Quiz not found" }),
      };
    }

    // Verify if the logged-in user is the creator of the quiz
    if (quizData.Item.creator !== event.userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Permission denied: You can only delete your own quizzes",
        }),
      };
    }

    // Proceed with deletion
    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_QUIZZES,
      Key: { quizId },
    };

    await db.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Quiz deleted successfully" }),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not delete the quiz" }),
    };
  }
};

const handler = middy(deleteQuizzes).use(validateToken);

module.exports = { handler };
