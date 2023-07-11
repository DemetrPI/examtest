import React, { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

const Timer = ({ timeLeft, isPaused, onFinish }) => {
  const [remainingTime, setRemainingTime] = useState(timeLeft);

  useEffect(() => {
    if (isPaused || remainingTime <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setRemainingTime(remainingTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, remainingTime]);

  useEffect(() => {
    if (remainingTime <= 0) {
      onFinish();
    }
  }, [remainingTime, onFinish]);

  return <Text>{formatTime(remainingTime)}</Text>;
};

// Function to format the time in seconds to a MM:SS format
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return <Text fontSize="xl">`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`</Text>;
};

export default Timer;
