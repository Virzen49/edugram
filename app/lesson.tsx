import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { getLectures } from './api/course';

export default function LessonScreen() {
  const { lessonId, subjectId, moduleId } =
    useLocalSearchParams<{
      lessonId: string;
      subjectId: string;
      moduleId: string;
    }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes'>('Video');
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
    load();
  }, [subjectId, moduleId, lessonId]);

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
        {['Video', 'Notes'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? '#10B981' : theme.textSecondary,
                },
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'Video' && (
          <View style={styles.videoContainer}>
            {youtubeId ? (
              <YoutubePlayer
                ref={playerRef}
                height={220}
                play={false}
                videoId={youtubeId}
              />
            ) : fileUrl.endsWith('.mp4') ? (
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head><meta name="viewport" content="initial-scale=1" /></head>
                      <body style="margin:0;background:#000;height:100%">
                        <video controls style="width:100%;height:100%">
                          <source src="${fileUrl}" type="video/mp4" />
                        </video>
                      </body>
                    </html>
                  `,
                }}
                style={{ height: 220, borderRadius: 12 }}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <Text style={{ padding: 20 }}>No video available</Text>
            )}
          </View>
        )}

        {activeTab === 'Notes' && (
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
    backgroundColor: '#10B981',
  },
  content: { flex: 1, padding: 20 },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    height: 220,
  },
});