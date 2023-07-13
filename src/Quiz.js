import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Progress,
  useToast,
  VStack,
  SlideFade,
  ChakraProvider,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Question from "./Question";
import Timer from "./Timer";
import Result from "./Result";
import questionsData from "./quest.json";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1 * 60);
  const [isStarted, setIsStarted] = useState(false);
  const toast = useToast();
  const [timerKey, setTimerKey] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [numAnswered, setNumAnswered] = useState(0);

  const handleRetake = () => {
    // Reset the state
    setQuestions([]);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setIsPaused(false);
    setTimeLeft(1 * 60);
    setCurrentQuestionIndex(0);
    setNumAnswered(0);
    setTimerKey((prevKey) => prevKey + 1); // Increment the key

    // Use the questions data directly
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions(shuffledQuestions.slice(0, 5));
    setCurrentQuestion(shuffledQuestions[0]);
  };

  useEffect(() => {
    // Use the questions data directly
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions(shuffledQuestions.slice(0, 5));
    setCurrentQuestion(shuffledQuestions[0]);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleClearPreviousResults = () => {
    localStorage.removeItem("results");
    toast({
      title: "Previous results cleared.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = () => {
    // User tries to submit an answer without selecting an option
    if (selectedOptions.length === 0) {
      toast({
        title: "No option selected.",
        description: "Please select an option before submitting.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let questionScore = 0;
    if (currentQuestion["multi-answer"]) {
      const correctAnswers = currentQuestion.answer;
      const correctSelected = selectedOptions.filter((option) =>
        correctAnswers.includes(option)
      );
      questionScore = parseFloat(
        ((10 / correctAnswers.length) * correctSelected.length).toFixed(2)
      );
    } else {
      if (selectedOptions[0] === currentQuestion.answer) {
        questionScore = 10;
      }
    }
    setScore(score + questionScore);

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(questions[nextQuestionIndex]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setIsFinished(true);
    }

    setNumAnswered(numAnswered + 1);
  };

  const handleSkip = () => {
    // Move the current question to the end of the questions array
    const remainingQuestions = questions.filter(
      (question) => question !== currentQuestion
    );
    const newQuestions = [...remainingQuestions, currentQuestion];
    setQuestions(newQuestions);

    setCurrentQuestion(newQuestions[0]);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    setIsFinished(true);
    // Store the result in local storage
    const result = { score, date: new Date().toISOString() };
    const previousResults = JSON.parse(localStorage.getItem("results")) || [];
    localStorage.setItem(
      "results",
      JSON.stringify([...previousResults, result])
    );
  };

  const handleReview = () => {
    setIsFinished(true);
  };

  const handleViewPreviousResults = () => {
    const previousResults = JSON.parse(localStorage.getItem("results")) || [];
    previousResults.forEach((result, index) => {
      toast({
        title: `Result ${index + 1}`,
        description: `Score: ${result.score}\nDate: ${new Date(
          result.date
        ).toLocaleString()}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    });
  };

  return (
    <ChakraProvider>
      <VStack spacing={8} align="center" p={8}>
        {!isStarted ? (
          <Button onClick={() => setIsStarted(true)} colorScheme="green">
            Start Quiz
          </Button>
        ) : (
          <>
            {/* Progress Bar */}
            <Progress
              colorScheme="green"
              size="md"
              value={((numAnswered + 1) / questions.length) * 100}
              isAnimated={true}
              borderRadius="5"
              width="75%"
              hasStripe
            />

            {/* Timer */}
            <SlideFade in={true} offsetY="20px">
              <Timer
                key={timerKey}
                timeLeft={timeLeft}
                isPaused={isPaused}
                onFinish={handleFinish}
              />
            </SlideFade>

            {/* Pause/Resume Button */}
            <Button
              onClick={handlePauseResume}
              colorScheme={isPaused ? "green" : "red"}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>

            {/* Current Question */}
            {currentQuestion && (
              <SlideFade in={true} offsetY="20px">
                <Question
                  question={currentQuestion}
                  selectedOptions={selectedOptions}
                  onOptionSelect={setSelectedOptions}
                  onSubmit={handleSubmit}
                  onSkip={handleSkip}
                />
              </SlideFade>
            )}

            {/* Buttons */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
              py={12}
              mb={2}
            >
              <Wrap gap="4">
                {isFinished && (
                  <WrapItem>
                    <Button onClick={handleRetake} colorScheme="green">
                      Retake Quiz
                    </Button>
                  </WrapItem>
                )}
                {isFinished && (
                  <WrapItem>
                    <Button onClick={handleClearPreviousResults} colorScheme="red">
                      Clear Previous Results
                    </Button>
                  </WrapItem>
                )}
                {isFinished && (
                  <WrapItem>
                    <Button onClick={handleReview} colorScheme="blue">
                      Review Answers
                    </Button>
                  </WrapItem>
                )}
                {isFinished && (
                  <WrapItem>
                    <Button onClick={handleViewPreviousResults} colorScheme="green">
                      View Previous Results
                    </Button>
                  </WrapItem>
                )}
              </Wrap>
            </Box>

            {/* Result */}
            {isFinished && (
              <Result
                score={score}
                questions={questions}
                userAnswers={selectedOptions}
              />
            )}
          </>
        )}
      </VStack>
    </ChakraProvider>
  );
};

export default Quiz;
