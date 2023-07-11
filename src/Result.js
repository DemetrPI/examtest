import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';

const Result = ({ score, questions, userAnswers, onRetake }) => {
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
        <Button onClick={onRetake}>Retake Quiz</Button>
      </VStack>
    );
  };
  
  export default Result;