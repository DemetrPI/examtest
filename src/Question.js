import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  CheckboxGroup,
  Text,
  VStack,
  HStack,
  SlideFade,
} from "@chakra-ui/react";

const Question = ({
  question,
  selectedOptions,
  onOptionSelect,
  onSubmit,
  onSkip,
  isPaused,
  isFinished,
}) => {
  const [options, setOptions] = useState([]);

  // Convert the options to an array of objects with a selected property
  useEffect(() => {
    setOptions(
      question.options.map((option) => ({
        value: option,
        selected: selectedOptions.includes(option),
      }))
    );
  }, [question, selectedOptions]);

  // Reset selectedOptions when the question changes
  useEffect(() => {
    onOptionSelect([]);
  }, [question, onOptionSelect]);

  // If it's a multiple-answer question, toggle the selected state of the option
  const handleOptionSelect = (optionValue) => {
    let newOptions;
    if (question["multi-answer"]) {
      newOptions = options.map((option) =>
        option.value === optionValue
          ? { ...option, selected: !option.selected }
          : option
      );
      // If it's a single-answer question, deselect all other options
    } else {
      newOptions = options.map((option) => ({
        ...option,
        selected: option.value === optionValue,
      }));
    }

    // Update the selectedOptions state in the Quiz component
    setOptions(newOptions);
    const newSelectedOptions = newOptions
      .filter((option) => option.selected)
      .map((option) => option.value);
    onOptionSelect(newSelectedOptions);
  };

  // Split the question into lines
  const lines = question && question.question ? question.question.split("✑") : [];

 

  return (
    <VStack spacing={4} align="stretch"> 
      {lines.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
      {question["multi-answer"] ? (
        <CheckboxGroup value={selectedOptions}>
          {options.map((option) => (
            <SlideFade in={true} offsetY="20px" key={option.value}>
              <Checkbox
                isChecked={option.selected}
                onChange={() => handleOptionSelect(option.value)}
                isDisabled={isPaused || isFinished}
              >
                {option.value}
              </Checkbox>
            </SlideFade>
          ))}
        </CheckboxGroup>
      ) : (
        <RadioGroup value={selectedOptions[0]}>
          {options.map((option) => (
            <SlideFade in={true} offsetY="20px" key={option.value}>
              <Radio
                isChecked={option.selected}
                onChange={() => handleOptionSelect(option.value)}
                isDisabled={isPaused || isFinished}
              >
                {option.value}
              </Radio>
            </SlideFade>
          ))}
        </RadioGroup>
      )}
      <HStack>
        <Button
          onClick={onSubmit}
          colorScheme="green"
          isDisabled={isPaused || isFinished}
        >
          Submit
        </Button>
        <Button
          onClick={onSkip}
          colorScheme="teal"
          isDisabled={isPaused || isFinished}
        >
          Skip
        </Button>
      </HStack>
    </VStack>
  );
};

export default Question;
