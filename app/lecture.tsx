import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { getLectures } from './api/course';

export default function LectureScreen() {
  const { subjectId, chapterId } = useLocalSearchParams<{ subjectId: string; chapterId: string }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Discussion'>('Video');
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        {['Video', 'Notes', 'Discussion'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.tabContent}>
        {activeTab === 'Video' && videoUpload && (
          // render mp4 or other video urls inside a small HTML player so it works across platforms
          <WebView
            originWhitelist={["*"]}
            source={{ html: `<!doctype html><html><head><meta name="viewport" content="initial-scale=1.0" /></head><body style="margin:0;padding:0;background:#000"><video controls style="width:100%;height:100%" src="${videoUpload.fileUrl}">Your browser does not support the video tag.</video></body></html>` }}
            style={{ flex: 1, height: 300, borderRadius: 12 }}
          />
        )}

        {activeTab === 'Video' && !videoUpload && (
          <View style={styles.videoPlaceholder}>
            <Text style={{ color: '#fff' }}>No video available</Text>
          </View>
        )}

        {activeTab === 'Notes' && notesUpload && (
          <WebView source={{ uri: notesUpload.fileUrl }} style={{ flex: 1 }} />
        )}

        {activeTab === 'Notes' && !notesUpload && (
          <View style={{ padding: 20 }}>
            <Text>No notes or documents available for this lecture.</Text>
          </View>
        )}

        {activeTab === 'Discussion' && (
          <ScrollView>
            <Text style={{ padding: 20 }}>💬 Discussions coming soon...</Text>
          </ScrollView>
        )}
      </View>
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
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#F59E0B' },
  tabText: { color: '#6B7280' },
  activeTabText: { color: '#F59E0B', fontWeight: '600' },
  tabContent: { flex: 1, padding: 20 },
  videoPlaceholder: { height: 200, backgroundColor: '#1F2937', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
