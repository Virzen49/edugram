import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Grid3X3, RefreshCw, Award, Zap, AlertCircle, CheckCircle, XCircle, Beaker, Calculator, Target, Atom, TrendingUp } from 'lucide-react-native';
import { updateProfileStats } from './api/auth';

const { width, height } = Dimensions.get('window');

// Puzzle Game Data Structure
const PUZZLE_SUBJECTS = {
  chemistry: {
    name: 'Chemistry',
    icon: Beaker,
    gradient: ['#10B981', '#059669'],
    modules: {
      atoms: {
        name: 'Atoms',
        icon: Atom,
        gradient: ['#8B5CF6', '#A855F7'],
        puzzles: [
          {
            id: 1,
            difficulty: 'easy',
            question: 'What is the smallest unit of ordinary matter that forms a chemical element?',
            answer: 'ATOM',
            hint: 'It consists of a nucleus and electrons',
            explanation: 'An atom is the basic unit of a chemical element, consisting of a nucleus and electrons.'
          },
          {
            id: 2,
            difficulty: 'easy',
            question: 'What is the negatively charged subatomic particle that orbits the nucleus?',
            answer: 'ELECTRON',
            hint: 'It has a much smaller mass than protons and neutrons',
            explanation: 'Electrons are negatively charged particles that orbit the nucleus of an atom.'
          },
          {
            id: 3,
            difficulty: 'easy',
            question: 'What is the positively charged particle found in the nucleus of an atom?',
            answer: 'PROTON',
            hint: 'It has approximately the same mass as a neutron',
            explanation: 'Protons are positively charged particles found in the nucleus of an atom.'
          },
          {
            id: 4,
            difficulty: 'medium',
            question: 'What is the neutral subatomic particle with no electric charge?',
            answer: 'NEUTRON',
            hint: 'It is found in the nucleus along with protons',
            explanation: 'Neutrons are subatomic particles with no net electric charge, found in the nucleus.'
          },
          {
            id: 5,
            difficulty: 'medium',
            question: 'What is the dense central core of an atom containing protons and neutrons?',
            answer: 'NUCLEUS',
            hint: 'It contains most of the atom\'s mass',
            explanation: 'The nucleus is the positively charged central core of an atom, containing protons and neutrons.'
          },
          {
            id: 6,
            difficulty: 'medium',
            question: 'What is a pure substance consisting of only one type of atom?',
            answer: 'ELEMENT',
            hint: 'Examples include hydrogen, oxygen, and carbon',
            explanation: 'An element is a substance that cannot be broken down into simpler substances.'
          },
          {
            id: 7,
            difficulty: 'hard',
            question: 'What are atoms of the same element with different numbers of neutrons?',
            answer: 'ISOTOPE',
            hint: 'Carbon-12 and Carbon-14 are examples',
            explanation: 'Isotopes are variants of an element with the same number of protons but different numbers of neutrons.'
          },
          {
            id: 8,
            difficulty: 'hard',
            question: 'What is the region around the nucleus where electrons are likely to be found?',
            answer: 'ORBITAL',
            hint: 'It\'s described by a mathematical function',
            explanation: 'An orbital is a mathematical function describing the wave-like behavior of electrons.'
          },
          {
            id: 9,
            difficulty: 'hard',
            question: 'What is the outermost electron shell of an atom?',
            answer: 'VALENCE',
            hint: 'It determines the atom\'s chemical properties',
            explanation: 'The valence shell is the combining capacity of an element, determining its chemical properties.'
          },
          {
            id: 10,
            difficulty: 'medium',
            question: 'What is formed when two or more atoms are bonded together?',
            answer: 'MOLECULE',
            hint: 'Water (H2O) is an example',
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
        puzzles: [
          {
            id: 1,
            difficulty: 'easy',
            question: 'What is a symbol that represents a quantity in a mathematical expression?',
            answer: 'VARIABLE',
            hint: 'Often represented by letters like x or y',
            explanation: 'A variable is a symbol for a number we don\'t know yet.'
          },
          {
            id: 2,
            difficulty: 'easy',
            question: 'What is a mathematical statement that two expressions are equal?',
            answer: 'EQUATION',
            hint: 'It contains an equals sign (=)',
            explanation: 'An equation is a statement that the values of two mathematical expressions are equal.'
          },
          {
            id: 3,
            difficulty: 'medium',
            question: 'What is an expression consisting of variables and coefficients?',
            answer: 'POLYNOMIAL',
            hint: 'Examples include x² + 2x + 1',
            explanation: 'A polynomial is an expression of more than two algebraic terms.'
          },
          {
            id: 4,
            difficulty: 'medium',
            question: 'What is a relation between a set of inputs and a set of permissible outputs?',
            answer: 'FUNCTION',
            hint: 'Often written as f(x)',
            explanation: 'A function uniquely associates members of one set with members of another set.'
          },
          {
            id: 5,
            difficulty: 'medium',
            question: 'What is a polynomial equation of the second degree?',
            answer: 'QUADRATIC',
            hint: 'It has the form ax² + bx + c = 0',
            explanation: 'A quadratic equation is of the form ax² + bx + c = 0.'
          },
          {
            id: 6,
            difficulty: 'easy',
            question: 'What is a number that divides another number evenly?',
            answer: 'FACTOR',
            hint: '2 and 3 are factors of 6',
            explanation: 'A factor is a number that divides another number or expression evenly.'
          },
          {
            id: 7,
            difficulty: 'medium',
            question: 'What is a numerical factor in an algebraic term?',
            answer: 'COEFFICIENT',
            hint: 'In 3x, the number 3 is this',
            explanation: 'A coefficient is a multiplicative factor in some term of a polynomial.'
          },
          {
            id: 8,
            difficulty: 'easy',
            question: 'What indicates how many times a base number is multiplied by itself?',
            answer: 'EXPONENT',
            hint: 'In x³, the number 3 is this',
            explanation: 'An exponent represents the power to which a given number is to be raised.'
          },
          {
            id: 9,
            difficulty: 'hard',
            question: 'What is a statement that one quantity is greater than or less than another?',
            answer: 'INEQUALITY',
            hint: 'Uses symbols like < or >',
            explanation: 'An inequality is a statement that one quantity is greater than or less than another.'
          },
          {
            id: 10,
            difficulty: 'hard',
            question: 'What is a rectangular array of numbers arranged in rows and columns?',
            answer: 'MATRIX',
            hint: 'Used in linear algebra',
            explanation: 'A matrix is a rectangular array of quantities or expressions in rows and columns.'
          }
        ]
      }
    }
  }
};

const QUESTION_OPTIONS = [
  { value: 2, label: '2 Puzzles', duration: '~2 min', difficulty: 'Quick' },
  { value: 5, label: '5 Puzzles', duration: '~5 min', difficulty: 'Standard' },
  { value: 10, label: '10 Puzzles', duration: '~10 min', difficulty: 'Complete' }
];

type GamePhase = 'subject-selection' | 'module-selection' | 'question-selection' | 'playing' | 'results';
type GameStatus = 'playing' | 'won' | 'lost';

export default function PuzzleGameScreen() {
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
  const [gamePuzzles, setGamePuzzles] = useState<any[]>([]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [puzzlesAnswered, setPuzzlesAnswered] = useState<any[]>([]);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [celebrationAnimation] = useState(new Animated.Value(0));

  const currentPuzzle = gamePuzzles[currentPuzzleIndex];

  // Reset game for new puzzle
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
    const subjectData = PUZZLE_SUBJECTS[selectedSubject as keyof typeof PUZZLE_SUBJECTS];
    if (subjectData && selectedModule) {
      // Fix TypeScript error by properly typing the modules access
      const modules = subjectData.modules as Record<string, any>;
      const moduleData = modules[selectedModule];
      if (moduleData && moduleData.puzzles) {
        // Shuffle and select puzzles
        const shuffled = [...moduleData.puzzles].sort(() => Math.random() - 0.5);
        const selectedPuzzles = shuffled.slice(0, questionCount);
        setGamePuzzles(selectedPuzzles);
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
    setGamePuzzles([]);
    setCurrentPuzzleIndex(0);
    setScore(0);
    setPuzzlesCompleted(0);
    setPuzzlesAnswered([]);
    resetGame();
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!userAnswer.trim() || gameStatus !== 'playing' || !currentPuzzle) return;

    const isCorrect = userAnswer.trim().toUpperCase() === currentPuzzle.answer;
    
    if (isCorrect) {
      setGameStatus('won');
      const puzzleScore = Math.max(100 - (showHint ? 20 : 0), 10);
      setScore(prev => prev + puzzleScore);
      setPuzzlesCompleted(prev => prev + 1);
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

  // Next puzzle
  const nextPuzzle = () => {
    // Save current puzzle result
    const puzzleResult = {
      puzzle: currentPuzzle,
      status: gameStatus,
      usedHint: showHint,
      score: gameStatus === 'won' ? Math.max(100 - (showHint ? 20 : 0), 10) : 0
    };
    setPuzzlesAnswered(prev => [...prev, puzzleResult]);

    if (currentPuzzleIndex < gamePuzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
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
              colors={['#3B82F6', '#2563EB']}
              style={styles.selectionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Grid3X3 size={32} color="white" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.selectionTitle, { color: theme.text }]}>Puzzle Game</Text>
            <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
              Choose a subject to start learning
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {Object.entries(PUZZLE_SUBJECTS).map(([key, subject]) => {
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
    const subjectData = PUZZLE_SUBJECTS[selectedSubject as keyof typeof PUZZLE_SUBJECTS];
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
                    {module.puzzles.length} puzzles available
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
    const subjectData = PUZZLE_SUBJECTS[selectedSubject as keyof typeof PUZZLE_SUBJECTS];
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
          <Text style={[styles.title, { color: theme.text }]}>Choose Puzzles</Text>
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
              How many puzzles would you like to solve?
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

  // Puzzle Display
  const renderPuzzle = () => {
    if (!currentPuzzle) return null;
    
    return (
      <Animated.View style={[styles.puzzleContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        <Text style={[styles.puzzleTitle, { color: theme.text }]}>Solve the Puzzle:</Text>
        <View style={[styles.puzzleCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.puzzleQuestion, { color: theme.text }]}>{currentPuzzle.question}</Text>
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
    if (!currentPuzzle) return null;
    
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
              💡 {currentPuzzle.hint}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Puzzle Result for Individual Puzzles
  const renderPuzzleResult = () => {
    if (gameStatus === 'playing' || !currentPuzzle) return null;

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
            The correct answer was: <Text style={{ fontWeight: '700' }}>{currentPuzzle.answer}</Text>
          </Text>
        )}
        
        <View style={[styles.explanationCard, { backgroundColor: theme.background }]}>
          <Text style={[styles.explanationTitle, { color: theme.primary }]}>Explanation:</Text>
          <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
            {currentPuzzle.explanation}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={nextPuzzle}
        >
          <Text style={styles.nextButtonText}>
            {currentPuzzleIndex < gamePuzzles.length - 1 ? 'Next Puzzle' : 'Finish Game'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Final Results Screen
  const renderGameResults = () => {
    if (gamePhase !== 'results') return null;

    const totalPuzzles = puzzlesAnswered.length;
    const correctAnswers = puzzlesAnswered.filter(q => q.status === 'won').length;
    const totalScore = puzzlesAnswered.reduce((sum, q) => sum + q.score, 0);
    const accuracy = totalPuzzles > 0 ? (correctAnswers / totalPuzzles) * 100 : 0;

    // Update profile with game stats
    useEffect(() => {
      const updateStats = async () => {
        try {
          await updateProfileStats(totalScore, correctAnswers);
        } catch (error) {
          console.error('Error updating profile stats:', error);
        }
      };
      updateStats();
    }, []);

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
              <Text style={[styles.statNumber, { color: theme.text }]}>{totalPuzzles - correctAnswers}</Text>
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

  // Show different phases
  if (gamePhase === 'subject-selection') return renderSubjectSelection();
  if (gamePhase === 'module-selection') return renderModuleSelection();
  if (gamePhase === 'question-selection') return renderQuestionSelection();
  if (gamePhase === 'results') return renderGameResults();

  // Main puzzle game screen (playing phase)
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Puzzle Game</Text>
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
            {currentPuzzleIndex + 1}/{gamePuzzles.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Puzzle</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={[styles.statValue, { color: theme.text }]}>{puzzlesCompleted}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        {renderPuzzle()}
        {renderHintSection()}
        {renderPuzzleResult()}
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
  
  // Puzzle Display
  puzzleContainer: { alignItems: 'center', marginBottom: 24 },
  puzzleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  puzzleCard: {
    padding: 20, borderRadius: 12,
    marginBottom: 20, elevation: 2,
    width: '100%'
  },
  puzzleQuestion: { fontSize: 16, lineHeight: 22 },
  
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
  
  // Puzzle Results
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