const { db } = require("./db.js");
const middy = require("@middy/core");
const { validateToken } = require("./validator/JwtAuthorizer.js");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const addQuestionToQuiz = async (event) => {
  if (event.error) {
    return {
      statusCode: event.error.statusCode,
      body: JSON.stringify({ message: event.error.message }),
    };
  }

  const { quizId } = event.pathParameters;
  const { question, answer, longitude, latitude } = JSON.parse(event.body);

  if (!question || !answer || !longitude || !latitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "All fields are required" }),
    };
  }

  const quizParams = {
    TableName: process.env.DYNAMODB_TABLE_QUIZZES,
    Key: { quizId },
  };

  try {
    const { Item: quiz } = await db.send(new GetCommand(quizParams));
    if (!quiz) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Quiz not found" }),
      };
    }

    if (quiz.creator !== event.userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not allowed to add questions to this quiz",
        }),
      };
    }

    const questionId = uuidv4();
    const newQuestion = {
      questionId,
      question,
      answer,
      coordinates: { longitude, latitude },
    };

    const questionParams = {
      TableName: process.env.DYNAMODB_TABLE_QUIZZES,
      Key: { quizId },
      UpdateExpression:
        "SET questions = list_append(if_not_exists(questions, :empty_list), :new_question)",
      ExpressionAttributeValues: {
        ":new_question": [newQuestion],
        ":empty_list": [],
      },
    };

    await db.send(new UpdateCommand(questionParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Question added successfully",
        question: newQuestion,
      }),
    };
  } catch (error) {
    console.error("Error adding question:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not add question" }),
    };
  }
};

const handler = middy(addQuestionToQuiz).use(validateToken);
module.exports = { handler };
