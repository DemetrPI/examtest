// Option component
import { Checkbox, Radio } from '@chakra-ui/react';

const Option = ({ option, onOptionSelect }) => {
  return option['multi-answer'] ? (
    <Checkbox isChecked={option.selected} onChange={() => onOptionSelect(option.value)}>
      {option.value}
    </Checkbox>
  ) : (
    <Radio isChecked={option.selected} onChange={() => onOptionSelect(option.value)}>
      {option.value}
    </Radio>
  );
};

export default Option;
