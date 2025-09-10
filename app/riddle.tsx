import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, FileText, RefreshCw, Award, Zap, AlertCircle, CheckCircle, XCircle, Beaker, Calculator, Target, Atom, TrendingUp } from 'lucide-react-native';
import { updateProfileStats } from './api/auth';

const { width, height } = Dimensions.get('window');

// Riddle Game Data Structure
const RIDDLE_SUBJECTS = {
  chemistry: {
    name: 'Chemistry',
    icon: Beaker,
    gradient: ['#10B981', '#059669'],
    modules: {
      atoms: {
        name: 'Atoms',
        icon: Atom,
        gradient: ['#8B5CF6', '#A855F7'],
        riddles: [
          {
            id: 1,
            difficulty: 'easy',
            question: 'I am the smallest unit of matter, with a nucleus and electrons that orbit. What am I?',
            answer: 'ATOM',
            hint: 'I am the basic building block of all elements',
            explanation: 'An atom is the smallest unit of ordinary matter that forms a chemical element, consisting of a nucleus and electrons.'
          },
          {
            id: 2,
            difficulty: 'easy',
            question: 'I am negatively charged and orbit the nucleus. I am lighter than protons and neutrons. What am I?',
            answer: 'ELECTRON',
            hint: 'I am responsible for chemical bonding',
            explanation: 'Electrons are subatomic particles with a negative electric charge that orbit the nucleus of an atom.'
          },
          {
            id: 3,
            difficulty: 'easy',
            question: 'I am found in the nucleus and have a positive charge. I balance the negative electrons. What am I?',
            answer: 'PROTON',
            hint: 'My number determines what element I am',
            explanation: 'Protons are subatomic particles with a positive electric charge found in the nucleus of an atom.'
          },
          {
            id: 4,
            difficulty: 'medium',
            question: 'I live in the nucleus with no charge at all. I help determine the isotope. What am I?',
            answer: 'NEUTRON',
            hint: 'I have almost the same mass as a proton',
            explanation: 'Neutrons are subatomic particles with no net electric charge, found in the nucleus of an atom.'
          },
          {
            id: 5,
            difficulty: 'medium',
            question: 'I am the dense center of an atom, containing protons and neutrons. What am I?',
            answer: 'NUCLEUS',
            hint: 'I contain most of the atom\'s mass',
            explanation: 'The nucleus is the positively charged central core of an atom, containing protons and neutrons.'
          },
          {
            id: 6,
            difficulty: 'medium',
            question: 'I am a pure substance made of only one type of atom. Oxygen and gold are examples of me. What am I?',
            answer: 'ELEMENT',
            hint: 'I cannot be broken down into simpler substances',
            explanation: 'An element is a pure substance consisting of only one type of atom.'
          },
          {
            id: 7,
            difficulty: 'hard',
            question: 'I am an atom of the same element but with a different number of neutrons. Carbon-12 and Carbon-14 are examples. What am I?',
            answer: 'ISOTOPE',
            hint: 'I have the same number of protons but different atomic masses',
            explanation: 'Isotopes are variants of an element with the same number of protons but different numbers of neutrons.'
          },
          {
            id: 8,
            difficulty: 'hard',
            question: 'I am the region around the nucleus where electrons are likely to be found. I am described mathematically. What am I?',
            answer: 'ORBITAL',
            hint: 'I am not a fixed path but a probability region',
            explanation: 'An orbital is a mathematical function describing the wave-like behavior of electrons in an atom.'
          },
          {
            id: 9,
            difficulty: 'hard',
            question: 'I am the outermost electron shell of an atom. I determine chemical properties. What am I?',
            answer: 'VALENCE',
            hint: 'I determine how an atom bonds with others',
            explanation: 'The valence shell is the outermost electron shell of an atom, determining its chemical properties.'
          },
          {
            id: 10,
            difficulty: 'medium',
            question: 'I am formed when two or more atoms bond together. Water is an example of me. What am I?',
            answer: 'MOLECULE',
            hint: 'I am the smallest unit of a compound',
            explanation: 'A molecule is a group of atoms bonded together, representing the smallest unit of a compound.'
          }
        ]
      }
    }
  },
  mathematics: {
    name: 'Mathematics',
    icon: Calculator,
    gradient: ['#3B82F6', '#2563EB'],
    modules: {
      algebra: {
        name: 'Algebra',
        icon: TrendingUp,
        gradient: ['#8B5CF6', '#A855F7'],
        riddles: [
          {
            id: 1,
            difficulty: 'easy',
            question: 'I am a symbol that represents an unknown quantity. I am often x or y. What am I?',
            answer: 'VARIABLE',
            hint: 'I can take on different values',
            explanation: 'A variable is a symbol that represents a quantity in a mathematical expression.'
          },
          {
            id: 2,
            difficulty: 'easy',
            question: 'I show that two expressions are equal with an = sign. What am I?',
            answer: 'EQUATION',
            hint: 'I have two sides that are balanced',
            explanation: 'An equation is a mathematical statement that two expressions are equal.'
          },
          {
            id: 3,
            difficulty: 'medium',
            question: 'I am an expression with variables and coefficients. x² + 2x + 1 is an example. What am I?',
            answer: 'POLYNOMIAL',
            hint: 'I can have one or more terms',
            explanation: 'A polynomial is an expression consisting of variables and coefficients.'
          },
          {
            id: 4,
            difficulty: 'medium',
            question: 'I relate inputs to outputs. For each input, there is exactly one output. What am I?',
            answer: 'FUNCTION',
            hint: 'I am often written as f(x)',
            explanation: 'A function is a relation between a set of inputs and a set of permissible outputs.'
          },
          {
            id: 5,
            difficulty: 'medium',
            question: 'I am a polynomial equation of the second degree. My general form is ax² + bx + c = 0. What am I?',
            answer: 'QUADRATIC',
            hint: 'I can have at most two real solutions',
            explanation: 'A quadratic equation is a polynomial equation of the second degree.'
          },
          {
            id: 6,
            difficulty: 'easy',
            question: 'I divide another number evenly with no remainder. 2 and 3 are factors of 6. What am I?',
            answer: 'FACTOR',
            hint: 'I am a divisor of another number',
            explanation: 'A factor is a number that divides another number evenly.'
          },
          {
            id: 7,
            difficulty: 'medium',
            question: 'I am a numerical factor in a term. In 3x, I am the number 3. What am I?',
            answer: 'COEFFICIENT',
            hint: 'I multiply the variable in a term',
            explanation: 'A coefficient is a numerical or constant factor in an algebraic term.'
          },
          {
            id: 8,
            difficulty: 'easy',
            question: 'I indicate how many times a base is multiplied by itself. In x³, I am the number 3. What am I?',
            answer: 'EXPONENT',
            hint: 'I show the power of a number',
            explanation: 'An exponent indicates how many times a base number is multiplied by itself.'
          },
          {
            id: 9,
            difficulty: 'hard',
            question: 'I show that one quantity is greater than or less than another. I use symbols like < or >. What am I?',
            answer: 'INEQUALITY',
            hint: 'I compare quantities that are not equal',
            explanation: 'An inequality is a relation that holds between two values when they are different.'
          },
          {
            id: 10,
            difficulty: 'hard',
            question: 'I am a rectangular array of numbers in rows and columns. I am used in linear algebra. What am I?',
            answer: 'MATRIX',
            hint: 'I can be used to solve systems of equations',
            explanation: 'A matrix is a rectangular array of numbers arranged in rows and columns.'
          }
        ]
      }
    }
  }
};

const QUESTION_OPTIONS = [
  { value: 2, label: '2 Riddles', duration: '~2 min', difficulty: 'Quick' },
  { value: 5, label: '5 Riddles', duration: '~5 min', difficulty: 'Standard' },
  { value: 10, label: '10 Riddles', duration: '~10 min', difficulty: 'Complete' }
];

type GamePhase = 'subject-selection' | 'module-selection' | 'question-selection' | 'playing' | 'results';
type GameStatus = 'playing' | 'won' | 'lost';

export default function RiddleGameScreen() {
  const router = useRouter();
  const { type, subject } = useLocalSearchParams<{
    type: string;
    subject?: string;
  }>();
  const { theme } = useApp();

  // Game flow state - Initialize based on incoming subject parameter
  const [gamePhase, setGamePhase] = useState<GamePhase>(() => {
    if (subject) {
      // If subject is provided, skip subject selection and go to module selection
      return 'module-selection';
    }
    return 'subject-selection';
  });
  
  const [selectedSubject, setSelectedSubject] = useState<string>(subject || '');
  // When subject is provided via params, also set the selected module appropriately
  const [selectedModule, setSelectedModule] = useState<string>(() => {
    if (subject === 'chemistry') {
      return 'atoms'; // Default to atoms module for chemistry
    } else if (subject === 'mathematics') {
      return 'algebra'; // Default to algebra module for mathematics
    }
    return '';
  });
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
  const [gameRiddles, setGameRiddles] = useState<any[]>([]);

  // Game state
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [riddlesCompleted, setRiddlesCompleted] = useState(0);
  const [riddlesAnswered, setRiddlesAnswered] = useState<any[]>([]);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [celebrationAnimation] = useState(new Animated.Value(0));

  const currentRiddle = gameRiddles[currentRiddleIndex];

  // Reset game for new riddle
  const resetGame = () => {
    setUserAnswer('');
    setGameStatus('playing');
    setShowHint(false);
  };

  // Handle subject selection
  const selectSubject = (subjectKey: string) => {
    setSelectedSubject(subjectKey);
    setGamePhase('module-selection');
  };

  // Handle module selection
  const selectModule = (moduleKey: string) => {
    setSelectedModule(moduleKey);
    setGamePhase('question-selection');
  };

  // Effect to automatically proceed when module is pre-selected
  useEffect(() => {
    if (subject && selectedSubject && selectedModule && gamePhase === 'module-selection') {
      // If we came from a specific subject and module is already selected, proceed to question selection
      setGamePhase('question-selection');
    }
  }, [subject, selectedSubject, selectedModule, gamePhase]);

  // Handle question count selection and start game
  const startGame = (questionCount: number) => {
    setSelectedQuestionCount(questionCount);
    const subjectData = RIDDLE_SUBJECTS[selectedSubject as keyof typeof RIDDLE_SUBJECTS];
    if (subjectData && selectedModule) {
      // Fix TypeScript error by properly typing the modules access
      const modules = subjectData.modules as Record<string, any>;
      const moduleData = modules[selectedModule];
      if (moduleData && moduleData.riddles) {
        // Shuffle and select riddles
        const shuffled = [...moduleData.riddles].sort(() => Math.random() - 0.5);
        const selectedRiddles = shuffled.slice(0, questionCount);
        setGameRiddles(selectedRiddles);
        setGamePhase('playing');
        resetGame();
      }
    }
  };

  // Restart game
  const restartGame = () => {
    setGamePhase('subject-selection');
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedQuestionCount(5);
    setGameRiddles([]);
    setCurrentRiddleIndex(0);
    setScore(0);
    setRiddlesCompleted(0);
    setRiddlesAnswered([]);
    resetGame();
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!userAnswer.trim() || gameStatus !== 'playing' || !currentRiddle) return;

    const isCorrect = userAnswer.trim().toUpperCase() === currentRiddle.answer;
    
    if (isCorrect) {
      setGameStatus('won');
      const riddleScore = Math.max(100 - (showHint ? 20 : 0), 10);
      setScore(prev => prev + riddleScore);
      setRiddlesCompleted(prev => prev + 1);
    } else {
      setGameStatus('lost');
      // Trigger shake animation for incorrect answer
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  // Next riddle
  const nextRiddle = () => {
    // Save current riddle result
    const riddleResult = {
      riddle: currentRiddle,
      status: gameStatus,
      usedHint: showHint,
      score: gameStatus === 'won' ? Math.max(100 - (showHint ? 20 : 0), 10) : 0
    };
    setRiddlesAnswered(prev => [...prev, riddleResult]);

    if (currentRiddleIndex < gameRiddles.length - 1) {
      setCurrentRiddleIndex(prev => prev + 1);
      resetGame();
    } else {
      // Game completed - show results
      setGamePhase('results');
      // Trigger celebration animation
      Animated.spring(celebrationAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    }
  };

  // Subject Selection Screen
  const renderSubjectSelection = () => {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Select Subject</Text>
        </View>

        <View style={styles.selectionContent}>
          <View style={styles.selectionHeader}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.selectionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FileText size={32} color="white" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.selectionTitle, { color: theme.text }]}>Riddle Game</Text>
            <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
              Choose a subject to start learning
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {Object.entries(RIDDLE_SUBJECTS).map(([key, subject]) => {
              const IconComponent = subject.icon;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.selectionCard, { backgroundColor: theme.surface }]}
                  onPress={() => selectSubject(key)}
                >
                  <LinearGradient
                    colors={subject.gradient as [string, string]}
                    style={styles.cardIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconComponent size={28} color="white" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{subject.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                    {Object.keys(subject.modules).length} module{Object.keys(subject.modules).length !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Module Selection Screen
  const renderModuleSelection = () => {
    const subjectData = RIDDLE_SUBJECTS[selectedSubject as keyof typeof RIDDLE_SUBJECTS];
    if (!subjectData) return null;

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (subject) {
              router.back(); // Go back to home if came from specific subject
            } else {
              setGamePhase('subject-selection'); // Go back to subject selection
            }
          }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Select Module</Text>
        </View>

        <View style={styles.selectionContent}>
          <View style={styles.selectionHeader}>
            <LinearGradient
              colors={subjectData.gradient as [string, string]}
              style={styles.selectionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <subjectData.icon size={32} color="white" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.selectionTitle, { color: theme.text }]}>{subjectData.name}</Text>
            <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
              Choose a module to practice
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {Object.entries(subjectData.modules).map(([key, module]) => {
              const IconComponent = module.icon;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.selectionCard, { backgroundColor: theme.surface }]}
                  onPress={() => selectModule(key)}
                >
                  <LinearGradient
                    colors={module.gradient as [string, string]}
                    style={styles.cardIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconComponent size={28} color="white" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{module.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                    {module.riddles.length} riddles available
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Question Count Selection Screen
  const renderQuestionSelection = () => {
    const subjectData = RIDDLE_SUBJECTS[selectedSubject as keyof typeof RIDDLE_SUBJECTS];
    // Fix TypeScript error by properly typing the modules access
    const modules = subjectData?.modules as Record<string, any>;
    const moduleData = modules?.[selectedModule];
    if (!moduleData) return null;

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setGamePhase('module-selection')}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Choose Riddles</Text>
        </View>

        <View style={styles.selectionContent}>
          <View style={styles.selectionHeader}>
            <LinearGradient
              colors={moduleData.gradient as [string, string]}
              style={styles.selectionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {React.createElement(moduleData.icon, { size: 32, color: "white", strokeWidth: 2.5 })}
            </LinearGradient>
            <Text style={[styles.selectionTitle, { color: theme.text }]}>{moduleData.name}</Text>
            <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
              How many riddles would you like to solve?
            </Text>
          </View>

          <View style={styles.questionOptions}>
            {QUESTION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.questionCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedQuestionCount === option.value && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                ]}
                onPress={() => startGame(option.value)}
              >
                <View style={[styles.questionCardHeader, { backgroundColor: theme.primary + '15' }]}>
                  <Text style={[styles.questionNumber, { color: theme.primary }]}>{option.value}</Text>
                </View>
                <Text style={[styles.questionLabel, { color: theme.text }]}>{option.label}</Text>
                <Text style={[styles.questionDuration, { color: theme.textSecondary }]}>{option.duration}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: theme.textSecondary + '20' }]}>
                  <Text style={[styles.difficultyText, { color: theme.textSecondary }]}>{option.difficulty}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Riddle Display
  const renderRiddle = () => {
    if (!currentRiddle) return null;
    
    return (
      <Animated.View style={[styles.riddleContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        <Text style={[styles.riddleTitle, { color: theme.text }]}>Solve the Riddle:</Text>
        <View style={[styles.riddleCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.riddleQuestion, { color: theme.text }]}>{currentRiddle.question}</Text>
        </View>
        
        <View style={styles.answerSection}>
          <Text style={[styles.answerLabel, { color: theme.text }]}>Your Answer:</Text>
          <View style={[styles.answerInputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TextInput
              style={[styles.answerInput, { color: theme.text }]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer..."
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={submitAnswer}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={submitAnswer}
            disabled={!userAnswer.trim() || gameStatus !== 'playing'}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Hint Section
  const renderHintSection = () => {
    if (!currentRiddle) return null;
    
    return (
      <View style={[styles.hintContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.hintButton, { backgroundColor: showHint ? theme.primary : theme.primary + '15' }]}
          onPress={() => setShowHint(!showHint)}
        >
          <AlertCircle size={16} color={showHint ? 'white' : theme.primary} />
          <Text style={[styles.hintButtonText, { color: showHint ? 'white' : theme.primary }]}>
            {showHint ? 'Hide Hint' : 'Show Hint (-20 points)'}
          </Text>
        </TouchableOpacity>
        {showHint && (
          <View style={[styles.hintCard, { backgroundColor: theme.background }]}>
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              💡 {currentRiddle.hint}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Riddle Result for Individual Riddles
  const renderRiddleResult = () => {
    if (gameStatus === 'playing' || !currentRiddle) return null;

    const isWon = gameStatus === 'won';
    return (
      <View style={[styles.resultContainer, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={isWon ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
          style={styles.resultIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isWon ? (
            <CheckCircle size={32} color="white" strokeWidth={2.5} />
          ) : (
            <XCircle size={32} color="white" strokeWidth={2.5} />
          )}
        </LinearGradient>
        
        <Text style={[styles.resultTitle, { color: theme.text }]}>
          {isWon ? 'Correct! 🎉' : 'Incorrect 😞'}
        </Text>
        
        {!isWon && (
          <Text style={[styles.resultAnswer, { color: theme.text }]}>
            The correct answer was: <Text style={{ fontWeight: '700' }}>{currentRiddle.answer}</Text>
          </Text>
        )}
        
        <View style={[styles.explanationCard, { backgroundColor: theme.background }]}>
          <Text style={[styles.explanationTitle, { color: theme.primary }]}>Explanation:</Text>
          <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
            {currentRiddle.explanation}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={nextRiddle}
        >
          <Text style={styles.nextButtonText}>
            {currentRiddleIndex < gameRiddles.length - 1 ? 'Next Riddle' : 'Finish Game'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Final Results Screen
  const renderGameResults = () => {
    if (gamePhase !== 'results') return null;

    const totalRiddles = riddlesAnswered.length;
    const correctAnswers = riddlesAnswered.filter(q => q.status === 'won').length;
    const totalScore = riddlesAnswered.reduce((sum, q) => sum + q.score, 0);
    const accuracy = totalRiddles > 0 ? (correctAnswers / totalRiddles) * 100 : 0;

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Game Results</Text>
        </View>

        <View style={styles.resultsContent}>
          {/* Overall Score Card */}
          <LinearGradient
            colors={accuracy >= 70 ? ['#10B981', '#059669'] : accuracy >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
            style={styles.scoreCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scoreContent}>
              <Award size={32} color="white" strokeWidth={2.5} />
              <Text style={styles.scoreBig}>{totalScore}</Text>
              <Text style={styles.scoreLabel}>Total Score</Text>
            </View>
          </LinearGradient>

          {/* Performance Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <CheckCircle size={24} color="#10B981" strokeWidth={2.5} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{correctAnswers}</Text>
              <Text style={[styles.statText, { color: theme.textSecondary }]}>Correct</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <XCircle size={24} color="#EF4444" strokeWidth={2.5} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{totalRiddles - correctAnswers}</Text>
              <Text style={[styles.statText, { color: theme.textSecondary }]}>Wrong</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
              <Target size={24} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{Math.round(accuracy)}%</Text>
              <Text style={[styles.statText, { color: theme.textSecondary }]}>Accuracy</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back to Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={restartGame}
            >
              <RefreshCw size={20} color="white" strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Move useEffect for updating profile stats to the top level to fix hooks order error
  const hasUpdatedStats = React.useRef(false);
  useEffect(() => {
    if (gamePhase === 'results' && riddlesAnswered.length && !hasUpdatedStats.current) {
      const totalScore = riddlesAnswered.reduce((sum, q) => sum + q.score, 0);
      const correctAnswers = riddlesAnswered.filter(q => q.status === 'won').length;
      const updateStats = async () => {
        try {
          await updateProfileStats(totalScore, correctAnswers);
        } catch (error) {
          console.error('Error updating profile stats:', error);
        }
      };
      updateStats();
      hasUpdatedStats.current = true;
    }
    if (gamePhase !== 'results') {
      hasUpdatedStats.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, riddlesAnswered]);

  // Show different phases
  if (gamePhase === 'subject-selection') return renderSubjectSelection();
  if (gamePhase === 'module-selection') return renderModuleSelection();
  if (gamePhase === 'question-selection') return renderQuestionSelection();
  if (gamePhase === 'results') return renderGameResults();

  // Main riddle game screen (playing phase)
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Riddle Game</Text>
        <TouchableOpacity 
          style={[styles.resetButtonStyle, { backgroundColor: theme.primary + '15' }]}
          onPress={restartGame}
        >
          <RefreshCw size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Award size={16} color="#F59E0B" />
          <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Score</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Zap size={16} color="#8B5CF6" />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {currentRiddleIndex + 1}/{gameRiddles.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Riddle</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={[styles.statValue, { color: theme.text }]}>{riddlesCompleted}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        {renderRiddle()}
        {renderHintSection()}
        {renderRiddleResult()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: { marginRight: 16, padding: 4 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  
  // Selection Screens
  selectionContent: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  selectionHeader: { alignItems: 'center', marginBottom: 32 },
  selectionIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, elevation: 8
  },
  selectionTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  selectionSubtitle: { fontSize: 16, textAlign: 'center', opacity: 0.8 },
  
  optionsGrid: { gap: 16 },
  selectionCard: {
    padding: 20, borderRadius: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, elevation: 4
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, textAlign: 'center' },
  
  // Basic styles
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  gameTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  actionButtonStyle: { padding: 16, borderRadius: 12, alignItems: 'center' },
  resetButtonStyle: { padding: 8, borderRadius: 20, marginLeft: 16 },
  
  // Game Styles
  gameContent: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  
  // Riddle Display
  riddleContainer: { alignItems: 'center', marginBottom: 24 },
  riddleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  riddleCard: {
    padding: 20, borderRadius: 12,
    marginBottom: 20, elevation: 2,
    width: '100%'
  },
  riddleQuestion: { fontSize: 16, lineHeight: 22 },
  
  // Answer Section
  answerSection: { width: '100%' },
  answerLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  answerInputContainer: {
    borderWidth: 2, borderRadius: 12,
    marginBottom: 16, paddingHorizontal: 16,
    paddingVertical: 12
  },
  answerInput: { fontSize: 16, fontWeight: '600' },
  submitButton: {
    padding: 16, borderRadius: 12,
    alignItems: 'center', elevation: 2
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  
  // Hint Section
  hintContainer: { padding: 16, borderRadius: 12, marginBottom: 24, elevation: 2 },
  hintButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 8, gap: 6, marginBottom: 8
  },
  hintButtonText: { fontSize: 14, fontWeight: '600' },
  hintCard: { padding: 12, borderRadius: 8, marginTop: 8 },
  hintText: { fontSize: 14, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },
  
  // Question Selection
  questionOptions: { gap: 16 },
  questionCard: {
    padding: 20, borderRadius: 16, alignItems: 'center',
    borderWidth: 2, elevation: 2
  },
  questionCardHeader: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12
  },
  questionNumber: { fontSize: 24, fontWeight: '800' },
  questionLabel: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  questionDuration: { fontSize: 14, marginBottom: 8 },
  difficultyBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  difficultyText: { fontSize: 12, fontWeight: '600' },
  
  // Game Stats
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  statCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12, gap: 6, elevation: 2
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500' },
  
  // Riddle Results
  resultContainer: {
    padding: 20, borderRadius: 16, alignItems: 'center',
    marginBottom: 20, elevation: 4
  },
  resultIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, elevation: 4
  },
  resultTitle: {
    fontSize: 20, fontWeight: '700', marginBottom: 8,
    textAlign: 'center'
  },
  resultAnswer: {
    fontSize: 16, marginBottom: 16,
    textAlign: 'center'
  },
  explanationCard: {
    padding: 16, borderRadius: 12,
    marginBottom: 20, width: '100%'
  },
  explanationTitle: {
    fontSize: 14, fontWeight: '700',
    marginBottom: 8
  },
  explanationText: {
    fontSize: 14, lineHeight: 20
  },
  nextButton: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24, elevation: 2
  },
  nextButtonText: {
    color: 'white', fontSize: 16,
    fontWeight: '700'
  },
  
  // Final Results
  resultsContent: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  scoreCard: {
    padding: 32, borderRadius: 20, alignItems: 'center',
    marginBottom: 24, elevation: 8
  },
  scoreContent: { alignItems: 'center' },
  scoreBig: { fontSize: 48, fontWeight: '800', color: 'white', marginVertical: 8 },
  scoreLabel: { fontSize: 16, fontWeight: '600', color: 'white', opacity: 0.9 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statItem: {
    flex: 1, minWidth: (width - 60) / 2, padding: 16, borderRadius: 12,
    alignItems: 'center', elevation: 2
  },
  statNumber: { fontSize: 20, fontWeight: '700', marginVertical: 4 },
  statText: { fontSize: 12, fontWeight: '500' },
  
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  primaryButton: { flexDirection: 'row', gap: 8 },
  secondaryButton: { borderWidth: 2 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryButtonText: { fontSize: 16, fontWeight: '700' },
});