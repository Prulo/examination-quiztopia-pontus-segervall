module.exports.createQuiz = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2)); // Log the full event object

  try {
    const { name } = JSON.parse(event.body);
    console.log("Parsed body:", { name }); // Log the parsed body

    // Check if user is attached to the event
    if (!event.user) {
      console.error("User not found in event:", event);
      throw new Error("User is not authenticated");
    }

    const userId = event.user.userId; // This is where the error occurs
    console.log("User ID:", userId); // Log userId to see if it's present

    const quizId = uuidv4(); // Generate unique quizId

    const quiz = {
      quizId,
      name,
      userId, // Associate quiz with the logged-in user
    };

    // Attempt to save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_QUIZZES,
        Item: quiz,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Quiz created successfully",
        quizId,
      }),
    };
  } catch (error) {
    console.error("Error creating quiz:", error.message); // Log the error
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating quiz",
        error: error.message,
      }),
    };
  }
};
