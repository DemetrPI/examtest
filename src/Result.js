import React from 'react';
import { Box, Heading, Text, VStack, Divider } from '@chakra-ui/react';

const Result = ({ score, questions, userAnswers}) => {

  return (
    <VStack spacing={4} align="stretch" p={8}>
      <Text fontSize="2xl">Your score: {score}</Text>
      {userAnswers.map((answer, index) => {
        const question = questions[index];
        const userAnswer = answer.userAnswer.join(", ");
        const correctAnswer = Array.isArray(question.answer)
          ? question.answer.join(", ")
          : question.answer;

        const isAnswerCorrect = userAnswer === correctAnswer;
        const userAnswerColor = isAnswerCorrect ? "teal.300" : "red.300";
        const correctAnswerColor = isAnswerCorrect ? "teal.300" : "teal.300";

        return (
          <Box key={index}>
            <Heading as="h3" size="lg">Question #{index + 1}</Heading>
            <Text>{answer.question}</Text>
            <Text>Your answer: <Text as="span" color={userAnswerColor}>{userAnswer}</Text></Text>
            <Text>Correct answer: <Text as="span" color={correctAnswerColor}>{correctAnswer}</Text></Text>
            <Divider />
          </Box>
        );
      })}
    </VStack>
  );
};

export default Result;