import React from 'react';
import { Progress } from '@chakra-ui/react';

const ProgressBar = ({ progress }) => {
    return <Progress colorScheme="blue" size="lg" value={progress} />;
  };

export default ProgressBar;
