import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark, CheckCircle, Play } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { getLectures } from './api/course';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LessonScreen() {
  const { lessonId, subjectId, moduleId } =
    useLocalSearchParams<{
      lessonId: string;
      subjectId: string;
      moduleId: string;
    }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Quiz'>('Video');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme } = useApp();
  const playerRef = useRef<any>(null);

  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUpload, setCurrentUpload] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!subjectId || !moduleId) {
        setError('Missing subjectId or moduleId');
        return;
      }
      setLoading(true);
      try {
        const res = await getLectures(Number(subjectId), Number(moduleId));
        if (res.ok && Array.isArray(res.data?.uploads)) {
          setUploads(res.data.uploads);
          const found = res.data.uploads.find(
            (u: any) => String(u.lectId ?? u.id) === lessonId
          );
          setCurrentUpload(found || res.data.uploads[0]);
        } else {
          setError(res.data?.message || `Failed (status ${res.status})`);
        }
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    
    const loadCompletionStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('completedLessons');
        if (completed) {
          const completedArray = JSON.parse(completed);
          setCompletedLessons(completedArray);
          // Check if current lesson is completed
          const lessonKey = `${activeTab.toLowerCase()}-${lessonId}`;
          setIsCompleted(completedArray.includes(lessonKey));
        }
      } catch (error) {
        console.error('Error loading completion status:', error);
      }
    };
    
    load();
    loadCompletionStatus();
  }, [subjectId, moduleId, lessonId, activeTab]);

  const markAsComplete = async () => {
    try {
      const lessonKey = `${activeTab.toLowerCase()}-${lessonId}`;
      
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ padding: 20 }}>Loading...</Text>
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

  if (!currentUpload) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ padding: 20 }}>No resource found</Text>
      </View>
    );
  }

  const fileUrl = currentUpload.fileUrl || '';
  const youtubeMatch = fileUrl.match(
    /(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{5,})/
  );
  const youtubeId = youtubeMatch ? youtubeMatch[1] : null;

  // Check if file is doc/pdf/pptx
  const isDocFile =
    fileUrl.endsWith('.pdf') ||
    fileUrl.endsWith('.pptx') ||
    fileUrl.endsWith('.docx');

  const docViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    fileUrl
  )}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {currentUpload.title || 'Lesson'}
        </Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Bookmark size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        {['Video', 'Notes', 'Quiz'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? theme.primary : theme.textSecondary,
                },
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={[styles.activeTabIndicator, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'Video' && (
          <View>
            <View style={styles.videoContainer}>
              {youtubeId ? (
                <YoutubePlayer
                  ref={playerRef}
                  height={240}
                  play={false}
                  videoId={youtubeId}
                  webViewStyle={{ borderRadius: 16 }}
                />
              ) : fileUrl.endsWith('.mp4') ? (
                <WebView
                  originWhitelist={['*']}
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1">
                          <style>
                            body { margin: 0; padding: 0; background: #000; }
                            video { width: 100%; height: 240px; object-fit: cover; }
                          </style>
                        </head>
                        <body>
                          <video controls>
                            <source src="${fileUrl}" type="video/mp4" />
                          </video>
                        </body>
                      </html>
                    `,
                  }}
                  style={{ height: 240, borderRadius: 16 }}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              ) : (
                <Text style={{ padding: 20, color: '#fff' }}>No video available</Text>
              )}
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

        {activeTab === 'Notes' && (
          <View>
            <View style={{ flex: 1, height: 500 }}>
              {isDocFile ? (
                <WebView
                  source={{ uri: docViewerUrl }}
                  style={{ flex: 1 }}
                  startInLoadingState
                />
              ) : fileUrl ? (
                <WebView
                  source={{ uri: fileUrl }}
                  style={{ flex: 1 }}
                  startInLoadingState
                />
              ) : (
                <Text style={{ padding: 20 }}>
                  No notes or documents available.
                </Text>
              )}
            </View>
            
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
        
        {activeTab === 'Quiz' && (
          <View style={styles.quizContainer}>
            <View style={[styles.quizCard, { backgroundColor: theme.surface }]}>
              <View style={styles.quizHeader}>
                <Play size={32} color={theme.primary} />
                <Text style={[styles.quizTitle, { color: theme.text }]}>Ready for Quiz?</Text>
              </View>
              <Text style={[styles.quizDescription, { color: theme.textSecondary }]}>
                Test your knowledge with an interactive quiz based on this lesson content.
              </Text>
              <TouchableOpacity
                style={[styles.startQuizButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  router.push(`/quiz?lessonId=${lessonId}&type=quiz&subjectId=${subjectId}&moduleId=${moduleId}`);
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { marginRight: 16 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  bookmarkButton: { padding: 4 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500' },
  activeTabText: { fontWeight: '600' },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: { flex: 1, padding: 20 },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    height: 240,
    marginHorizontal: 8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
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
  },
  quizDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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