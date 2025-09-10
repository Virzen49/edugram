import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Grid3X3, RefreshCw, Award, Zap, AlertCircle, CheckCircle, XCircle, Beaker, Calculator, Target, Atom, TrendingUp } from 'lucide-react-native';
import { updateProfileStats } from './api/auth';

const { width, height } = Dimensions.get('window');

// Generate a simple Sudoku puzzle
const generateSudokuPuzzle = () => {
  // Predefined Sudoku puzzles for Chemistry (Atoms) and Mathematics (Algebra)
  const puzzles = {
    chemistry: {
      name: 'Chemistry Sudoku',
      icon: Beaker,
      gradient: ['#10B981', '#059669'],
      modules: {
        atoms: {
          name: 'Atoms',
          icon: Atom,
          gradient: ['#8B5CF6', '#A855F7'],
          grids: [
            {
              id: 1,
              difficulty: 'easy',
              initialGrid: [
                ['H', 'Li', 'Be', '', '', '', 'C', 'N', 'O'],
                ['F', '', '', 'Ne', 'Na', 'Mg', '', '', ''],
                ['', 'Al', 'Si', '', '', '', 'P', 'S', 'Cl'],
                ['', '', '', 'Ar', 'K', 'Ca', '', '', 'Sc'],
                ['Ti', '', '', '', 'V', '', '', 'Cr', 'Mn'],
                ['Fe', 'Co', 'Ni', '', '', 'Cu', 'Zn', 'Ga', 'Ge'],
                ['As', 'Se', 'Br', '', '', '', 'Kr', 'Rb', 'Sr'],
                ['', 'Y', 'Zr', 'Nb', 'Mo', '', '', 'Tc', 'Ru'],
                ['Rh', 'Pd', 'Ag', 'Cd', '', '', 'In', 'Sn', 'Sb']
              ],
              solutionGrid: [
                ['H', 'Li', 'Be', 'B', 'C', 'N', 'C', 'N', 'O'],
                ['F', 'He', 'Ne', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P'],
                ['C', 'Al', 'Si', 'P', 'S', 'Cl', 'P', 'S', 'Cl'],
                ['K', 'Ar', 'Ca', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V'],
                ['Ti', 'Cr', 'Mn', 'Fe', 'V', 'Co', 'Ni', 'Cr', 'Mn'],
                ['Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Cu', 'Zn', 'Ga', 'Ge'],
                ['As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Kr', 'Rb', 'Sr'],
                ['Y', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Tc', 'Ru'],
                ['Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'In', 'Sn', 'Sb']
              ],
              symbols: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb'],
              hint: 'Fill the grid with chemical element symbols so that each row, column, and 3x3 box contains all symbols without repetition',
              explanation: 'This is a chemistry-themed Sudoku where each cell contains a chemical element symbol. The rules are the same as traditional Sudoku but with element symbols instead of numbers.'
            },
            {
              id: 2,
              difficulty: 'medium',
              initialGrid: [
                ['H', '', 'Li', 'Be', 'B', '', 'C', 'N', ''],
                ['', 'He', '', '', 'C', 'N', 'O', 'F', 'Ne'],
                ['Na', 'Mg', 'Al', 'Si', '', 'P', 'S', 'Cl', 'Ar'],
                ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co'],
                ['Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
                ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh'],
                ['Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'],
                ['Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu'],
                ['Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf']
              ],
              solutionGrid: [
                ['H', 'He', 'Li', 'Be', 'B', 'C', 'C', 'N', 'O'],
                ['F', 'He', 'Ne', 'Na', 'C', 'N', 'O', 'F', 'Ne'],
                ['Na', 'Mg', 'Al', 'Si', 'P', 'P', 'S', 'Cl', 'Ar'],
                ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co'],
                ['Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
                ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh'],
                ['Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'],
                ['Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu'],
                ['Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf']
              ],
              symbols: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf'],
              hint: 'Complete the periodic table Sudoku with element symbols',
              explanation: 'Each row, column, and 3x3 box must contain unique element symbols from the periodic table.'
            }
          ]
        }
      }
    },
    mathematics: {
      name: 'Mathematics Sudoku',
      icon: Calculator,
      gradient: ['#3B82F6', '#2563EB'],
      modules: {
        algebra: {
          name: 'Algebra',
          icon: TrendingUp,
          gradient: ['#8B5CF6', '#A855F7'],
          grids: [
            {
              id: 1,
              difficulty: 'easy',
              initialGrid: [
                ['x', 'y', 'z', '', '', '', 'a', 'b', 'c'],
                ['d', '', '', 'e', 'f', 'g', '', '', ''],
                ['', 'h', 'i', '', '', '', 'j', 'k', 'l'],
                ['', '', '', 'm', 'n', 'o', '', '', 'p'],
                ['q', '', '', '', 'r', '', '', 's', 't'],
                ['u', 'v', 'w', '', '', 'x', 'y', 'z', 'a'],
                ['b', 'c', 'd', '', '', '', 'e', 'f', 'g'],
                ['', 'h', 'i', 'j', 'k', '', '', 'l', 'm'],
                ['n', 'o', 'p', 'q', '', '', 'r', 's', 't']
              ],
              solutionGrid: [
                ['x', 'y', 'z', 'a', 'b', 'c', 'a', 'b', 'c'],
                ['d', 'e', 'f', 'e', 'f', 'g', 'h', 'i', 'j'],
                ['g', 'h', 'i', 'j', 'k', 'l', 'j', 'k', 'l'],
                ['m', 'n', 'o', 'm', 'n', 'o', 'p', 'q', 'r'],
                ['q', 'r', 's', 'p', 'r', 's', 't', 's', 't'],
                ['u', 'v', 'w', 't', 'u', 'x', 'y', 'z', 'a'],
                ['b', 'c', 'd', 'v', 'w', 'x', 'e', 'f', 'g'],
                ['h', 'h', 'i', 'j', 'k', 'l', 'm', 'l', 'm'],
                ['n', 'o', 'p', 'q', 'r', 's', 'r', 's', 't']
              ],
              symbols: ['x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'],
              hint: 'Fill the grid with algebraic variables so that each row, column, and 3x3 box contains all symbols without repetition',
              explanation: 'This is a mathematics-themed Sudoku where each cell contains an algebraic variable. The rules are the same as traditional Sudoku but with variables instead of numbers.'
            },
            {
              id: 2,
              difficulty: 'medium',
              initialGrid: [
                ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι'],
                ['κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ'],
                ['τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'α', 'β', 'γ'],
                ['δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'],
                ['ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ'],
                ['χ', 'ψ', 'ω', 'α', 'β', 'γ', 'δ', 'ε', 'ζ'],
                ['η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο'],
                ['π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
                ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι']
              ],
              solutionGrid: [
                ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι'],
                ['κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ'],
                ['τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'α', 'β', 'γ'],
                ['δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'],
                ['ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ'],
                ['χ', 'ψ', 'ω', 'α', 'β', 'γ', 'δ', 'ε', 'ζ'],
                ['η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο'],
                ['π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
                ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι']
              ],
              symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
              hint: 'Complete the Greek alphabet Sudoku with mathematical symbols',
              explanation: 'Each row, column, and 3x3 box must contain unique Greek letters used in mathematics.'
            }
          ]
        }
      }
    }
  };
  
  return puzzles;
};

const SUDOKU_SUBJECTS = generateSudokuPuzzle();

const QUESTION_OPTIONS = [
  { value: 2, label: '2 Puzzles', duration: '~2 min', difficulty: 'Quick' },
  { value: 5, label: '5 Puzzles', duration: '~5 min', difficulty: 'Standard' },
  { value: 10, label: '10 Puzzles', duration: '~10 min', difficulty: 'Complete' }
];

type GamePhase = 'subject-selection' | 'module-selection' | 'question-selection' | 'playing' | 'results';
type GameStatus = 'playing' | 'won' | 'lost';

export default function SudokuGameScreen() {
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
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(2);
  const [gameGrids, setGameGrids] = useState<any[]>([]);

  // Game state
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [initialGrid, setInitialGrid] = useState<string[][]>([]);
  const [solutionGrid, setSolutionGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [gridsCompleted, setGridsCompleted] = useState(0);
  const [gridsAnswered, setGridsAnswered] = useState<any[]>([]);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [celebrationAnimation] = useState(new Animated.Value(0));

  const currentGrid = gameGrids[currentGridIndex];

  // Reset game for new grid
  const resetGame = () => {
    setGameStatus('playing');
    setShowHint(false);
    setSelectedCell(null);
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
    const subjectData = SUDOKU_SUBJECTS[selectedSubject as keyof typeof SUDOKU_SUBJECTS];
    if (subjectData && selectedModule) {
      // Fix TypeScript error by properly typing the modules access
      const modules = subjectData.modules as Record<string, any>;
      const moduleData = modules[selectedModule];
      if (moduleData && moduleData.grids) {
        // Shuffle and select grids
        const shuffled = [...moduleData.grids].sort(() => Math.random() - 0.5);
        const selectedGrids = shuffled.slice(0, questionCount);
        setGameGrids(selectedGrids);
        setGamePhase('playing');
        
        // Initialize the first grid
        if (selectedGrids.length > 0) {
          const firstGrid = selectedGrids[0];
          setInitialGrid(firstGrid.initialGrid);
          setSolutionGrid(firstGrid.solutionGrid);
          setUserGrid(JSON.parse(JSON.stringify(firstGrid.initialGrid))); // Deep copy
        }
        resetGame();
      }
    }
  };

  // Restart game
  const restartGame = () => {
    setGamePhase('subject-selection');
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedQuestionCount(2);
    setGameGrids([]);
    setCurrentGridIndex(0);
    setUserGrid([]);
    setInitialGrid([]);
    setSolutionGrid([]);
    setScore(0);
    setGridsCompleted(0);
    setGridsAnswered([]);
    resetGame();
  };

  // Handle cell selection
  const handleCellPress = (row: number, col: number) => {
    if (initialGrid[row][col] !== '') return; // Can't edit pre-filled cells
    setSelectedCell({row, col});
  };

  // Handle symbol selection
  const handleSymbolSelect = (symbol: string) => {
    if (!selectedCell || gameStatus !== 'playing') return;
    
    const {row, col} = selectedCell;
    const newUserGrid = [...userGrid];
    newUserGrid[row] = [...newUserGrid[row]];
    newUserGrid[row][col] = symbol;
    setUserGrid(newUserGrid);
  };

  // Check if the grid is complete and correct
  const checkSolution = () => {
    if (!userGrid.length || !solutionGrid.length) return false;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (userGrid[i][j] !== solutionGrid[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  // Submit the current grid
  const submitGrid = () => {
    if (gameStatus !== 'playing') return;
    
    const isCorrect = checkSolution();
    
    if (isCorrect) {
      setGameStatus('won');
      const gridScore = Math.max(100 - (showHint ? 20 : 0), 10);
      setScore(prev => prev + gridScore);
      setGridsCompleted(prev => prev + 1);
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

  // Next grid
  const nextGrid = () => {
    // Save current grid result
    const gridResult = {
      grid: currentGrid,
      status: gameStatus,
      usedHint: showHint,
      score: gameStatus === 'won' ? Math.max(100 - (showHint ? 20 : 0), 10) : 0
    };
    setGridsAnswered(prev => [...prev, gridResult]);

    if (currentGridIndex < gameGrids.length - 1) {
      setCurrentGridIndex(prev => prev + 1);
      
      // Initialize the next grid
      const nextGridData = gameGrids[currentGridIndex + 1];
      setInitialGrid(nextGridData.initialGrid);
      setSolutionGrid(nextGridData.solutionGrid);
      setUserGrid(JSON.parse(JSON.stringify(nextGridData.initialGrid))); // Deep copy
      
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
            <Text style={[styles.selectionTitle, { color: theme.text }]}>Sudoku Game</Text>
            <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
              Choose a subject to start learning
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {Object.entries(SUDOKU_SUBJECTS).map(([key, subject]) => {
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
    const subjectData = SUDOKU_SUBJECTS[selectedSubject as keyof typeof SUDOKU_SUBJECTS];
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
                    {module.grids.length} puzzles available
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
    const subjectData = SUDOKU_SUBJECTS[selectedSubject as keyof typeof SUDOKU_SUBJECTS];
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

  // Sudoku Grid Display
  const renderSudokuGrid = () => {
    if (!userGrid.length || !initialGrid.length) return null;
    
    return (
      <Animated.View style={[styles.gridContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        <Text style={[styles.gridTitle, { color: theme.text }]}>Sudoku Puzzle:</Text>
        <View style={[styles.sudokuGrid, { backgroundColor: theme.surface }]}>
          {userGrid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((cell, colIndex) => {
                const isInitial = initialGrid[rowIndex][colIndex] !== '';
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isDuplicate = false; // Simplified for now
                
                return (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.gridCell,
                      { 
                        backgroundColor: isInitial ? theme.background : theme.surface,
                        borderColor: isSelected ? theme.primary : isDuplicate ? '#EF4444' : theme.border
                      },
                      rowIndex % 3 === 0 && { borderTopWidth: 2 },
                      colIndex % 3 === 0 && { borderLeftWidth: 2 },
                      rowIndex === 8 && { borderBottomWidth: 2 },
                      colIndex === 8 && { borderRightWidth: 2 }
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                  >
                    <Text style={[
                      styles.cellText,
                      { 
                        color: isInitial ? theme.text : theme.textSecondary,
                        fontWeight: isInitial ? '700' : '500'
                      }
                    ]}>
                      {cell}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={submitGrid}
        >
          <Text style={styles.submitButtonText}>Check Solution</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Symbol Selection Panel
  const renderSymbolPanel = () => {
    if (!currentGrid || !selectedCell) return null;
    
    return (
      <View style={[styles.symbolPanel, { backgroundColor: theme.surface }]}>
        <Text style={[styles.symbolPanelTitle, { color: theme.text }]}>Select a Symbol:</Text>
        <View style={styles.symbolGrid}>
          {currentGrid.symbols.slice(0, 24).map((symbol, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.symbolButton, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => handleSymbolSelect(symbol)}
            >
              <Text style={[styles.symbolText, { color: theme.text }]}>{symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Hint Section
  const renderHintSection = () => {
    if (!currentGrid) return null;
    
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
              💡 {currentGrid.hint}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Grid Result for Individual Grids
  const renderGridResult = () => {
    if (gameStatus === 'playing' || !currentGrid) return null;

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
        
        <View style={[styles.explanationCard, { backgroundColor: theme.background }]}>
          <Text style={[styles.explanationTitle, { color: theme.primary }]}>Explanation:</Text>
          <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
            {currentGrid.explanation}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={nextGrid}
        >
          <Text style={styles.nextButtonText}>
            {currentGridIndex < gameGrids.length - 1 ? 'Next Puzzle' : 'Finish Game'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Final Results Screen
  const renderGameResults = () => {
    if (gamePhase !== 'results') return null;

    const totalPuzzles = gridsAnswered.length;
    const correctAnswers = gridsAnswered.filter(q => q.status === 'won').length;
    const totalScore = gridsAnswered.reduce((sum, q) => sum + q.score, 0);
    const accuracy = totalPuzzles > 0 ? (correctAnswers / totalPuzzles) * 100 : 0;

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

  // Move useEffect for updating profile stats to the top level to fix hooks order error
  const hasUpdatedStats = React.useRef(false);
  useEffect(() => {
    if (gamePhase === 'results' && gridsAnswered.length && !hasUpdatedStats.current) {
      const totalScore = gridsAnswered.reduce((sum, q) => sum + q.score, 0);
      const correctAnswers = gridsAnswered.filter(q => q.status === 'won').length;
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
  }, [gamePhase, gridsAnswered]);

  // Show different phases
  if (gamePhase === 'subject-selection') return renderSubjectSelection();
  if (gamePhase === 'module-selection') return renderModuleSelection();
  if (gamePhase === 'question-selection') return renderQuestionSelection();
  if (gamePhase === 'results') return renderGameResults();

  // Main sudoku game screen (playing phase)
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Sudoku Game</Text>
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
            {currentGridIndex + 1}/{gameGrids.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Puzzle</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={[styles.statValue, { color: theme.text }]}>{gridsCompleted}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        {renderSudokuGrid()}
        {renderSymbolPanel()}
        {renderHintSection()}
        {renderGridResult()}
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
  
  // Sudoku Grid Display
  gridContainer: { alignItems: 'center', marginBottom: 24 },
  gridTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sudokuGrid: {
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    padding: 4
  },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellText: { fontSize: 14, fontWeight: '500' },
  
  // Symbol Panel
  symbolPanel: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2
  },
  symbolPanelTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6
  },
  symbolButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 1
  },
  symbolText: { fontSize: 14, fontWeight: '600' },
  
  // Submit Button
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    width: '100%'
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
  
  // Grid Results
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