import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";

const ResultModal = ({ isOpen, onClose, score, totalPoints }) => {
  const percentage = (score / totalPoints) * 100;

  let bgColor;
  if (percentage >= 80) {
    bgColor = "teal.300";
  } else if (percentage >= 60) {
    bgColor = "blue.300";
  } else {
    bgColor = "red.300";
  }

  let [headerMessage, mainMessage, footerMessage] = "";
  if (percentage >= 80) {
    headerMessage = "Excellent! You have passed the quiz!";
    mainMessage = `Your score is ${percentage}%, you have received ${score} of ${totalPoints} total points!`;
    footerMessage = "Great work! You are prepared for exam!";
  } else if (percentage >= 60) {
    headerMessage = "Good!";
    mainMessage = `Your score is ${percentage}%, you have received ${score} of ${totalPoints} total points!`;
    footerMessage = "Recommend you to pass the quiz again.";
  } else {
    headerMessage = "You did not pass the quiz!";
    mainMessage = `Your score is ${percentage}%,  you have received ${score} of ${totalPoints} total points!`;
    footerMessage = "Suggest you to learn a bit more.";
  }

  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />

        <ModalContent >
          <ModalHeader bg={bgColor} textAlign="center">{headerMessage}</ModalHeader>
          <ModalCloseButton onClick={onClose} />
          <ModalBody>
            <Text textAlign="center">{mainMessage}</Text>
            <Text textAlign="center">{footerMessage}</Text>
          </ModalBody>
          <ModalFooter bg={bgColor}></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ResultModal;
