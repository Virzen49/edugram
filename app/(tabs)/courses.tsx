import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import lectures from '../data/lectures';

export default function CoursesScreen() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

  const getAnimatedValue = (subjectId: string) => {
    if (!animatedValues.current[subjectId]) {
      animatedValues.current[subjectId] = new Animated.Value(0);
    }
    return animatedValues.current[subjectId];
  };

  const toggleSubject = (subjectId: string) => {
    const isExpanded = expandedSubject === subjectId;
    const animatedValue = getAnimatedValue(subjectId);

    if (isExpanded) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpandedSubject(null);
    } else {
      if (expandedSubject) {
        const prevAnimatedValue = getAnimatedValue(expandedSubject);
        Animated.timing(prevAnimatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedSubject(subjectId);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const navigateToLecture = (subjectId: string, chapterId: number) => {
    router.push(`/lecture?subjectId=${subjectId}&chapterId=${chapterId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Subject</Text>
      </View>

      {lectures.map((data : any, index : number) => (
        <View key={index}>
          <Text style={styles.categoryTitle}>{data.category}</Text>
          <View style={styles.subjectsGrid}>
            {data.subject.map((subject : any, subIndex : number) => {
              const isExpanded = expandedSubject === subject.id;
              const animatedValue = getAnimatedValue(subject.id);

              return (
                <View key={subIndex} style={styles.subjectContainer}>
                  <TouchableOpacity
                    style={[styles.subjectCard, { borderColor: subject.color }]}
                    onPress={() => toggleSubject(subject.id)}
                  >
                    <View style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}>
                      <Text style={styles.subjectEmoji}>{subject.icon}</Text>
                    </View>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text
                      style={[
                        styles.expandIcon,
                        { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
                      ]}
                    >
                      ▼
                    </Text>
                  </TouchableOpacity>

                  <Animated.View
                    style={[
                      styles.chaptersContainer,
                      {
                        maxHeight: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        }),
                        opacity: animatedValue,
                      },
                    ]}
                  >
                    {subject.chapters.map((chapter : any, chapterIndex : number) => (
                      <TouchableOpacity
                        key={chapterIndex}
                        style={styles.chapterItem}
                        onPress={() => navigateToLecture(subject.id, chapter.id)}
                      >
                        <View style={styles.chapterContent}>
                          <Text style={styles.chapterName}>{chapter.name}</Text>
                          <Text style={styles.chapterProgress}>
                            {chapter.progress}/{chapter.total} lessons
                          </Text>
                        </View>

                        <View style={styles.chapterProgressBar}>
                          <View
                            style={[
                              styles.chapterProgressFill,
                              {
                                width: `${(chapter.progress / chapter.total) * 100}%`,
                                backgroundColor: subject.color,
                              },
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  categoryTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  subjectContainer: { width: '47%', marginBottom: 16 },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    position: 'relative',
  },
  subjectIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  subjectEmoji: { fontSize: 24 },
  subjectName: { fontSize: 14, fontWeight: '500', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  expandIcon: { fontSize: 12, color: '#6B7280', position: 'absolute', top: 12, right: 12 },
  chaptersContainer: { overflow: 'hidden', backgroundColor: '#F9FAFB', borderRadius: 8, marginTop: 8 },
  chapterItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  chapterContent: { marginBottom: 8 },
  chapterName: { fontSize: 14, fontWeight: '500', color: '#1F2937', marginBottom: 4 },
  chapterProgress: { fontSize: 12, color: '#6B7280' },
  chapterProgressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' },
  chapterProgressFill: { height: '100%', borderRadius: 2 },
});
