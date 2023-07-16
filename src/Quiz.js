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
import ResultModal from "./ResultModal";
import questionsData from "./quest.json";

const Quiz = () => {
  // state variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1 * 10);
  const [isStarted, setIsStarted] = useState(false);
  const toast = useToast();
  const [timerKey, setTimerKey] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [numAnswered, setNumAnswered] = useState(0);
  const [isReview, setIsReview] = useState(false);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const totalPoints = questions.length * 10;

  const handleRetake = () => {
    // Reset the state
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions([]);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setScore(null);
    setIsFinished(false);
    setIsPaused(false);
    setTimeLeft(1 * 10);
    setCurrentQuestionIndex(0);
    setNumAnswered(0);
    setIsReview(null);
    setUserAnswers([]);
    setTimerKey((prevKey) => prevKey + 1);
    setCurrentQuestion(shuffledQuestions[0]);
    setIsQuizOver(false);
    setQuestions(shuffledQuestions.slice(0, 3));
  };

  useEffect(() => {
    // Use the questions data directly
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions(shuffledQuestions.slice(0, 3));
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

  // Clear previous quiz results
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
    // User tries to submit an answer without selecting an option check
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
      handleFinish();
  
      // Store the result in local storage
      const result = { score: score + questionScore, date: new Date().toISOString() };
      const previousResults = JSON.parse(localStorage.getItem("results")) || [];
      localStorage.setItem("results", JSON.stringify([...previousResults, result]));
    }
    setNumAnswered(numAnswered + 1);
    // Add the user's answer to the userAnswers array
    const answer = {
      question: currentQuestion.question,
      userAnswer: selectedOptions, // Store all selected options
    };
    setUserAnswers([...userAnswers, answer]);
  };
  
  // Move the current question to the end of the questions array
  const handleSkip = () => {
    const remainingQuestions = questions.filter(
      (question) => question !== currentQuestion
    );
    const newQuestions = [...remainingQuestions, currentQuestion];
    setQuestions(newQuestions);
    setCurrentQuestion(newQuestions[0]);
  };

  // timer pause function
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };


  // finish test function
  const handleFinish = () => {
    setIsFinished(true);
    setIsQuizOver(true);
    // Store the result in local storage
    const result = { score, date: new Date().toISOString() };
    const previousResults = JSON.parse(localStorage.getItem("results")) || [];
    localStorage.setItem(
      "results",
      JSON.stringify([...previousResults, result])
    );
  };

  //Show quiz answers function
  const handleReview = () => {
    setIsReview((prevIsReview) => !prevIsReview);
  };

  // Show previous quiz score
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

  const newLocal = "4";
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
            />

            {/* Timer */}
            <SlideFade in={true} offsetY="20px">
              <Timer
                key={timerKey}
                timeLeft={timeLeft}
                isPaused={isPaused}
                onFinish={() => {
                  if (!isQuizOver) {
                    handleFinish();
                  }
                }}
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
                  isPaused={isPaused}
                  onFinish={isFinished}
                />
              </SlideFade>
            )}
            <ResultModal
              isOpen={isFinished}
              onClose={() => setIsFinished(false)}
              score={score}
              totalPoints={totalPoints}
            />
            {/* Buttons */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
              py={12}
              mb={2}
            >
              <Wrap gap={newLocal}>
                {(isFinished || isQuizOver) && (
                  <WrapItem>
                    <Button onClick={handleRetake} colorScheme="green">
                      Retake Quiz
                    </Button>
                  </WrapItem>
                )}
                {(isFinished || isQuizOver) && (
                  <WrapItem>
                    <Button
                      onClick={handleReview}
                      colorScheme={isReview ? "blue" : "green"}
                    >
                      {isReview ? "Hide Results" : "Review Answers"}
                    </Button>
                  </WrapItem>
                )}
                {(isFinished || isQuizOver) && (
                  <WrapItem>
                    <Button
                      onClick={handleViewPreviousResults}
                      colorScheme="green"
                    >
                      View Previous Quiz Scores
                    </Button>
                  </WrapItem>
                )}
                {(isFinished || isQuizOver) && (
                  <WrapItem>
                    <Button
                      onClick={handleClearPreviousResults}
                      colorScheme="gray"
                    >
                      Clear Previous Score
                    </Button>
                  </WrapItem>
                )}
              </Wrap>
            </Box>

            {/* Result */}
            {isReview && (
              <Result
                score={score}
                questions={questions}
                userAnswers={userAnswers}
              />
            )}
          </>
        )}
      </VStack>
    </ChakraProvider>
  );
};

export default Quiz;
