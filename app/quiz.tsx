import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function QuizScreen() {
  const { lessonId, type } = useLocalSearchParams<{ lessonId: string; type: string }>();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const { theme, t } = useApp();

  // Sample quiz data - you can replace this with actual API data
  const quizData = {
    'quiz-basics-1-2': {
      title: 'Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'O2', 'N2'],
          correctAnswer: 'H2O'
        },
        {
          id: 2,
          question: 'Which element has the atomic number 1?',
          options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],
          correctAnswer: 'Hydrogen'
        },
        {
          id: 3,
          question: 'What type of bond exists between hydrogen and oxygen in water?',
          options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Van der Waals force'],
          correctAnswer: 'Covalent bond'
        },
        {
          id: 4,
          question: 'Which of the following is a noble gas?',
          options: ['Nitrogen', 'Oxygen', 'Argon', 'Chlorine'],
          correctAnswer: 'Argon'
        },
        {
          id: 5,
          question: 'What is the pH of pure water at 25°C?',
          options: ['6', '7', '8', '9'],
          correctAnswer: '7'
        }
      ]
    },
    'quiz-2': {
      title: 'Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the molecular formula for glucose?',
          options: ['C6H12O6', 'C2H6O', 'CH4', 'CO2'],
          correctAnswer: 'C6H12O6'
        },
        {
          id: 2,
          question: 'Which process converts glucose to energy in cells?',
          options: ['Photosynthesis', 'Cellular respiration', 'Fermentation', 'Digestion'],
          correctAnswer: 'Cellular respiration'
        }
      ]
    },
    'quiz-1': {
      title: 'Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the result of 2x + 3 when x = 5?',
          options: ['10', '13', '15', '8'],
          correctAnswer: '13'
        },
        {
          id: 2,
          question: 'Which of the following is a variable?',
          options: ['5', '+', 'x', '='],
          correctAnswer: 'x'
        },
        {
          id: 3,
          question: 'Simplify: 3x + 2x',
          options: ['5x', '6x', '5x²', '6'],
          correctAnswer: '5x'
        }
      ]
    },
    'practice-quiz': {
      title: 'Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the coefficient in the expression 4y?',
          options: ['4', 'y', '4y', '1'],
          correctAnswer: '4'
        },
        {
          id: 2,
          question: 'Evaluate 2a + 3b when a = 4 and b = 2',
          options: ['10', '14', '16', '12'],
          correctAnswer: '14'
        }
      ]
    }
  };

  const currentQuiz = quizData[lessonId as keyof typeof quizData];

  if (!currentQuiz) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Quiz not found</Text>
        </View>
      </View>
    );
  }

  const totalQuestions = currentQuiz.questions.length;
  const currentQuestionData = currentQuiz.questions[currentQuestion];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setShowResults(true);
    // You can navigate to results page or show results modal
    // For now, we'll just show an alert-style message
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Quiz Results</Text>
        </View>
        
        <View style={styles.resultsContainer}>
          <CheckCircle size={80} color="#10B981" />
          <Text style={[styles.resultsTitle, { color: theme.text }]}>Quiz Completed!</Text>
          <Text style={[styles.scoreText, { color: theme.text }]}>
            Your Score: {score}/{totalQuestions} ({percentage}%)
          </Text>
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.submitButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{currentQuiz.title}</Text>
      </View>

      {/* Question Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.questionProgress, { color: theme.text }]}>
          Question {currentQuestion + 1}/{totalQuestions}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                backgroundColor: theme.primary 
              }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestionData.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestionData.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: theme.surface,
                  borderColor: selectedAnswer === option ? theme.primary : theme.border 
                },
                selectedAnswer === option && { borderWidth: 2 }
              ]}
              onPress={() => handleAnswerSelect(option)}
            >
              <View style={[
                styles.radioButton,
                { borderColor: selectedAnswer === option ? theme.primary : theme.border }
              ]}>
                {selectedAnswer === option && (
                  <View style={[styles.radioButtonSelected, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.navigationContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.navigationButtons}>
          {currentQuestion > 0 && (
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.border }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.navButtonText, { color: theme.text }]}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentQuestion < totalQuestions - 1 ? (
            <TouchableOpacity 
              style={[
                styles.navButton, 
                { backgroundColor: selectedAnswer ? theme.primary : theme.border }
              ]}
              onPress={handleNext}
              disabled={!selectedAnswer}
            >
              <Text style={[
                styles.navButtonText, 
                { color: selectedAnswer ? '#FFFFFF' : theme.textSecondary }
              ]}>
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={Object.keys(answers).length !== totalQuestions}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  questionProgress: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
});