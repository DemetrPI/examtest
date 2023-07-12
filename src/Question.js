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
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Convert the options to an array of objects with a selected property
    setOptions(
      question.options.map((option) => ({
        value: option,
        selected: selectedOptions.includes(option),
      }))
    );
  }, [question, selectedOptions]);

  const handleOptionSelect = (optionValue) => {
    let newOptions;
    if (question["multi-answer"] === "True") {
      // If it's a multiple-answer question, toggle the selected state of the option
      newOptions = options.map((option) =>
        option.value === optionValue
          ? { ...option, selected: !option.selected }
          : option
      );
    } else {
      // If it's a single-answer question, deselect all other options
      newOptions = options.map((option) => ({
        ...option,
        selected: option.value === optionValue,
      }));
    }

    setOptions(newOptions);

    // Update the selectedOptions state in the Quiz component
    const newSelectedOptions = newOptions
      .filter((option) => option.selected)
      .map((option) => option.value);
    onOptionSelect(newSelectedOptions);
  };



  return (
    <VStack spacing={4} align="stretch">
      <Text>{question.question}</Text>
      {question["multi-answer"] === "True" ? (
        <CheckboxGroup value={selectedOptions}>
          {options.map((option) => (
            <SlideFade in={true} offsetY="20px" key={option.value}>
              <Checkbox
                isChecked={option.selected}
                onChange={() => handleOptionSelect(option.value)}
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
              >
                {option.value}
              </Radio>
            </SlideFade>
          ))}
        </RadioGroup>
      )}
      <HStack>
        <Button onClick={onSubmit}>Submit</Button>
        <Button onClick={onSkip}>Skip</Button>
      </HStack>
    </VStack>
  );
};

export default Question;
