import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { getLectures } from './api/course';
import { CheckCircle, Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/contexts/AppContext';

export default function LectureScreen() {
  const { subjectId, chapterId } = useLocalSearchParams<{ subjectId: string; chapterId: string }>();
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Quiz'>('Video');
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!subjectId || !chapterId) {
        setError('Missing subject or chapter id');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await getLectures(Number(subjectId), Number(chapterId));
        if (res.ok && res.data && Array.isArray(res.data.uploads)) {
          setUploads(res.data.uploads);
        } else {
          setError(res.data?.message || `Failed to load uploads (status ${res.status})`);
        }
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [subjectId, chapterId]);

  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('completedLessons');
        if (completed) {
          const completedArray = JSON.parse(completed);
          setCompletedLessons(completedArray);
          // Check if current lesson is completed
          const lessonKey = `${activeTab.toLowerCase()}-lecture-${subjectId}-${chapterId}`;
          setIsCompleted(completedArray.includes(lessonKey));
        }
      } catch (error) {
        console.error('Error loading completion status:', error);
      }
    };
    
    loadCompletionStatus();
  }, [activeTab, subjectId, chapterId]);

  const markAsComplete = async () => {
    try {
      const lessonKey = `${activeTab.toLowerCase()}-lecture-${subjectId}-${chapterId}`;
      
      if (isCompleted) {
        Alert.alert('Already Completed', 'This section is already marked as complete!');
        return;
      }
      
      const updatedCompleted = [...completedLessons, lessonKey];
      await AsyncStorage.setItem('completedLessons', JSON.stringify(updatedCompleted));
      setCompletedLessons(updatedCompleted);
      setIsCompleted(true);
      
      Alert.alert(
        'Completed! 🎉',
        `${activeTab} section marked as complete. Great job!`,
        [
          {
            text: 'Continue Learning',
            onPress: () => {
              // Optional: Navigate back to courses or next lesson
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error marking as complete:', error);
      Alert.alert('Error', 'Failed to mark as complete. Please try again.');
    }
  };

  // pick primary video (first video-type upload) and first notes file
  const videoUpload = uploads.find(u => u.fileType === 'video');
  const notesUpload = uploads.find(u => u.fileType === 'notes');

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.progressText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (uploads.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No lecture uploads found for this module.</Text>
      </View>
    );
  }

  const title = videoUpload?.title || notesUpload?.title || uploads[0].title || 'Lecture';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress (simple: show number of uploads) */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Resources</Text>
        <Text style={styles.progressText}>{uploads.length} file{uploads.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Video', 'Notes', 'Quiz'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: theme.primary, fontWeight: '600' }]}>{tab}</Text>
            {activeTab === tab && <View style={[styles.activeTabIndicator, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.tabContent}>
        {activeTab === 'Video' && videoUpload && (
          <View>
            <View style={styles.videoContainer}>
              <WebView
                originWhitelist={["*"]}
                source={{ 
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body { margin: 0; padding: 0; background: #000; }
                          video { width: 100%; height: 300px; object-fit: cover; }
                        </style>
                      </head>
                      <body>
                        <video controls src="${videoUpload.fileUrl}">
                          Your browser does not support the video tag.
                        </video>
                      </body>
                    </html>
                  ` 
                }}
                style={{ flex: 1, height: 300, borderRadius: 16 }}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
            
            {/* Mark as Complete Button for Video */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                { 
                  backgroundColor: isCompleted ? '#10B981' : theme.primary,
                  opacity: isCompleted ? 0.7 : 1
                }
              ]}
              onPress={markAsComplete}
              disabled={isCompleted}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                {isCompleted ? '✓ Video Completed' : 'Mark Video as Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Video' && !videoUpload && (
          <View style={styles.videoPlaceholder}>
            <Text style={{ color: '#fff' }}>No video available</Text>
          </View>
        )}

        {activeTab === 'Notes' && notesUpload && (
          <View>
            <WebView source={{ uri: notesUpload.fileUrl }} style={{ flex: 1, height: 400 }} />
            
            {/* Mark as Complete Button for Notes */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                { 
                  backgroundColor: isCompleted ? '#10B981' : theme.primary,
                  opacity: isCompleted ? 0.7 : 1
                }
              ]}
              onPress={markAsComplete}
              disabled={isCompleted}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                {isCompleted ? '✓ Notes Completed' : 'Mark Notes as Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Notes' && !notesUpload && (
          <View style={{ padding: 20 }}>
            <Text>No notes or documents available for this lecture.</Text>
          </View>
        )}

        {activeTab === 'Quiz' && (
          <View style={styles.quizContainer}>
            <View style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Play size={32} color={theme.primary} />
                <Text style={styles.quizTitle}>Ready for Quiz?</Text>
              </View>
              <Text style={styles.quizDescription}>
                Test your knowledge with an interactive quiz based on this lecture content.
              </Text>
              <TouchableOpacity
                style={[styles.startQuizButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  router.push(`/quiz?lessonId=lecture-${subjectId}-${chapterId}&type=quiz&subjectId=${subjectId}&moduleId=${chapterId}`);
                }}
              >
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.startQuizText}>Start Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  error: { padding: 20, fontSize: 18, color: 'red' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 16 },
  backIcon: { fontSize: 24 },
  headerContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  bookmarkButton: { padding: 8 },
  bookmarkIcon: { fontSize: 18 },
  progressSection: { padding: 20 },
  progressTitle: { fontSize: 16, fontWeight: '600' },
  progressText: { marginBottom: 8 },
  progressBarBackground: { height: 8, backgroundColor: '#eee', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#14B8A6' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, alignItems: 'center', padding: 12 },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabText: { color: '#6B7280' },
  activeTabText: { color: '#F59E0B', fontWeight: '600' },
  tabContent: { flex: 1, padding: 20 },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    height: 300,
    marginHorizontal: 8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  videoPlaceholder: { height: 200, backgroundColor: '#1F2937', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quizContainer: {
    padding: 20,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
  },
  quizDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    color: '#6B7280',
  },
  startQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startQuizText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
