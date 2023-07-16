import React, { useState, useEffect } from "react";
import { Text } from "@chakra-ui/react";

const Timer = ({ timeLeft, isPaused, onFinish, isQuizOver }) => {
  const [remainingTime, setRemainingTime] = useState(timeLeft);

  useEffect(() => {
    setRemainingTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (isPaused || remainingTime <= 0 || isQuizOver) {
      return;
    }

    const timerId = setInterval(() => {
      setRemainingTime(remainingTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, remainingTime, isQuizOver]);

  useEffect(() => {
    if (remainingTime <= 0) {
      onFinish();
    }
  }, [remainingTime, onFinish]);

  return <Text fontSize="xl">{formatTime(remainingTime)}</Text>;
};


// Function to format the time in seconds to a MM:SS format
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default Timer;
