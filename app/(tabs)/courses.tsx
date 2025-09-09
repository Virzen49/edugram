// course.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategory, getModules, getLectures } from "../api/course" // import new api funcs
import { getProfile } from '../api/auth';

export default function CoursesScreen() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme, t } = useApp();
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const navigateToLesson = (lesson: any, categoryId: string | number, moduleId: string | number) => {
    // If this is a quiz, go to quiz screen (existing behavior)
    if (lesson.type === 'quiz') {
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
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.text }]}>{t('courses')}</Text>
    </View>

    {categories.map((category, categoryIndex) => {
      const isCategoryExpanded = expandedSubject === String(category.id);
      const categoryAnimatedValue = getAnimatedValue(`subject-${category.id}`);

      return (
        <View key={categoryIndex} style={styles.categorySection}>
          {/* Category Card */}
          <TouchableOpacity
            style={[
              styles.subjectCard,
              { backgroundColor: theme.surface, borderColor: '#3B82F6' },
            ]}
            onPress={() => toggleSubject(String(category.id), category.id)}
          >
            <View style={styles.subjectHeader}>
              <View
                style={[
                  styles.subjectIcon,
                  { backgroundColor: '#3B82F620' },
                ]}
              >
                <Text style={styles.subjectEmoji}>📘</Text>
              </View>
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: theme.text }]}>
                  {category.name}
                </Text>
                <Text style={[styles.subjectModules, { color: theme.textSecondary }]}>
                  {category.subjects.length} module
                  {category.subjects.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {isCategoryExpanded ? (
                <ChevronDown size={20} color={theme.textSecondary} />
              ) : (
                <ChevronRight size={20} color={theme.textSecondary} />
              )}
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
                    style={[styles.moduleCard, { backgroundColor: theme.surface }]}
                    onPress={() => toggleModule(String(module.id), category.id)}
                  >
                    <View style={styles.moduleHeader}>
                      <View style={styles.moduleInfo}>
                        <Text style={[styles.moduleName, { color: theme.text }]}>
                          {module.name}
                        </Text>
                        <Text
                          style={[styles.moduleProgress, { color: theme.textSecondary }]}
                        >
                          {moduleStats.progress}/{moduleStats.total} lessons
                        </Text>
                      </View>
                      {isModuleExpanded ? (
                        <ChevronDown size={16} color={theme.textSecondary} />
                      ) : (
                        <ChevronRight size={16} color={theme.textSecondary} />
                      )}
                    </View>
                    <View
                      style={[styles.progressBar, { backgroundColor: theme.border }]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressPercentage}%`, backgroundColor: '#3B82F6' },
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
                        return (
                          <TouchableOpacity
                            key={lessonIndex}
                            style={[styles.lessonItem, { backgroundColor: theme.surface }]}
                            onPress={() =>
                              navigateToLesson(
                                lesson,
                                category.id,
                                module.id
                              )
                            }
                          >
                            <View style={styles.lessonContent}>
                              <View style={styles.lessonIcon}>
                                {isCompleted ? (
                                  <CheckCircle size={16} color={'#3B82F6'} />
                                ) : lesson.type === 'quiz' ? (
                                  <Circle size={16} color={theme.textSecondary} />
                                ) : (
                                  <PlayCircle size={16} color={theme.textSecondary} />
                                )}
                              </View>
                              <View style={styles.lessonInfo}>
                                <Text style={[styles.lessonName, { color: theme.text }]}>
                                  {lesson.name}
                                </Text>
                                <Text
                                  style={[styles.lessonType, { color: theme.textSecondary }]}
                                >
                                  {lesson.type}
                                  {isCompleted && ' • Completed'}
                                </Text>
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
    })}
  </ScrollView>
);
}

// keep your styles unchanged (copy from your original file)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold' },
  categorySection: { paddingHorizontal: 20, marginBottom: 30 },
  categoryTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  subjectContainer: { marginBottom: 16 },
  subjectCard: { borderRadius: 12, padding: 16, borderWidth: 2, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  subjectHeader: { flexDirection: 'row', alignItems: 'center' },
  subjectIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  subjectEmoji: { fontSize: 24 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  subjectModules: { fontSize: 12 },
  modulesContainer: { overflow: 'hidden', marginTop: 8 },
  moduleContainer: { marginBottom: 8, borderRadius: 8, paddingHorizontal: 8 },
  moduleCard: { borderRadius: 8, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  moduleProgress: { fontSize: 11 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  lessonsContainer: { overflow: 'hidden', marginTop: 8, paddingLeft: 8 },
  lessonItem: { borderRadius: 6, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1 },
  lessonContent: { flexDirection: 'row', alignItems: 'center' },
  lessonIcon: { marginRight: 10 },
  lessonInfo: { flex: 1 },
  lessonName: { fontSize: 13, fontWeight: '500', marginBottom: 1 },
  lessonType: { fontSize: 10 },
});