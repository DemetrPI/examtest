import React, { useState, useEffect, useCallback } from "react";
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
// import questionsData from "./questMain.json";
import questionsData from "./questTest.json";

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
  // const [attemptedToLeave, setAttemptedToLeave] = useState(false);

  // Reset the state
  const handleRetake = () => {
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
    // setAttemptedToLeave(false);
    setQuestions(shuffledQuestions.slice(0, 6));
  };

  // Use the questions data directly
  useEffect(() => {
    const shuffledQuestions = shuffleArray(questionsData.quiz);
    setQuestions(shuffledQuestions.slice(0, 6));
    setCurrentQuestion(shuffledQuestions[0]);
  }, []);

  // Check on window refresh. 
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
      const totalAnswers = currentQuestion.options.length;
      const totalCorrectAnswers = currentQuestion.answer.length;
      const selectedCorrectAnswers = selectedOptions.filter((option) =>
        currentQuestion.answer.includes(option)
      );
      const selectedWrongAnswers = selectedOptions.filter((option) =>
        !currentQuestion.answer.includes(option)
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
    setScore((currentScore) => parseFloat((currentScore + questionScore).toFixed(2)));
  
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
  }, [score]); // add any other dependencies of handleFinish here
  
  

  // useEffect(() => {
  //   window.onblur = () => {
  //     if (attemptedToLeave) {
  //       // End the quiz
  //       handleFinish();
  //     } else {
  //       setAttemptedToLeave(true);
  //       toast({
  //         position: "top",
  //         title: "Do not cheat!",
  //         description: "Second attempt to leave quiz window before finishing quiz will cause immediate quiz termination!",
  //         status: "warning",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   };
  //   return () => {
  //     window.onblur = null;
  //   };
  // }, [attemptedToLeave, toast, handleFinish]);
  
  
  

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
    <ChakraProvider>
      <VStack spacing={8} align="center" p={8}>
        {!isStarted ? (
          <Button onClick={() => setIsStarted(true)} colorScheme="green">
            Start Quiz!
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
