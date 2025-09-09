import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, Trophy, Star, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function QuizScreen() {
  const { lessonId, type } = useLocalSearchParams<{ lessonId: string; type: string }>();
  console.log('Quiz Screen - Parameters received:', { lessonId, type });
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showMotivationalCard, setShowMotivationalCard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const { theme, t } = useApp();
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Motivational flash cards data
  const motivationalCards = [
    {
      id: 1,
      title: "You're Doing Great! 🌟",
      message: "Every question you answer brings you closer to mastery!",
      icon: "🚀",
      color: "#10B981"
    },
    {
      id: 2,
      title: "Keep It Up! 💪",
      message: "Learning is a journey, and you're making amazing progress!",
      icon: "⚡",
      color: "#3B82F6"
    },
    {
      id: 3,
      title: "Brain Power! 🧠",
      message: "Your mind is growing stronger with every challenge!",
      icon: "🎯",
      color: "#8B5CF6"
    },
    {
      id: 4,
      title: "Champion Mode! 🏆",
      message: "You're building knowledge that will last a lifetime!",
      icon: "🔥",
      color: "#F59E0B"
    },
    {
      id: 5,
      title: "Superstar! ⭐",
      message: "Every expert was once a beginner. You're on the right path!",
      icon: "✨",
      color: "#EF4444"
    }
  ];

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResults && !showMotivationalCard) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Auto-submit when time runs out
      handleNext();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, showResults, showMotivationalCard]);

  // Sample quiz data - you can replace this with actual API data
  const quizData = {
    'quiz-basics-1-2': {
      title: 'Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'O2', 'N2'],
          correctAnswer: 'H2O',
          difficulty: 'EASY',
          emoji: '💧'
        },
        {
          id: 2,
          question: 'Which element has the atomic number 1?',
          options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],
          correctAnswer: 'Hydrogen',
          difficulty: 'EASY',
          emoji: '⚛️'
        },
        {
          id: 3,
          question: 'What type of bond exists between hydrogen and oxygen in water?',
          options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Van der Waals force'],
          correctAnswer: 'Covalent bond',
          difficulty: 'MEDIUM',
          emoji: '🔗'
        },
        {
          id: 4,
          question: 'Which of the following is a noble gas?',
          options: ['Nitrogen', 'Oxygen', 'Argon', 'Chlorine'],
          correctAnswer: 'Argon',
          difficulty: 'MEDIUM',
          emoji: '💨'
        },
        {
          id: 5,
          question: 'What is the pH of pure water at 25°C?',
          options: ['6', '7', '8', '9'],
          correctAnswer: '7',
          difficulty: 'HARD',
          emoji: '🧪'
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
          correctAnswer: 'C6H12O6',
          difficulty: 'MEDIUM',
          emoji: '🍬'
        },
        {
          id: 2,
          question: 'Which process converts glucose to energy in cells?',
          options: ['Photosynthesis', 'Cellular respiration', 'Fermentation', 'Digestion'],
          correctAnswer: 'Cellular respiration',
          difficulty: 'HARD',
          emoji: '⚡'
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
          correctAnswer: '13',
          difficulty: 'EASY',
          emoji: '🧮'
        },
        {
          id: 2,
          question: 'Which of the following is a variable?',
          options: ['5', '+', 'x', '='],
          correctAnswer: 'x',
          difficulty: 'EASY',
          emoji: '📝'
        },
        {
          id: 3,
          question: 'Simplify: 3x + 2x',
          options: ['5x', '6x', '5x²', '6'],
          correctAnswer: '5x',
          difficulty: 'MEDIUM',
          emoji: '➕'
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
          correctAnswer: '4',
          difficulty: 'EASY',
          emoji: '🔢'
        },
        {
          id: 2,
          question: 'Evaluate 2a + 3b when a = 4 and b = 2',
          options: ['10', '14', '16', '12'],
          correctAnswer: '14',
          difficulty: 'MEDIUM',
          emoji: '🧮'
        }
      ]
    },
    // Default quiz patterns for different subjects and modules
    'lecture-1-1': {
      title: 'Chemistry Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'O2', 'N2'],
          correctAnswer: 'H2O',
          difficulty: 'EASY',
          emoji: '💧'
        },
        {
          id: 2,
          question: 'Which element has the atomic number 1?',
          options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],
          correctAnswer: 'Hydrogen',
          difficulty: 'EASY',
          emoji: '⚛️'
        },
        {
          id: 3,
          question: 'What type of bond exists between hydrogen and oxygen in water?',
          options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Van der Waals force'],
          correctAnswer: 'Covalent bond',
          difficulty: 'MEDIUM',
          emoji: '🔗'
        }
      ]
    },
    'lecture-1-2': {
      title: 'Mathematics Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the result of 2x + 3 when x = 5?',
          options: ['10', '13', '15', '8'],
          correctAnswer: '13',
          difficulty: 'EASY',
          emoji: '🧮'
        },
        {
          id: 2,
          question: 'Which of the following is a variable?',
          options: ['5', '+', 'x', '='],
          correctAnswer: 'x',
          difficulty: 'EASY',
          emoji: '📝'
        }
      ]
    },
    'lecture-2-1': {
      title: 'Physics Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the unit of force?',
          options: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correctAnswer: 'Newton',
          difficulty: 'EASY',
          emoji: '⚡'
        },
        {
          id: 2,
          question: 'What is the speed of light in vacuum?',
          options: ['3×10^8 m/s', '3×10^6 m/s', '3×10^10 m/s', '3×10^5 m/s'],
          correctAnswer: '3×10^8 m/s',
          difficulty: 'MEDIUM',
          emoji: '🔋'
        }
      ]
    },
    // Generic quiz patterns that can work with any lessonId
    'default-quiz': {
      title: 'General Knowledge Quiz',
      questions: [
        {
          id: 1,
          question: 'What is the primary function of mitochondria in cells?',
          options: ['Protein synthesis', 'Energy production', 'DNA storage', 'Waste removal'],
          correctAnswer: 'Energy production',
          difficulty: 'MEDIUM',
          emoji: '⚡'
        },
        {
          id: 2,
          question: 'Which of the following is a renewable energy source?',
          options: ['Coal', 'Natural gas', 'Solar power', 'Nuclear power'],
          correctAnswer: 'Solar power',
          difficulty: 'EASY',
          emoji: '☀️'
        },
        {
          id: 3,
          question: 'What is the chemical formula for table salt?',
          options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'],
          correctAnswer: 'NaCl',
          difficulty: 'EASY',
          emoji: '🧂'
        }
      ]
    }
  };

  const getQuizData = (lessonId: string) => {
    console.log('Quiz lessonId received:', lessonId);
    
    // First try exact match
    if (quizData[lessonId as keyof typeof quizData]) {
      console.log('Found exact match for:', lessonId);
      return quizData[lessonId as keyof typeof quizData];
    }
    
    // Try pattern matching for lecture format
    if (lessonId?.startsWith('lecture-')) {
      // Extract subject and chapter IDs
      const parts = lessonId.split('-');
      if (parts.length >= 3) {
        const subjectId = parts[1];
        const chapterId = parts[2];
        
        // Map subject IDs to quiz types
        const subjectQuizMap: { [key: string]: keyof typeof quizData } = {
          '1': 'lecture-1-1', // Chemistry
          '2': 'lecture-1-2', // Mathematics  
          '3': 'lecture-2-1', // Physics
        };
        
        const mappedKey = subjectQuizMap[subjectId] || 'lecture-1-1';
        if (quizData[mappedKey]) {
          return quizData[mappedKey];
        }
      }
    }
    
    // Default fallback - ensure we always return a valid quiz
    console.log('Using default quiz fallback');
    return quizData['default-quiz'] || quizData['quiz-basics-1-2'] || {
      title: 'Sample Quiz',
      questions: [
        {
          id: 1,
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          difficulty: 'EASY',
          emoji: '🧮'
        }
      ]
    };
  };
  
  const currentQuiz = getQuizData(lessonId || '');
  console.log('Selected quiz:', currentQuiz?.title, 'for lessonId:', lessonId);

  if (!currentQuiz) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.gameHeader}>
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
    
    // Add animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleNext = () => {
    setTimerActive(false);
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + (timeLeft > 10 ? 250 : timeLeft > 5 ? 150 : 100));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setQuestionsAnswered(prev => prev + 1);
    
    // Show motivational card randomly after 1-2 questions
    const shouldShowCard = questionsAnswered > 0 && Math.random() < 0.4;
    
    if (shouldShowCard && currentQuestion < totalQuestions - 1) {
      setShowMotivationalCard(true);
      setTimeout(() => {
        setShowMotivationalCard(false);
        proceedToNext();
      }, 3000);
    } else {
      proceedToNext();
    }
  };
  
  const proceedToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      // Fade out current question
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(answers[currentQuestion + 1] || '');
        setTimeLeft(20);
        setTimerActive(true);
        
        // Fade in new question
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmit = () => {
    setTimerActive(false);
    
    // Check if last answer is correct
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + (timeLeft > 10 ? 250 : timeLeft > 5 ? 150 : 100));
      setStreak(prev => prev + 1);
    }
    
    setShowResults(true);
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
  
  const getRandomMotivationalCard = () => {
    return motivationalCards[Math.floor(Math.random() * motivationalCards.length)];
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#10B981';
      case 'MEDIUM': return '#F59E0B';
      case 'HARD': return '#EF4444';
      default: return theme.primary;
    }
  };
  
  const getOptionColors = () => {
    return [
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan  
      '#10B981', // Green
      '#F59E0B', // Orange
    ];
  };

  // Motivational Card Modal
  const MotivationalCard = () => {
    const card = getRandomMotivationalCard();
    
    return (
      <Modal visible={showMotivationalCard} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.motivationalCard,
              { 
                backgroundColor: card.color,
                transform: [{ scale: scaleAnim }] 
              }
            ]}
          >
            <Text style={styles.cardEmoji}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardMessage}>{card.message}</Text>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Trophy size={16} color="#FFFFFF" />
                <Text style={styles.statText}>{score} pts</Text>
              </View>
              <View style={styles.statItem}>
                <Zap size={16} color="#FFFFFF" />
                <Text style={styles.statText}>{streak} streak</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (showResults) {
    const correctAnswers = calculateScore();
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.resultsContainer}>
          <View style={[styles.resultsCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.resultsEmoji}>🏆</Text>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>Keep Practicing! 💪</Text>
            
            <View style={[styles.scoreCard, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <View style={styles.scoreStats}>
                <Text style={styles.scorePercent}>{percentage}%</Text>
                <Text style={styles.scoreCorrect}>{correctAnswers}/{totalQuestions} Correct</Text>
              </View>
            </View>
            
            <View style={styles.breakdownContainer}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>Question Breakdown</Text>
              {currentQuiz.questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                return (
                  <View key={index} style={styles.breakdownItem}>
                    <Text style={[styles.breakdownQuestion, { color: theme.textSecondary }]}>
                      Q{index + 1} {question.difficulty?.toLowerCase()}
                    </Text>
                    <View style={styles.breakdownResult}>
                      {isCorrect ? (
                        <Text style={styles.breakdownCorrect}>✓ +{question.difficulty === 'HARD' ? '200' : question.difficulty === 'MEDIUM' ? '150' : '100'}</Text>
                      ) : (
                        <Text style={styles.breakdownWrong}>✗ +0</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
            
            <TouchableOpacity 
              style={[styles.playAgainButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => router.back()}
            >
              <Text style={styles.playAgainText}>🔄 Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MotivationalCard />
      
      {/* Game Header */}
      <View style={[styles.gameHeader, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerStats}>
          <View style={styles.questionInfo}>
            <Text style={[styles.questionNumber, { color: theme.text }]}>Question {currentQuestion + 1} of {totalQuestions}</Text>
            <Text style={[styles.difficulty, { color: getDifficultyColor(currentQuestionData.difficulty || 'EASY') }]}>
              {currentQuestionData.difficulty || 'EASY'}
            </Text>
          </View>
          
          <View style={styles.timer}>
            <Clock size={16} color={timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444'} />
            <Text style={[styles.timerText, { color: timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444' }]}>
              {timeLeft}s
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                backgroundColor: '#10B981' 
              }
            ]} 
          />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Question Card */}
        <View style={[styles.questionCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.questionEmoji}>{currentQuestionData.emoji || '🤔'}</Text>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestionData.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestionData.options.map((option, index) => {
            const optionColors = getOptionColors();
            const isSelected = selectedAnswer === option;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gameOptionButton,
                  { 
                    backgroundColor: isSelected ? optionColors[index] : theme.surface,
                    borderColor: optionColors[index],
                    borderWidth: isSelected ? 0 : 2,
                    transform: [{ scale: isSelected ? 0.98 : 1 }]
                  }
                ]}
                onPress={() => handleAnswerSelect(option)}
              >
                <Text style={[styles.optionLabel, { color: isSelected ? '#FFFFFF' : optionColors[index] }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={[styles.gameOptionText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Game Navigation */}
      <View style={[styles.gameNavigation, { backgroundColor: theme.surface }]}>
        <View style={styles.gameNavButtons}>
          {currentQuestion > 0 && (
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.border }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.navButtonText, { color: theme.text }]}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.gameStats}>
            <View style={styles.statBadge}>
              <Star size={14} color="#F59E0B" />
              <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
            </View>
            <View style={styles.statBadge}>
              <Zap size={14} color="#8B5CF6" />
              <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
            </View>
          </View>
          
          {currentQuestion < totalQuestions - 1 ? (
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                { backgroundColor: selectedAnswer ? '#10B981' : theme.border }
              ]}
              onPress={handleNext}
              disabled={!selectedAnswer}
            >
              <Text style={[styles.nextButtonText, { color: selectedAnswer ? '#FFFFFF' : theme.textSecondary }]}>
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: '#8B5CF6' }]}
              onPress={handleSubmit}
              disabled={!selectedAnswer}
            >
              <Text style={styles.submitButtonText}>Finish</Text>
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
  // Game Header Styles
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  questionInfo: {
    alignItems: 'flex-start',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  questionEmoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  // Game Options
  optionsContainer: {
    gap: 16,
  },
  gameOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 16,
  },
  gameOptionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  // Game Navigation
  gameNavigation: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameNavButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
  },
  // Motivational Card Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationalCard: {
    width: '80%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 22,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Results Styles
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultsCard: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  resultsEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginVertical: 8,
  },
  scoreStats: {
    alignItems: 'center',
  },
  scorePercent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scoreCorrect: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  breakdownContainer: {
    width: '100%',
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  breakdownQuestion: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownResult: {
    alignItems: 'flex-end',
  },
  breakdownCorrect: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownWrong: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  playAgainButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Error Styles
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
