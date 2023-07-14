import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Result = ({ score, questions, userAnswers}) => {
  console.log('userAnswers:', userAnswers);
  console.log('userAnswers length:', userAnswers.length);
  console.log('questions length:', questions.length);
  
  return (
    <VStack spacing={4} align="stretch" p={8}>
      <Text fontSize="2xl">Your score: {score}</Text>
      {userAnswers.map((answer, index) => {
        const question = questions[index];
        const userAnswer = answer.userAnswer.join(", ");
        const correctAnswer = Array.isArray(question.answer)
          ? question.answer.join(", ")
          : question.answer;

        return (
          <Box key={index}>
            <Text>{answer.question}</Text>
            <Text>Your answer: {userAnswer}</Text>
            <Text>Correct answer: {correctAnswer}</Text>
          </Box>
        );
      })}
    </VStack>
  );
};

export default Result;
