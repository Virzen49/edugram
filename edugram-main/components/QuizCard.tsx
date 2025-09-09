import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface QuizCardProps {
  question: string;
  options: string[];
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
}

export default function QuizCard({ question, options, selectedOption, onSelectOption }: QuizCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedOption === option && styles.selectedOption
            ]}
            onPress={() => onSelectOption(option)}
          >
            <View style={[
              styles.radioButton,
              selectedOption === option && styles.selectedRadio
            ]} />
            <Text style={[
              styles.optionText,
              selectedOption === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedRadio: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#92400E',
    fontWeight: '500',
  },
});