import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CoursesScreen() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme, t } = useApp();
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  // Load completed lessons from storage
  useEffect(() => {
    loadCompletedLessons();
  }, []);

  const loadCompletedLessons = async () => {
    try {
      const completed = await AsyncStorage.getItem('completedLessons');
      if (completed) {
        setCompletedLessons(JSON.parse(completed));
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };

  const markLessonCompleted = async (lessonId: string) => {
    try {
      const updatedCompleted = [...completedLessons, lessonId];
      await AsyncStorage.setItem('completedLessons', JSON.stringify(updatedCompleted));
      setCompletedLessons(updatedCompleted);
    } catch (error) {
      console.error('Error saving completed lesson:', error);
    }
  };

  // Calculate dynamic progress for modules
  const calculateModuleProgress = (lessons: any[]) => {
    const completedCount = lessons.filter(lesson => completedLessons.includes(lesson.id)).length;
    return {
      progress: completedCount,
      total: lessons.length
    };
  };

  // Course data structure - starting with all lessons incomplete
  const courseData = [
    {
      category: 'Science',
      subjects: [
        {
          id: 'chemistry',
          name: 'Chemistry',
          icon: '⚛️',
          color: '#10B981',
          modules: [
            {
              id: 'atoms',
              name: 'Atoms',
              lessons: [
                { id: 'intro-1-1', name: 'Introduction 1.1', type: 'lesson' },
                { id: 'quiz-basics-1-2', name: 'Quiz Basics 1.2', type: 'quiz' },
                { id: 'quiz-2', name: 'Quiz 2', type: 'quiz' },
                { id: 'atomic-structure', name: 'Atomic Structure 1.3', type: 'lesson' },
                { id: 'practice-test', name: 'Practice Test', type: 'quiz' },
              ]
            }
          ]
        }
      ]
    },
    {
      category: 'Mathematics',
      subjects: [
        {
          id: 'algebra',
          name: 'Algebra',
          icon: '📐',
          color: '#3B82F6',
          modules: [
            {
              id: 'basic-algebra',
              name: 'Basic Algebra',
              lessons: [
                { id: 'algebra-intro-1-1', name: 'Introduction 1.1', type: 'lesson' },
                { id: 'algebra-quiz-1', name: 'Quiz 1', type: 'quiz' },
                { id: 'variables-expressions', name: 'Variables & Expressions 1.2', type: 'lesson' },
                { id: 'algebra-practice-quiz', name: 'Practice Quiz', type: 'quiz' },
              ]
            }
          ]
        }
      ]
    }
  ];

  const getAnimatedValue = (id: string) => {
    if (!animatedValues.current[id]) {
      animatedValues.current[id] = new Animated.Value(0);
    }
    return animatedValues.current[id];
  };

  const toggleSubject = (subjectId: string) => {
    const isExpanded = expandedSubject === subjectId;
    const animatedValue = getAnimatedValue(`subject-${subjectId}`);

    if (isExpanded) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedSubject(null);
      setExpandedModule(null);
    } else {
      if (expandedSubject) {
        const prevAnimatedValue = getAnimatedValue(`subject-${expandedSubject}`);
        Animated.timing(prevAnimatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedSubject(subjectId);
      setExpandedModule(null);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const toggleModule = (moduleId: string) => {
    const isExpanded = expandedModule === moduleId;
    const animatedValue = getAnimatedValue(`module-${moduleId}`);

    if (isExpanded) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedModule(null);
    } else {
      if (expandedModule) {
        const prevAnimatedValue = getAnimatedValue(`module-${expandedModule}`);
        Animated.timing(prevAnimatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedModule(moduleId);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const navigateToLesson = (lessonId: string, lessonType: string) => {
    // Navigate to lesson/quiz content based on type
    if (lessonType === 'quiz') {
      router.push(`/quiz?lessonId=${lessonId}&type=${lessonType}`);
    } else {
      router.push(`/lesson?lessonId=${lessonId}&type=${lessonType}`);
    }
    
    // Mark lesson as completed when opened (simulating completion)
    // In a real app, this would be marked when the lesson is actually finished
    setTimeout(() => {
      if (!completedLessons.includes(lessonId)) {
        markLessonCompleted(lessonId);
      }
    }, 2000); // Simulate completion after 2 seconds
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('courses')}</Text>
      </View>

      {courseData.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.categorySection}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.category}</Text>
          
          {category.subjects.map((subject, subjectIndex) => {
            const isSubjectExpanded = expandedSubject === subject.id;
            const subjectAnimatedValue = getAnimatedValue(`subject-${subject.id}`);

            return (
              <View key={subjectIndex} style={styles.subjectContainer}>
                <TouchableOpacity
                  style={[styles.subjectCard, { backgroundColor: theme.surface, borderColor: subject.color }]}
                  onPress={() => toggleSubject(subject.id)}
                >
                  <View style={styles.subjectHeader}>
                    <View style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}>
                      <Text style={styles.subjectEmoji}>{subject.icon}</Text>
                    </View>
                    <View style={styles.subjectInfo}>
                      <Text style={[styles.subjectName, { color: theme.text }]}>{subject.name}</Text>
                      <Text style={[styles.subjectModules, { color: theme.textSecondary }]}>
                        {subject.modules.length} module{subject.modules.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                    {isSubjectExpanded ? (
                      <ChevronDown size={20} color={theme.textSecondary} />
                    ) : (
                      <ChevronRight size={20} color={theme.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.modulesContainer,
                    {
                      maxHeight: subjectAnimatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 400],
                      }),
                      opacity: subjectAnimatedValue,
                    },
                  ]}
                >
                  {subject.modules.map((module, moduleIndex) => {
                    const isModuleExpanded = expandedModule === module.id;
                    const moduleAnimatedValue = getAnimatedValue(`module-${module.id}`);
                    const moduleStats = calculateModuleProgress(module.lessons);
                    const progressPercentage = moduleStats.total > 0 ? (moduleStats.progress / moduleStats.total) * 100 : 0;

                    return (
                      <View key={moduleIndex} style={[styles.moduleContainer, { backgroundColor: theme.background }]}>
                        <TouchableOpacity
                          style={[styles.moduleCard, { backgroundColor: theme.surface }]}
                          onPress={() => toggleModule(module.id)}
                        >
                          <View style={styles.moduleHeader}>
                            <View style={styles.moduleInfo}>
                              <Text style={[styles.moduleName, { color: theme.text }]}>{module.name}</Text>
                              <Text style={[styles.moduleProgress, { color: theme.textSecondary }]}>
                                {moduleStats.progress}/{moduleStats.total} lessons completed
                              </Text>
                            </View>
                            {isModuleExpanded ? (
                              <ChevronDown size={16} color={theme.textSecondary} />
                            ) : (
                              <ChevronRight size={16} color={theme.textSecondary} />
                            )}
                          </View>
                          
                          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${progressPercentage}%`,
                                  backgroundColor: subject.color,
                                },
                              ]}
                            />
                          </View>
                        </TouchableOpacity>

                        <Animated.View
                          style={[
                            styles.lessonsContainer,
                            {
                              maxHeight: moduleAnimatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 300],
                              }),
                              opacity: moduleAnimatedValue,
                            },
                          ]}
                        >
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isCompleted = completedLessons.includes(lesson.id);
                            
                            return (
                            <TouchableOpacity
                              key={lessonIndex}
                              style={[styles.lessonItem, { backgroundColor: theme.surface }]}
                              onPress={() => navigateToLesson(lesson.id, lesson.type)}
                            >
                              <View style={styles.lessonContent}>
                                <View style={styles.lessonIcon}>
                                  {isCompleted ? (
                                    <CheckCircle size={16} color={subject.color} />
                                  ) : lesson.type === 'quiz' ? (
                                    <Circle size={16} color={theme.textSecondary} />
                                  ) : (
                                    <PlayCircle size={16} color={theme.textSecondary} />
                                  )}
                                </View>
                                <View style={styles.lessonInfo}>
                                  <Text style={[styles.lessonName, { color: theme.text }]}>{lesson.name}</Text>
                                  <Text style={[styles.lessonType, { color: theme.textSecondary }]}>
                                    {lesson.type === 'quiz' ? 'Quiz' : 'Lesson'}
                                    {isCompleted && ' • Completed'}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                            );
                          })}
                        </Animated.View>
                      </View>
                    );
                  })}
                </Animated.View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  subjectContainer: {
    marginBottom: 16,
  },
  subjectCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subjectEmoji: {
    fontSize: 24,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subjectModules: {
    fontSize: 12,
  },
  modulesContainer: {
    overflow: 'hidden',
    marginTop: 8,
  },
  moduleContainer: {
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  moduleCard: {
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  moduleProgress: {
    fontSize: 11,
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
  lessonsContainer: {
    overflow: 'hidden',
    marginTop: 8,
    paddingLeft: 8,
  },
  lessonItem: {
    borderRadius: 6,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIcon: {
    marginRight: 10,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
  lessonType: {
    fontSize: 10,
  },
});
