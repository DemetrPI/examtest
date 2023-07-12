import React, { useState, useEffect } from "react";
import {
  Button,
  useToast,
  VStack,
  SlideFade,
  ChakraProvider,
} from "@chakra-ui/react";
import Question from "./Question";
import ProgressBar from "./ProgressBar";
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

  const handleRetake = () => {
    // Reset the state
    setQuestions([]);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setScore(0);
    setIsFinished(false);
    setIsPaused(false);
    setTimeLeft(1 * 60);
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

  // Function to handle the submission of an answer
  const handleSubmit = () => {
    let questionScore = 0;
    if (currentQuestion["multi-answer"]) {
      const correctAnswers = currentQuestion.answer;
      const correctSelected = selectedOptions.filter((option) =>
        correctAnswers.includes(option)
      );
      questionScore = (10 / correctAnswers.length) * correctSelected.length;
    } else {
      if (selectedOptions[0] === currentQuestion.answer) {
        questionScore = 10;
      }
    }
    setScore(score + questionScore);

    // Move to the next question
    const currentIndex = questions.indexOf(currentQuestion);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
    } else {
      setIsFinished(true); // If there are no more questions, finish the quiz
      handleFinish(); // Save the results when the quiz is finished
    }

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
  };

  // Function to handle the skipping of a question
  const handleSkip = () => {
    // Move the current question to the end of the questions array
    setQuestions([
      ...questions.filter((question) => question !== currentQuestion),
      currentQuestion,
    ]);
  };

  // Function to handle the pausing and resuming of the quiz
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // Function to handle the finishing of the quiz and save the results
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

  // Function to handle the review of answers
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
          <Button onClick={() => setIsStarted(true)}>Start Quiz</Button>
        ) : (
          <>
            <SlideFade in={true} offsetY="20px">
              <ProgressBar
                progress={
                  ((questions.indexOf(currentQuestion) + 1) /
                    questions.length) *
                  100
                }
              />
            </SlideFade>
            <SlideFade in={true} offsetY="20px">
              <Timer
                key={timerKey} // Use the key here
                timeLeft={timeLeft}
                isPaused={isPaused}
                onFinish={handleFinish}
              />
            </SlideFade>
            <Button onClick={handlePauseResume}>
              {isPaused ? "Resume" : "Pause"}
            </Button>
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
            {isFinished && <Button onClick={handleRetake}>Retake Quiz</Button>}
            {isFinished && (
              <Button onClick={handleClearPreviousResults}>
                Clear Previous Results
              </Button>
            )}
            {isFinished && (
              <Button onClick={handleReview}>Review Answers</Button>
            )}
            {isFinished && (
              <Button onClick={handleViewPreviousResults}>
                View Previous Results
              </Button>
            )}
            {isFinished && (
              <Result/>
            )}
            
            
          </>
        )}
      </VStack>
    </ChakraProvider>
  );
};

export default Quiz;
