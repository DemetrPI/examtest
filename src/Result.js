import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Result = ({ score, questions, userAnswers}) => {
  return (
    <VStack spacing={4} align="stretch" p={8}>
      <Text fontSize="2xl">Your score: {score}</Text>
      {questions.map((question, index) => (
        <Box key={question.question}>
          <Text>{question.question}</Text>
          <Text>Your answer: {userAnswers[index]}</Text>
          <Text>Correct answer: {question.answer}</Text>
        </Box>
      ))}
      </VStack>
  );
};

export default Result;
