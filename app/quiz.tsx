import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { X, Clock, Trophy, Star, Zap } from 'lucide-react-native';
import { getQuiz } from './api/quiz';
import { useApp } from '@/contexts/AppContext';

export default function QuizScreen() {
  const { subjectId, moduleId } = useLocalSearchParams<{ subjectId?: string; moduleId?: string }>();

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
  const [quizData, setQuizData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const { theme } = useApp();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNextRef = useRef<() => void>(() => {});

  // Motivational flash cards (static)
  const motivationalCards = [
    { id: 1, title: "You're Doing Great! 🌟", message: "Every question you answer brings you closer to mastery!", icon: "🚀", color: "#10B981" },
    { id: 2, title: "Keep It Up! 💪", message: "Learning is a journey, and you're making amazing progress!", icon: "⚡", color: "#3B82F6" },
    { id: 3, title: "Brain Power! 🧠", message: "Your mind is growing stronger with every challenge!", icon: "🎯", color: "#8B5CF6" },
    { id: 4, title: "Champion Mode! 🏆", message: "You're building knowledge that will last a lifetime!", icon: "🔥", color: "#F59E0B" },
    { id: 5, title: "Superstar! ⭐", message: "Every expert was once a beginner. You're on the right path!", icon: "✨", color: "#EF4444" }
  ];

  // Fetch quiz dynamically from API
  useEffect(() => {
    const loadQuiz = async () => {
      if (!subjectId || !moduleId) return;
      setLoading(true);
      try {
        const res = await getQuiz(Number(subjectId), Number(moduleId));
        if (res.ok && res.data) {
          setQuizData(res.data);
        } else {
          setQuizData(null);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setQuizData(null);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [subjectId, moduleId]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResults && !showMotivationalCard) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      try {
        handleNextRef.current?.();
      } catch (e) {
        console.error('handleNext ref call failed', e);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, showResults, showMotivationalCard]);

  const totalQuestions = quizData?.questions?.length ?? 0;
  const currentQuestionData = quizData?.questions?.[currentQuestion] ?? {
    question: '',
    options: [],
    correctAnswer: '',
    difficulty: 'EASY',
    emoji: '❓'
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleNext = () => {
    setTimerActive(false);
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + (timeLeft > 10 ? 250 : timeLeft > 5 ? 150 : 100));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    setQuestionsAnswered(prev => prev + 1);

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

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext, currentQuestionData, selectedAnswer, timeLeft, questionsAnswered]);

  const proceedToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(answers[currentQuestion + 1] || '');
        setTimeLeft(20);
        setTimerActive(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
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
    if (selectedAnswer === currentQuestionData.correctAnswer) {
      setScore(prev => prev + (timeLeft > 10 ? 250 : timeLeft > 5 ? 150 : 100));
      setStreak(prev => prev + 1);
    }
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const getRandomMotivationalCard = () =>
    motivationalCards[Math.floor(Math.random() * motivationalCards.length)];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#10B981';
      case 'MEDIUM': return '#F59E0B';
      case 'HARD': return '#EF4444';
      default: return theme.primary;
    }
  };

  const getOptionColors = () => ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  // --- UI starts ---

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>❌ Quiz not found</Text>
      </View>
    );
  }

  if (showResults) {
    const correctAnswers = calculateScore();
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.resultsContainer}>
          <View style={[styles.resultsCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.resultsEmoji}>🏆</Text>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>Quiz Results</Text>

            <View style={[styles.scoreCard, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreCorrect}>{correctAnswers}/{totalQuestions} Correct</Text>
              <Text style={styles.scorePercent}>{percentage}%</Text>
            </View>

            <View style={styles.breakdownContainer}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>Explanations</Text>
              {quizData.questions.map((q: any, index: number) => {
                const isCorrect = answers[index] === q.correctAnswer;
                return (
                  <View key={index} style={styles.breakdownItem}>
                    <Text style={[styles.breakdownQuestion, { color: theme.textSecondary }]}>
                      Q{index + 1}: {q.question}
                    </Text>
                    <Text style={{ color: isCorrect ? '#10B981' : '#EF4444' }}>
                      {isCorrect ? '✓ Correct' : '✗ Wrong'} — {q.explanation}
                    </Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={[styles.playAgainButton, { backgroundColor: '#10B981' }]} onPress={() => router.back()}>
              <Text style={styles.playAgainText}>🔄 Back to Lessons</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Motivational Card */}
      {showMotivationalCard && (
        <Modal visible={showMotivationalCard} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.motivationalCard, { backgroundColor: getRandomMotivationalCard().color, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.cardEmoji}>{getRandomMotivationalCard().icon}</Text>
              <Text style={styles.cardTitle}>{getRandomMotivationalCard().title}</Text>
              <Text style={styles.cardMessage}>{getRandomMotivationalCard().message}</Text>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Header */}
      <View style={[styles.gameHeader, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.questionNumber, { color: theme.text }]}>
          Q{currentQuestion + 1}/{totalQuestions}
        </Text>
        <View style={styles.timer}>
          <Clock size={16} color={timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444'} />
          <Text style={{ color: timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444' }}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Question */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[styles.questionText, { color: theme.text }]}>{currentQuestionData.question}</Text>

        {/* Options */}
        {currentQuestionData.options.map((option: string, index: number) => {
          const optionColors = getOptionColors();
          const isSelected = selectedAnswer === option;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, { backgroundColor: isSelected ? optionColors[index] : theme.surface, borderColor: optionColors[index] }]}
              onPress={() => handleAnswerSelect(option)}
            >
              <Text style={{ color: isSelected ? '#FFF' : optionColors[index] }}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.navBtn} onPress={handlePrevious}>
            <Text>⬅ Prev</Text>
          </TouchableOpacity>
        )}
        {currentQuestion < totalQuestions - 1 ? (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#10B981' }]} onPress={handleNext} disabled={!selectedAnswer}>
            <Text style={{ color: '#FFF' }}>Next ➡</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#8B5CF6' }]} onPress={handleSubmit} disabled={!selectedAnswer}>
            <Text style={{ color: '#FFF' }}>Finish ✅</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  questionNumber: { fontSize: 16, fontWeight: '600' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  closeButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  optionButton: { padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 12 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  navBtn: { padding: 12, borderRadius: 12, backgroundColor: '#EEE' },
  // Results
  resultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultsCard: { borderRadius: 16, padding: 20, alignItems: 'center', width: '100%' },
  resultsEmoji: { fontSize: 48 },
  resultsTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  scoreCard: { borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { color: '#FFF', fontSize: 14 },
  scoreValue: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  scoreCorrect: { color: '#FFF' },
  scorePercent: { color: '#FFF' },
  breakdownContainer: { width: '100%', marginTop: 16 },
  breakdownTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  breakdownItem: { marginBottom: 12 },
  playAgainButton: { padding: 16, borderRadius: 12, marginTop: 16 },
  playAgainText: { color: '#FFF', fontSize: 16 },
  // Motivation
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  motivationalCard: { padding: 24, borderRadius: 20, alignItems: 'center', width: '80%' },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginVertical: 8 },
  cardMessage: { fontSize: 14, color: '#FFF', textAlign: 'center' }
});