import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { X, Clock, Trophy, Star, Zap, Award, TrendingUp, RotateCcw, Target, CheckCircle2, XCircle, BookOpen, Brain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getQuiz } from './api/quiz';
import { useApp } from '@/contexts/AppContext';
import { updateProfileStats } from './api/auth';

// Remove all i18next imports and initialization as we'll use the AppContext

export default function QuizScreen() {
  const { subjectId, moduleId } = useLocalSearchParams<{ subjectId?: string; moduleId?: string }>();

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [quizData, setQuizData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const { theme, t } = useApp();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNextRef = useRef<() => void>(() => {});

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

  const totalQuestions = quizData?.questions?.length ?? 0;
  const currentQuestionData = quizData?.questions?.[currentQuestion] ?? {
    question: '',
    options: [],
    correctAnswer: '',
    difficulty: 'EASY',
    emoji: '❓'
  };

  // Animation effect for results
  useEffect(() => {
    if (showResults) {
      const correctAnswers = calculateScore();
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Reset and animate
      resultAnim.setValue(0);
      progressAnim.setValue(0);
      
      Animated.sequence([
        Animated.timing(resultAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: percentage,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showResults, totalQuestions, answers]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResults) {
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
  }, [timeLeft, timerActive, showResults]);

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

    proceedToNext();
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

  // Only run updateProfileStats once per quiz completion
  const hasUpdatedStats = useRef(false);
  useEffect(() => {
    if (showResults && quizData && Array.isArray(quizData.questions) && !hasUpdatedStats.current) {
      const correct = quizData.questions.reduce((acc: number, q: any, idx: number) => {
        return answers[idx] === q.correctAnswer ? acc + 1 : acc;
      }, 0);
      const points = correct * 100;
      const updateStats = async () => {
        try {
          await updateProfileStats(points, correct);
        } catch (error) {
          console.error('Error updating profile stats:', error);
        }
      };
      updateStats();
      hasUpdatedStats.current = true;
    }
    if (!showResults) {
      hasUpdatedStats.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults]);

  // Remove updateStats from calculateScore to avoid calling hooks conditionally
  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#10B981';
      case 'MEDIUM': return '#F59E0B';
      case 'HARD': return '#EF4444';
      default: return theme.primary;
    }
  };

  const getOptionColors = () => ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  // Get performance level and motivational content
  const getPerformanceData = (percentage: number) => {
    if (percentage >= 90) {
      return {
        level: 'exceptional',
        emoji: '🌟',
        title: t('Outstanding Performance!'),
        subtitle: t("You're absolutely brilliant!"),
        message: 'Your mastery of this topic is exceptional. You\'re ready to tackle even more challenging concepts!',
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#06B6D4'],
        badge: 'Genius',
        icon: '⚡'
      };
    } else if (percentage >= 80) {
      return {
        level: 'excellent',
        emoji: '🏆',
        title: t('Excellent Work!'),
        subtitle: t("You're doing amazing!"),
        message: 'Great job! You have a solid understanding of this material. Keep up the fantastic work!',
        color: '#10B981',
        gradient: ['#10B981', '#06B6D4'],
        badge: 'Champion',
        icon: '🎯'
      };
    } else if (percentage >= 70) {
      return {
        level: 'good',
        emoji: '💪',
        title: t('Good Progress!'),
        subtitle: t("You're on the right track!"),
        message: 'Nice work! You\'re building solid knowledge. A little more practice and you\'ll be mastering this!',
        color: '#F59E0B',
        gradient: ['#F59E0B', '#10B981'],
        badge: 'Rising Star',
        icon: '📈'
      };
    } else if (percentage >= 50) {
      return {
        level: 'developing',
        emoji: '🌱',
        title: t('Keep Growing!'),
        subtitle: t('Every expert was once a beginner'),
        message: 'You\'re making progress! Learning takes time, and you\'re building important foundations. Keep practicing!',
        color: '#06B6D4',
        gradient: ['#06B6D4', '#8B5CF6'],
        badge: 'Learner',
        icon: '🌟'
      };
    } else {
      return {
        level: 'growing',
        emoji: '🚀',
        title: t('Ready for Growth!'),
        subtitle: t('Every challenge is an opportunity'),
        message: 'This is your moment to shine! Review the explanations below and try again. You\'ve got this!',
        color: '#EF4444',
        gradient: ['#EF4444', '#F59E0B'],
        badge: 'Explorer',
        icon: '💡'
      };
    }
  };

  // --- UI starts ---

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>{t('Loading quiz...')}</Text>
      </View>
    );
  }

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>{t('❌ Quiz not found')}</Text>
      </View>
    );
  }

  if (showResults) {
    const correctAnswers = calculateScore();
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const performanceData = getPerformanceData(percentage);

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* Animated Background */}
        <LinearGradient
          colors={[performanceData.gradient[0] + '15', theme.background] as [string, string]}
          style={styles.gradientBackground}
        />
        
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.headerSection,
            {
              opacity: resultAnim,
              transform: [{
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.surface }]} 
            onPress={() => router.back()}
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceEmoji}>{performanceData.emoji}</Text>
            <Text style={[styles.performanceTitle, { color: theme.text }]}
            >
              {performanceData.title}
            </Text>
            <Text style={[styles.performanceSubtitle, { color: theme.textSecondary }]}
            >
              {performanceData.subtitle}
            </Text>
          </View>
        </Animated.View>

        {/* Score Card */}
        <Animated.View 
          style={[
            styles.scoreSection,
            {
              opacity: resultAnim,
              transform: [{
                scale: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          <LinearGradient
            colors={performanceData.gradient as [string, string]}
            style={styles.scoreCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scoreCardContent}>
              <View style={styles.scoreHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeIcon}>{performanceData.icon}</Text>
                  <Text style={styles.badgeText}>{performanceData.badge}</Text>
                </View>
                <View style={styles.scoreMainContent}>
                  <Text style={styles.scoreLabel}>{t('Your Score')}</Text>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <Text style={styles.scoreDetails}>
                    {correctAnswers}/{totalQuestions} questions • {percentage}%
                  </Text>
                </View>
              </View>
              
              {/* Animated Progress Ring */}
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressRing,
                    {
                      transform: [
                        {
                          rotate: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0deg', '360deg'],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <View style={styles.progressInner}>
                    <Text style={styles.progressText}>{percentage}%</Text>
                  </View>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          style={[
            styles.statsGrid,
            {
              opacity: resultAnim,
              transform: [{
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <CheckCircle2 size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: theme.text }]}>{correctAnswers}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('Correct')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <XCircle size={24} color="#EF4444" />
            <Text style={[styles.statValue, { color: theme.text }]}>{totalQuestions - correctAnswers}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('Missed')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Target size={24} color="#8B5CF6" />
            <Text style={[styles.statValue, { color: theme.text }]}>{Math.round((correctAnswers / totalQuestions) * 100)}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('Accuracy')}</Text>
          </View>
        </Animated.View>

        {/* Motivational Message */}
        <Animated.View 
          style={[
            styles.motivationCard,
            { backgroundColor: theme.surface },
            {
              opacity: resultAnim,
              transform: [{
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                })
              }]
            }
          ]}
        >
          <Brain size={28} color={performanceData.color} />
          <Text style={[styles.motivationText, { color: theme.text }]}>
            {performanceData.message}
          </Text>
        </Animated.View>

        {/* Detailed Explanations */}
        <Animated.View 
          style={[
            styles.explanationsSection,
            {
              opacity: resultAnim,
              transform: [{
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Detailed Review')}</Text>
          </View>
          
          {quizData.questions.map((q: any, index: number) => {
            const isCorrect = answers[index] === q.correctAnswer;
            const questionColor = isCorrect ? '#10B981' : '#EF4444';
            
            return (
              <View key={index} style={[styles.explanationCard, { backgroundColor: theme.surface }]}>
                <View style={styles.questionHeader}>
                  <View style={[styles.questionNumberContainer, { backgroundColor: questionColor + '15' }]}>
                    <Text style={[styles.questionNumberText, { color: questionColor }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.questionStatus}>
                    {isCorrect ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : (
                      <XCircle size={16} color="#EF4444" />
                    )}
                    <Text style={[styles.questionStatusText, { color: questionColor }]}>
                      {isCorrect ? t('Correct') : t('Incorrect')}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.explanationQuestionText, { color: theme.text }]}>
                  {q.question}
                </Text>
                
                {!isCorrect && (
                  <View style={styles.answerComparison}>
                    <Text style={[styles.yourAnswer, { color: '#EF4444' }]}>
                      {t('Your answer')}: {answers[index] || t('Not answered')}
                    </Text>
                    <Text style={[styles.correctAnswer, { color: '#10B981' }]}>
                      {t('Correct answer')}: {q.correctAnswer}
                    </Text>
                  </View>
                )}
                
                <View style={styles.explanationContainer}>
                  <Text style={[styles.explanationLabel, { color: theme.textSecondary }]}>
                    {t('Explanation')}:
                  </Text>
                  <Text style={[styles.explanationText, { color: theme.text }]}>
                    {q.explanation || t('No explanation provided for this question.')}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.actionSection,
            {
              opacity: resultAnim,
              transform: [{
                translateY: resultAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: performanceData.color }]} 
            onPress={() => {
              // Reset quiz state and try again
              resultAnim.setValue(0);
              progressAnim.setValue(0);
              setCurrentQuestion(0);
              setAnswers({});
              setScore(0);
              setSelectedAnswer('');
              setShowResults(false);
              setTimeLeft(20);
              setTimerActive(true);
            }}
          >
            <RotateCcw size={20} color="white" />
            <Text style={styles.primaryButtonText}>{t('Try Again')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => router.back()}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>{t('Back to Lessons')}</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
            <Text>{t('⬅ Prev')}</Text>
          </TouchableOpacity>
        )}
        {currentQuestion < totalQuestions - 1 ? (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#10B981' }]} onPress={handleNext} disabled={!selectedAnswer}>
            <Text style={{ color: '#FFF' }}>{t('Next ➡')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#8B5CF6' }]} onPress={handleSubmit} disabled={!selectedAnswer}>
            <Text style={{ color: '#FFF' }}>{t('Finish ✅')}</Text>
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
  closeButton: { 
    padding: 12, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, padding: 20 },
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  optionButton: { padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 12 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  navBtn: { padding: 12, borderRadius: 12, backgroundColor: '#EEE' },
  
  // Enhanced Results Styles
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  performanceHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  performanceEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  performanceTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  performanceSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  scoreSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  
  scoreCardGradient: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  scoreCardContent: {
    alignItems: 'center',
  },
  
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  
  badgeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  badgeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  
  scoreMainContent: {
    alignItems: 'center',
    flex: 1,
  },
  
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  scoreValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  
  scoreDetails: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  
  progressContainer: {
    marginTop: 20,
  },
  
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  motivationText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  
  explanationsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  
  explanationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  questionNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  questionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  questionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  explanationQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  
  answerComparison: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  
  yourAnswer: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  
  correctAnswer: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  explanationContainer: {
    marginTop: 12,
  },
  
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});