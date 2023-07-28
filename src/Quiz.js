import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Text,
  Radio,
  RadioGroup,
  Progress,
  useToast,
  VStack,
  SlideFade,
  Wrap,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import Question from "./Question";
import Timer from "./Timer";
import Result from "./Result";
import ResultModal from "./ResultModal";
import questionsData from "./questMain.json";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
//import questionsData from "./questTest.json";

const Quiz = () => {
  // state variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [numAnswered, setNumAnswered] = useState(0);
  const [isReview, setIsReview] = useState(false);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const totalPoints = questions.length * 10;
  const [attemptedToLeave, setAttemptedToLeave] = useState(false);
  const [quizMode, setQuizMode] = useState(""); // easy, normal, hard
  const [numQuestions, setNumQuestions] = useState(0); // number of questions based on quiz mode
  const [timeDuration, setTimeDuration] = useState(0); // time duration based on quiz mode
  const [isQuizModeSelected, setIsQuizModeSelected] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  // Reset the state
  const handleRetake = () => {
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions([]);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setScore(null);
    setIsStarted(false);
    setIsFinished(false);
    setIsPaused(false);
    setTimeLeft(timeDuration);
    setCurrentQuestionIndex(0);
    setNumAnswered(0);
    setIsReview(null);
    setUserAnswers([]);
    setTimerKey((prevKey) => prevKey + 1);
    setCurrentQuestion(shuffledQuestions[0]);
    setIsQuizOver(false);
    setQuestions(shuffledQuestions.slice(0, numQuestions));
    setAttemptedToLeave(false);
    setIsQuizModeSelected(null);
  };

  // Use the questions data directly
  useEffect(() => {
    setQuestions([]);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setIsPaused(false);
    setTimeLeft(timeDuration);
    setCurrentQuestionIndex(0);
    setNumAnswered(0);
    setIsReview(false);
    setUserAnswers([]);
    setTimerKey((prevKey) => prevKey + 1);
    setCurrentQuestion(questionsData.quiz[0]);
    setIsQuizOver(false);

    // Fetch and shuffle questions based on the selected quiz mode
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions(shuffledQuestions.slice(0, numQuestions));
    setCurrentQuestion(shuffledQuestions[0]);
  }, [quizMode, numQuestions, timeDuration]);

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
      const totalAnswers = currentQuestion.options.length;
      const totalCorrectAnswers = currentQuestion.answer.length;
      const selectedCorrectAnswers = selectedOptions.filter((option) =>
        currentQuestion.answer.includes(option)
      );
      const selectedWrongAnswers = selectedOptions.filter(
        (option) => !currentQuestion.answer.includes(option)
      );

      if (
        selectedCorrectAnswers.length === totalCorrectAnswers &&
        selectedWrongAnswers.length === 0
      ) {
        // Perfect score if all correct answers are selected and no wrong answers
        questionScore = 10;
      } else {
        // Partial score based on the proportion of selected correct answers to the total number of answers
        const proportion = selectedCorrectAnswers.length / totalAnswers;
        questionScore = parseFloat((proportion * 10).toFixed(2));
      }
    } else {
      if (selectedOptions[0] === currentQuestion.answer) {
        questionScore = 10;
      }
    }

    // Use function form of setScore
    setScore((currentScore) =>
      parseFloat((currentScore + questionScore).toFixed(2))
    );

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(questions[nextQuestionIndex]);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      handleFinish();
    }

    // Add the user's answer to the userAnswers array
    setNumAnswered(numAnswered + 1);
    const answer = {
      question: currentQuestion.question,
      userAnswer: selectedOptions, // Store all selected options
    };
    setUserAnswers([...userAnswers, answer]);
  };

  //handle finish function
  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setIsQuizOver(true);
    // Store the result in local storage
    const result = { score, date: new Date().toISOString() };
    const previousResults = JSON.parse(localStorage.getItem("results")) || [];
    localStorage.setItem(
      "results",
      JSON.stringify([...previousResults, result])
    );
    window.onblur = null;
  }, [score]);

  const handleQuizModeSelect = (mode) => setQuizMode(mode);

  useEffect(() => {
    // Disable window.onblur if the quiz mode is not selected
    if (!isQuizModeSelected) {
      window.onblur = null;
    }

    // Configure the quiz based on the selected mode
    if (quizMode === "easy") {
      setNumQuestions(10);
      setTimeDuration(20 * 60); // 20 minutes
    } else if (quizMode === "normal") {
      setNumQuestions(20);
      setTimeDuration(20 * 60); // 20 minutes
      const handleWindowBlur = () => {
        // Handle window.onblur to prevent leaving the quiz
        if (attemptedToLeave) {
          handleFinish();
        } else {
          setAttemptedToLeave(true);
          toast({
            position: "top",
            title: "Do not leave the quiz window!",
            description:
              "You are not allowed to leave the quiz window during the quiz.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      };
      window.onblur = handleWindowBlur;
      return () => {
        window.onblur = null; // Clean up the event handler on component unmount
      };
    } else if (quizMode === "hard") {
      setNumQuestions(60);
      setTimeDuration(45 * 60); // 45 minutes
      const handleWindowBlur = () => {
        // End the quiz if user tries to leave the window
        handleFinish();
      };
      window.onblur = handleWindowBlur;
      return () => {
        window.onblur = null; // Clean up the event handler on component unmount
      };
    }
  }, [quizMode, isQuizModeSelected, attemptedToLeave, toast, handleFinish]);

  // Move the current question to the end of the questions array - if user skips the question
  // TODO: repair the skip function, as for now it is possible to answer a question several times on skip
  const handleSkip = () => {
    const remainingQuestions = questions.filter(
      (question) => question !== currentQuestion
    );
    const newQuestions = [...remainingQuestions];
    newQuestions.push(currentQuestion);
    setQuestions(newQuestions);
    setCurrentQuestion(newQuestions[0]);
  };

  // Timer pause function
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  //Show quiz answers function
  const handleReview = () => {
    setIsReview((prevIsReview) => !prevIsReview);
  };

  // Show previous quiz score
  const handleViewPreviousResults = () => {
    const previousResults = JSON.parse(localStorage.getItem("results")) || [];
    previousResults.forEach((result, index) => {
      const percentage = ((result.score / totalPoints) * 100).toFixed(2);
      toast({
        title: `Result ${index + 1}`,
        description: `Your Score is ${
          result.score
        } from ${totalPoints} total points, what is ${percentage}%. Quiz was taken on: ${new Date(
          result.date
        ).toLocaleString()}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const newLocal = "4";
  return (
    <Box
    p={8}
    boxShadow="0 8px 20px -5px rgba(0, 128, 128, 0.5)"
    borderRadius="md"
    background="teal.50"
    width="100%"
    maxWidth="600px"
    mx="auto"
  >
    <VStack spacing={8} align="center" p={8}>
      {/* Button for toggling the color mode */}
      <Button onClick={toggleColorMode}>
        {colorMode === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>
      {!isStarted ? (
        <>
          {/* Quiz Mode Selection */}
          <Text>Select Quiz Mode:</Text>
          <RadioGroup onChange={handleQuizModeSelect} value={quizMode}>
            <Wrap spacing={4}>
              <WrapItem>
                <Radio value="easy">Easy</Radio>
              </WrapItem>
              <WrapItem>
                <Radio value="normal">Normal</Radio>
              </WrapItem>
              <WrapItem>
                <Radio value="hard">Hard</Radio>
              </WrapItem>
            </Wrap>
          </RadioGroup>
          {/* Start Quiz Button */}
          <Button
            onClick={() => {
              setIsStarted(true);
              setIsQuizModeSelected(true);
            }}
            colorScheme="green"
            isDisabled={!quizMode}
          >
            Start Quiz!
          </Button>
        </>
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
              isQuizOver={isQuizOver}
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
                isFinished={isQuizOver}
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%"
            py={12}
            mb={2}
          >
            {/* Result */}
            {isReview && (
              <Result
                score={score}
                questions={questions}
                userAnswers={userAnswers}
              />
            )}
          </Box>
        </>
      )}
    </VStack>
    </Box>
  );
};

export default Quiz;
