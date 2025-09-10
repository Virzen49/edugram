import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle, BookOpen, Award, Zap, Star, Calculator, Beaker, Atom, FileText, Video, HelpCircle, TrendingUp, Users, Clock, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategory, getModules, getLectures } from "../api/course" // import new api funcs
import { getProfile } from '../api/auth';

export default function CoursesScreen() {
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme, t } = useApp();
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear any filtering when component mounts from tab navigation
  useEffect(() => {
    // If there's no subject parameter (direct tab navigation), ensure we show all
    if (!subject) {
      // This ensures that when coming from tab navigation, we always show all courses
      console.debug('Courses loaded from tab navigation - showing all subjects');
    }
  }, [subject]);

  useEffect(() => {
    loadCompletedLessons();
    loadCategories();
  }, []);

  const loadCompletedLessons = async () => {
    try {
      const completed = await AsyncStorage.getItem('completedLessons');
      if (completed) setCompletedLessons(JSON.parse(completed));
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };

  const markLessonCompleted = async (lessonId: string) => {
    try {
      if (completedLessons.includes(lessonId)) return;
      const updatedCompleted = [...completedLessons, lessonId];
      await AsyncStorage.setItem('completedLessons', JSON.stringify(updatedCompleted));
      setCompletedLessons(updatedCompleted);
    } catch (error) {
      console.error('Error saving completed lesson:', error);
    }
  };

  const getAnimatedValue = (id: string) => {
    if (!animatedValues.current[id]) animatedValues.current[id] = new Animated.Value(0);
    return animatedValues.current[id];
  };

  // Load top-level categories from API
  const loadCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await getProfile();
      const grade = response?.data?.student?.[0]?.grade || '6';
      const res = await getCategory(grade);

      if (!res.ok) {
        setError(res.data?.message || `Failed to load categories (status ${res.status})`);
        setLoadingCategories(false);
        return;
      }

      const payload = res.data;
      let rawList: any[] = [];

      // Handle possible shapes:
      // 1) Array response: [ { ... }, ... ]
      // 2) wrapper { categories: [...] } or { data: [...] }
      // 3) single module object returned as { module: { cat_id, category_name, ... } }
      // 4) single category object like { cat_id, category_name }
      if (Array.isArray(payload)) {
        rawList = payload;
      } else if (Array.isArray(payload.categories)) {
        rawList = payload.categories;
      } else if (Array.isArray(payload.data)) {
        rawList = payload.data;
      } else if (Array.isArray(payload.module)) {
        rawList = payload.module;
      } else if (payload && payload.module && typeof payload.module === 'object') {
        rawList = [payload.module];
      } else if (payload && (payload.cat_id || payload.category_name || payload.cat_name)) {
        rawList = [payload];
      } else if (payload && payload[Object.keys(payload)[0]] && typeof payload[Object.keys(payload)[0]] === 'object') {
        // last resort: if there's a single nested object, try to use it
        const first = payload[Object.keys(payload)[0]];
        if (first && (first.cat_id || first.category_name || first.cat_name)) rawList = [first];
      }

      if (!Array.isArray(rawList) || rawList.length === 0) {
        // nothing usable returned
        console.debug('loadCategories - raw payload:', payload);
        setCategories([]);
        setLoadingCategories(false);
        return;
      }

      const cats = rawList.map((c: any) => ({
        id: c.cat_id ?? c.id ?? c.category_id ?? String(c.category_name ?? c.cat_name ?? c.name ?? c.title ?? Math.random()),
        name: c.category_name ?? c.cat_name ?? c.name ?? c.title ?? `Category ${c.cat_id ?? c.id}`,
        raw: c,
        subjectsLoaded: false,
        subjects: [],
      }));

      console.debug('Normalized categories:', cats);
      setCategories(cats);

      // Immediately fetch modules for all categories so UI shows counts instead of 0
      loadModulesForAllCategories(cats);
    } catch (err: any) {
      console.error('Error in loadCategories:', err);
      setError(err?.message || String(err));
    } finally {
      setLoadingCategories(false);
    }
  };

  // Filter categories based on subject parameter
  const filteredCategories = categories.filter(category => {
    if (!subject) {
      console.debug('No subject filter - showing all categories:', categories.length);
      return true; // Show all if no subject filter
    }
    
    const categoryName = category.name.toLowerCase();
    const subjectParam = subject.toLowerCase();
    
    console.debug(`Filtering categories for subject: ${subjectParam}, checking category: ${categoryName}`);
    
    // Map subject parameters to category names
    if (subjectParam === 'chemistry') {
      return categoryName.includes('chemistry') || categoryName.includes('science');
    } else if (subjectParam === 'mathematics') {
      return categoryName.includes('math') || categoryName.includes('algebra') || categoryName.includes('geometry');
    }
    
    return true;
  });

  console.debug('Filtered categories result:', filteredCategories.length, 'out of', categories.length);

  // helper to normalize modules payload into array
  const normalizeModulesPayload = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.modules)) return payload.modules;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.module)) return payload.module;
    if (typeof payload.module === 'string') return [{ module_name: payload.module }];
    if (payload && (payload.mod_id || payload.module_name || payload.name)) return [payload];
    // try nested first object
    const firstKey = Object.keys(payload)[0];
    if (firstKey && payload[firstKey] && (payload[firstKey].mod_id || payload[firstKey].module_name)) return [payload[firstKey]];
    return [];
  };

  // fetch modules for all categories immediately after loading categories
  const loadModulesForAllCategories = async (cats: any[]) => {
    try {
      const results = await Promise.all(cats.map(async (cat) => {
        try {
          const res = await getModules(Number(cat.id));
          const raw = normalizeModulesPayload(res.data);
          
          // Remove duplicates by module name to avoid duplicate algebra modules
          const uniqueRaw = raw.filter((module, index, self) => {
            const moduleName = module.module_name ?? module.name ?? String(module);
            return index === self.findIndex(m => {
              const mName = m.module_name ?? m.name ?? String(m);
              return mName.toLowerCase() === moduleName.toLowerCase();
            });
          });
          
          const modules = uniqueRaw.map((m: any, idx: number) => ({
            id: m.mod_id ?? m.id ?? idx,
            name: m.module_name ?? m.name ?? String(m) ?? `Module ${m.mod_id ?? m.id ?? idx}`,
            raw: m,
            lessonsLoaded: false,
            lessons: [],
            color: '#3B82F6',
            icon: '📘',
          }));

          return { catId: cat.id, modules };
        } catch (err) {
          console.error('Error loading modules for category', cat.id, err);
          return { catId: cat.id, modules: [] };
        }
      }));

      // merge modules into categories
      const updated = cats.map((cat) => {
        const found = results.find(r => String(r.catId) === String(cat.id));
        if (found && found.modules.length > 0) {
          return { ...cat, subjectsLoaded: true, subjects: found.modules };
        }
        return cat;
      });

      setCategories(updated);
    } catch (err) {
      console.error('Error in loadModulesForAllCategories:', err);
    }
  };

  const toggleSubject = async (subjectId: string, catId: number) => {
    const isExpanded = expandedSubject === subjectId;
    const animatedValue = getAnimatedValue(`subject-${subjectId}`);

    if (isExpanded) {
      Animated.timing(animatedValue, { toValue: 0, duration: 300, useNativeDriver: false }).start();
      setExpandedSubject(null);
      setExpandedModule(null);
      return;
    }

    // collapse previous
    if (expandedSubject) {
      const prevAnimatedValue = getAnimatedValue(`subject-${expandedSubject}`);
      Animated.timing(prevAnimatedValue, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }

    // If subjects (modules) not loaded for this category, fetch modules
    const catIndex = categories.findIndex(c => String(c.id) === String(subjectId) || String(c.id) === String(catId));
    if (catIndex >= 0) {
      const cat = categories[catIndex];
      if (!cat.subjectsLoaded) {
        // fetch modules for this category id
        try {
          const res = await getModules(cat.id);

          // Normalize response payload to an array of modules (handle module as string)
          const payload = res.data;
          let rawModules: any[] = [];

          if (!res.ok) {
            console.warn('getModules error response', res);
          } else if (Array.isArray(payload)) {
            rawModules = payload;
          } else if (Array.isArray(payload?.modules)) {
            rawModules = payload.modules;
          } else if (Array.isArray(payload?.data)) {
            rawModules = payload.data;
          } else if (Array.isArray(payload?.module)) {
            rawModules = payload.module;
          } else if (payload && typeof payload.module === 'string') {
            // API returned { module: 'algebra' } — convert to single module object
            rawModules = [{ module_name: payload.module }];
          } else if (payload && payload.module && typeof payload.module === 'object') {
            rawModules = [payload.module];
          } else if (payload && (payload.mod_id || payload.module_name || payload.name)) {
            // single module object returned at top-level
            rawModules = [payload];
          }

          if (rawModules.length > 0) {
            // Remove duplicates by module name to avoid duplicate algebra modules
            const uniqueModules = rawModules.filter((module, index, self) => {
              const moduleName = module.module_name ?? module.name ?? String(module);
              return index === self.findIndex(m => {
                const mName = m.module_name ?? m.name ?? String(m);
                return mName.toLowerCase() === moduleName.toLowerCase();
              });
            });
            
            const modules = uniqueModules.map((m: any, idx: number) => ({
              id: m.mod_id ?? m.id ?? idx,
              name: m.module_name ?? m.name ?? String(m) ?? `Module ${m.mod_id ?? m.id ?? idx}`,
              raw: m,
              lessonsLoaded: false,
              lessons: [],
              color: '#3B82F6',
              icon: '📘',
            }));

            console.log('Fetched modules for category', cat.id, modules);
            const updated = [...categories];
            updated[catIndex] = { ...cat, subjectsLoaded: true, subjects: modules };
            setCategories(updated);
          } else {
            console.warn('getModules returned unexpected shape or empty list', res);
          }
        } catch (err) {
          console.error('Error fetching modules:', err);
        }
      }
    }

    // expand subject
    setExpandedSubject(subjectId);
    setExpandedModule(null);
    Animated.timing(animatedValue, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };

  // Toggle module — lazy load uploads/lessons for module
  const toggleModule = async (moduleId: string, catId: number) => {
    const isExpanded = expandedModule === moduleId;
    const animatedValue = getAnimatedValue(`module-${moduleId}`);

    if (isExpanded) {
      Animated.timing(animatedValue, { toValue: 0, duration: 300, useNativeDriver: false }).start();
      setExpandedModule(null);
      return;
    }

    // collapse previous
    if (expandedModule) {
      const prevAnimatedValue = getAnimatedValue(`module-${expandedModule}`);
      Animated.timing(prevAnimatedValue, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }

    // find category and module and fetch uploads if not loaded
    const catIndex = categories.findIndex(c => c.id === catId);
    if (catIndex >= 0) {
      const cat = categories[catIndex];
      const modIndex = cat.subjects.findIndex((m: any) => String(m.id) === moduleId || m.id === moduleId);
      if (modIndex >= 0) {
        const module = cat.subjects[modIndex];
        if (!module.lessonsLoaded) {
          try {
            const res = await getLectures(cat.id, module.id);
            if (res.ok && Array.isArray(res.data?.uploads || res.data.uploads)) {
              // uploads are already normalized by api/getLectures -> normalizeUpload
              const uploads = res.data.uploads.map((u: any) => ({
                id: u.lectId ?? u.id,
                title: u.title ?? u.raw?.title ?? 'Untitled',
                type: u.fileType ?? u.file_type ?? 'notes',
                fileUrl: u.fileUrl ?? u.file_url,
                raw: u.raw ?? u,
              }));

              // Convert uploads into "lessons" array for UI with better naming
              // Only take the FIRST lesson to avoid duplicates - show only ONE lesson per module
              const firstUpload = uploads[0];
              if (!firstUpload) {
                const updated = [...categories];
                updated[catIndex].subjects[modIndex] = { ...module, lessonsLoaded: true, lessons: [] };
                setCategories(updated);
                return;
              }
              
              // Create a single lesson with descriptive name
              let lessonName = firstUpload.title;
              
              // If the lesson title is the same as module name, create a more descriptive name
              if (lessonName && lessonName.toLowerCase() === module.name.toLowerCase()) {
                if (firstUpload.type === 'video') {
                  lessonName = `${module.name} - Video`;
                } else if (firstUpload.type === 'notes') {
                  lessonName = `${module.name} - Notes`;
                } else {
                  lessonName = `${module.name} - Content`;
                }
              }
              
              // If title is generic or empty, create better names
              if (!lessonName || lessonName.toLowerCase() === 'untitled' || lessonName.length < 3) {
                if (firstUpload.type === 'video') {
                  lessonName = `${module.name} - Video`;
                } else if (firstUpload.type === 'notes') {
                  lessonName = `${module.name} - Notes`;
                } else {
                  lessonName = `${module.name} - Content`;
                }
              }
              
              const singleLesson = {
                id: `${firstUpload.type}-${firstUpload.id}`,
                name: lessonName,
                type: firstUpload.type === 'video' ? 'lesson' : 'notes',
                fileUrl: firstUpload.fileUrl,
                raw: firstUpload.raw,
              };
              
              // Only use ONE lesson per module
              const uniqueLessons = [singleLesson];

              const updated = [...categories];
              updated[catIndex].subjects[modIndex] = { ...module, lessonsLoaded: true, lessons: uniqueLessons };
              setCategories(updated);
            } else {
              console.warn('getLectures returned no uploads', res);
            }
          } catch (err) {
            console.error('Error fetching uploads for module', err);
          }
        }
      }
    }

    // expand module
    setExpandedModule(moduleId);
    Animated.timing(animatedValue, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('math') || name.includes('algebra') || name.includes('geometry')) {
      return { 
        icon: Calculator, 
        color: '#8B5CF6', 
        bgColor: '#8B5CF620',
        gradient: ['#8B5CF6', '#A855F7'] as [string, string]
      };
    } else if (name.includes('science') || name.includes('chemistry') || name.includes('physics')) {
      return { 
        icon: Beaker, 
        color: '#10B981', 
        bgColor: '#10B98120',
        gradient: ['#10B981', '#059669'] as [string, string]
      };
    } else if (name.includes('english') || name.includes('language') || name.includes('literature')) {
      return { 
        icon: FileText, 
        color: '#3B82F6', 
        bgColor: '#3B82F620',
        gradient: ['#3B82F6', '#2563EB'] as [string, string]
      };
    } else if (name.includes('history') || name.includes('social')) {
      return { 
        icon: Clock, 
        color: '#F59E0B', 
        bgColor: '#F59E0B20',
        gradient: ['#F59E0B', '#D97706'] as [string, string]
      };
    } else if (name.includes('art') || name.includes('music')) {
      return { 
        icon: Target, 
        color: '#EF4444', 
        bgColor: '#EF444420',
        gradient: ['#EF4444', '#DC2626'] as [string, string]
      };
    }
    return { 
      icon: BookOpen, 
      color: '#6B7280', 
      bgColor: '#6B728020',
      gradient: ['#6B7280', '#4B5563'] as [string, string]
    };
  };

  const getModuleIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    if (name.includes('algebra') || name.includes('equation')) {
      return { icon: Calculator, color: '#8B5CF6', gradient: ['#8B5CF6', '#A855F7'] as [string, string] };
    } else if (name.includes('geometry') || name.includes('shape')) {
      return { icon: TrendingUp, color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] as [string, string] };
    } else if (name.includes('chemistry') || name.includes('element')) {
      return { icon: Atom, color: '#10B981', gradient: ['#10B981', '#059669'] as [string, string] };
    } else if (name.includes('physics') || name.includes('force')) {
      return { icon: Zap, color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] as [string, string] };
    }
    return { icon: FileText, color: '#6B7280', gradient: ['#6B7280', '#4B5563'] as [string, string] };
  };

  const navigateToLesson = (lesson: any, categoryId: string | number, moduleId: string | number) => {
    // If this is a quiz, go to quiz screen (existing behavior)
    if (lesson.type === 'quiz') {
      // For the specific quizzes mentioned in the request:
      // Atoms-Practice Quiz (Chemistry) - subjectId=1, moduleId=1
      // Algebra Practice Quiz (Mathematics) - subjectId=2, moduleId=2
      if (categoryId === 1 && moduleId === 1) {
        router.push(`/quiz?subjectId=1&moduleId=1`);
        return;
      } else if (categoryId === 2 && moduleId === 2) {
        router.push(`/quiz?subjectId=2&moduleId=2`);
        return;
      }
      
      // Default quiz navigation
      const lessonId = encodeURIComponent(lesson.id);
      router.push(`/quiz?lessonId=${lessonId}&type=quiz&subjectId=${categoryId}&moduleId=${moduleId}`);
      return;
    }

    // For lesson resources (video/notes) navigate to the lecture screen using only category and module
    router.push(`/lecture?subjectId=${encodeURIComponent(String(categoryId))}&chapterId=${encodeURIComponent(String(moduleId))}`);
  };

  if (loadingCategories) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t('courses')}</Text>
        <Text style={{ padding: 20 }}>{'Loading categories...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: 'red', padding: 20 }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>
            {subject ? 
              (subject === 'chemistry' ? 'Chemistry Courses' : 
               subject === 'mathematics' ? 'Mathematics Courses' : 
               t('courses')) : 
              t('courses')
            }
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subject ? 
              `Browse ${subject} courses and modules` :
              'Learn and grow with interactive content'
            }
          </Text>
          {subject && (
            <TouchableOpacity 
              style={[styles.showAllButton, { backgroundColor: theme.primary + '15' }]}
              onPress={() => router.push('/(tabs)/courses')}
            >
              <Text style={[styles.showAllText, { color: theme.primary }]}>Show All Subjects</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerStats}>
          <View style={[styles.statCard, { backgroundColor: theme.primary + '15' }]}>
            <Award size={16} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.primary }]}>{filteredCategories.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {subject ? 'Categories' : 'Subjects'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10B981' + '15' }]}>
            <Zap size={16} color={'#10B981'} />
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {filteredCategories.reduce((total, cat) => total + cat.subjects.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Modules</Text>
          </View>
        </View>
      </View>

    {filteredCategories.length === 0 && !loadingCategories ? (
      <View style={styles.noResultsContainer}>
        <BookOpen size={48} color={theme.textSecondary} />
        <Text style={[styles.noResultsTitle, { color: theme.text }]}>No courses found</Text>
        <Text style={[styles.noResultsSubtitle, { color: theme.textSecondary }]}>
          {subject ? `No ${subject} courses available yet` : 'No courses available yet'}
        </Text>
        {subject && (
          <TouchableOpacity 
            style={[styles.showAllButton, { backgroundColor: theme.primary, marginTop: 16 }]}
            onPress={() => router.push('/(tabs)/courses')}
          >
            <Text style={[styles.showAllText, { color: 'white' }]}>View All Subjects</Text>
          </TouchableOpacity>
        )}
      </View>
    ) : (
      filteredCategories.map((category, categoryIndex) => {
      const isCategoryExpanded = expandedSubject === String(category.id);
      const categoryAnimatedValue = getAnimatedValue(`subject-${category.id}`);
      const categoryStyle = getCategoryIcon(category.name);

      return (
        <View key={categoryIndex} style={styles.categorySection}>
          {/* Enhanced Category Card */}
          <TouchableOpacity
            style={[
              styles.subjectCard,
              { 
                backgroundColor: theme.surface, 
                borderColor: categoryStyle.color,
                shadowColor: categoryStyle.color,
              },
            ]}
            onPress={() => toggleSubject(String(category.id), category.id)}
          >
            <View style={styles.subjectHeader}>
              <LinearGradient
                colors={categoryStyle.gradient}
                style={[
                  styles.subjectIcon,
                  { shadowColor: categoryStyle.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <categoryStyle.icon size={32} color="white" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: theme.text }]}>
                  {category.name}
                </Text>
                <View style={styles.subjectMeta}>
                  <BookOpen size={14} color={theme.textSecondary} />
                  <Text style={[styles.subjectModules, { color: theme.textSecondary }]}>
                    {category.subjects.length} module{category.subjects.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <View style={[styles.expandButton, { backgroundColor: categoryStyle.bgColor }]}>
                {isCategoryExpanded ? (
                  <ChevronDown size={20} color={categoryStyle.color} />
                ) : (
                  <ChevronRight size={20} color={categoryStyle.color} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Modules inside category */}
          <Animated.View
            style={[
              styles.modulesContainer,
              {
                maxHeight: categoryAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
                opacity: categoryAnimatedValue,
              },
            ]}
          >
            {category.subjects.map((module: any, moduleIndex: number) => {
              const isModuleExpanded = expandedModule === String(module.id);
              const moduleAnimatedValue = getAnimatedValue(`module-${module.id}`);
              const moduleStyle = getModuleIcon(module.name);

              // Calculate progress based on lesson completions with new key format
              const moduleStats = {
                progress: (() => {
                  // Count completed items for this module (video, notes, quiz)
                  let completed = 0;
                  const moduleKey = `lecture-${category.id}-${module.id}`;
                  
                  // Check if video is completed
                  if (completedLessons.includes(`video-${moduleKey}`)) completed++;
                  // Check if notes are completed
                  if (completedLessons.includes(`notes-${moduleKey}`)) completed++;
                  // Check if quiz is completed (for individual lessons)
                  const lessonQuizKey = (module.lessons || [])[0]?.id;
                  if (lessonQuizKey && completedLessons.includes(lessonQuizKey)) completed++;
                  
                  return completed;
                })(),
                total: 3, // Video + Notes + Quiz
              };
              const progressPercentage =
                moduleStats.total > 0
                  ? (moduleStats.progress / moduleStats.total) * 100
                  : 0;

              return (
                <View
                  key={moduleIndex}
                  style={[styles.moduleContainer, { backgroundColor: theme.background }]}
                >
                  <TouchableOpacity
                    style={[
                      styles.moduleCard, 
                      { 
                        backgroundColor: theme.surface,
                        borderLeftWidth: 4,
                        borderLeftColor: moduleStyle.color,
                      }
                    ]}
                    onPress={() => toggleModule(String(module.id), category.id)}
                  >
                    <View style={styles.moduleHeader}>
                      <LinearGradient
                        colors={moduleStyle.gradient}
                        style={[
                          styles.moduleIcon,
                          { shadowColor: moduleStyle.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <moduleStyle.icon size={20} color="white" strokeWidth={2.5} />
                      </LinearGradient>
                      <View style={styles.moduleInfo}>
                        <Text style={[styles.moduleName, { color: theme.text }]}>
                          {module.name}
                        </Text>
                        <View style={styles.moduleStats}>
                          <View style={styles.progressInfo}>
                            <Star size={12} color={moduleStyle.color} />
                            <Text style={[styles.moduleProgress, { color: theme.textSecondary }]}>
                              {moduleStats.progress}/{moduleStats.total} completed
                            </Text>
                          </View>
                          <Text style={[styles.progressPercent, { color: moduleStyle.color }]}>
                            {Math.round(progressPercentage)}%
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.expandButtonSmall, { backgroundColor: moduleStyle.color + '15' }]}>
                        {isModuleExpanded ? (
                          <ChevronDown size={16} color={moduleStyle.color} />
                        ) : (
                          <ChevronRight size={16} color={moduleStyle.color} />
                        )}
                      </View>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressPercentage}%`, backgroundColor: moduleStyle.color },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Lessons inside module */}
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
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson: any, lessonIndex: number) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const lessonTypeColor = lesson.type === 'quiz' ? '#8B5CF6' : lesson.type === 'lesson' ? '#3B82F6' : '#10B981';
                        const lessonIconComponent = lesson.type === 'quiz' ? HelpCircle : lesson.type === 'lesson' ? Video : FileText;
                        const lessonGradient = lesson.type === 'quiz' ? ['#8B5CF6', '#A855F7'] : lesson.type === 'lesson' ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669'];
                        
                        return (
                          <TouchableOpacity
                            key={lessonIndex}
                            style={[
                              styles.lessonItem, 
                              { 
                                backgroundColor: theme.surface,
                                borderLeftWidth: 4,
                                borderLeftColor: isCompleted ? '#10B981' : lessonTypeColor,
                              }
                            ]}
                            onPress={() =>
                              navigateToLesson(
                                lesson,
                                category.id,
                                module.id
                              )
                            }
                          >
                            <View style={styles.lessonContent}>
                              <LinearGradient
                                colors={isCompleted ? ['#10B981', '#059669'] as [string, string] : lessonGradient as [string, string]}
                                style={[
                                  styles.lessonIconContainer,
                                  { shadowColor: isCompleted ? '#10B981' : lessonTypeColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                {React.createElement(lessonIconComponent, { size: 16, color: "white", strokeWidth: 2.5 })}
                              </LinearGradient>
                              <View style={styles.lessonInfo}>
                                <Text style={[styles.lessonName, { color: theme.text }]}>
                                  {lesson.name}
                                </Text>
                                <View style={styles.lessonMeta}>
                                  <Text style={[styles.lessonType, { color: theme.textSecondary }]}>
                                    {lesson.type === 'lesson' ? 'Video Lesson' : lesson.type === 'quiz' ? 'Interactive Quiz' : 'Study Notes'}
                                  </Text>
                                  {isCompleted && (
                                    <View style={styles.completedBadge}>
                                      <CheckCircle size={12} color={'#10B981'} />
                                      <Text style={[styles.completedText, { color: '#10B981' }]}>Completed</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              <View style={[
                                styles.lessonAction,
                                { 
                                  backgroundColor: (isCompleted ? '#10B981' : lessonTypeColor) + '15',
                                  borderWidth: 1.5,
                                  borderColor: isCompleted ? '#10B981' : lessonTypeColor,
                                }
                              ]}>
                                {isCompleted ? (
                                  <CheckCircle size={16} color={'#10B981'} strokeWidth={2.5} />
                                ) : lesson.type === 'quiz' ? (
                                  <HelpCircle size={16} color={lessonTypeColor} strokeWidth={2.5} />
                                ) : (
                                  <PlayCircle size={16} color={lessonTypeColor} strokeWidth={2.5} />
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={{ padding: 12 }}>
                        <Text style={{ color: theme.textSecondary }}>
                          Tap to load resources
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                </View>
              );
            })}
          </Animated.View>
        </View>
      );
    }))
    }
  </ScrollView>
);
}

// keep your styles unchanged (copy from your original file)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    marginBottom: 20,
  },
  showAllButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  categorySection: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  subjectCard: { 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 2, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  subjectHeader: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  subjectIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    elevation: 8,
  },
  subjectEmoji: { 
    fontSize: 28 
  },
  subjectInfo: { 
    flex: 1 
  },
  subjectName: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  subjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectModules: { 
    fontSize: 13,
    fontWeight: '500',
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modulesContainer: { 
    overflow: 'hidden', 
    marginTop: 12 
  },
  moduleContainer: { 
    marginBottom: 12, 
    borderRadius: 16, 
    paddingHorizontal: 8 
  },
  moduleCard: { 
    borderRadius: 16, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4,
    elevation: 2,
  },
  moduleHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 6,
  },
  moduleEmoji: {
    fontSize: 18,
    fontWeight: '600',
  },
  moduleInfo: { 
    flex: 1 
  },
  moduleName: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleProgress: { 
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: { 
    height: 6, 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 3 
  },
  lessonsContainer: { 
    overflow: 'hidden', 
    marginTop: 12, 
    paddingLeft: 8 
  },
  lessonItem: { 
    borderRadius: 12, 
    marginBottom: 8, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2,
    elevation: 1,
  },
  lessonContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  lessonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 4,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonType: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lessonAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});