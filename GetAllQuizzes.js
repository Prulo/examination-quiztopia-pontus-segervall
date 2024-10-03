const { db } = require("./db.js");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const getAllQuizzes = async () => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    ProjectionExpression: "quizName, creatorUsername",
  };

  try {
    const data = await db.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Quizzes fetched successfully",
        quizzes: data.Items,
      }),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not fetch quizzes" }),
    };
  }
};

module.exports = { getAllQuizzes };
