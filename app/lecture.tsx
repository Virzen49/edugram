import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { WebView } from 'react-native-webview';
import lectures from './data/lectures';

// Helper function to calculate progress percentage
const calculateProgressPercentage = (progress: number, total: number) => {
  return progress > 0 && total > 0 ? (progress / total) * 100 : 0;
};

export default function LectureScreen() {
  const { subjectId, chapterId } = useLocalSearchParams<{ subjectId: string; chapterId: string }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Discussion'>('Video');

  // find lecture
  let lectureData: any = null;
  for (const cat of lectures) {
    for (const subj of cat.subject) {
      if (subj.id === subjectId) {
        lectureData = subj.chapters.find((c : any) => c.id === Number(chapterId));
      }
    }
  }

  if (!lectureData) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Lecture not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{lectureData.name}</Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Quest Progress</Text>
        <Text style={styles.progressText}>
          {lectureData.progress}/{lectureData.total}
        </Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${calculateProgressPercentage(lectureData.progress, lectureData.total)}%` }]}
          />
        </View>
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
        {activeTab === 'Video' && lectureData.fileType === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Text style={{ color: '#fff' }}>Video: {lectureData.fileUrl}</Text>
          </View>
        )}
        {activeTab === 'Notes' && lectureData.fileType === 'notes' && (
          <WebView source={{ uri: lectureData.fileUrl }} style={{ flex: 1 }} />
        )}
        {activeTab === 'Discussion' && (
          <ScrollView>
            <Text>💬 Discussions coming soon...</Text>
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
