import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, FlatList, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

// Dummy colors and typography for demonstration. Replace with your actual imports.
const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  primary: '#E91E63',
  accent: '#22C55E',
  funPalette: ['#E91E63', '#22C55E', '#3B82F6', '#F59E42'],
  cardShadow: '#000',
};
const typography = {
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headline: { fontSize: 24, fontWeight: 'bold', color: colors.text },
};

export default function TeacherContentScreen() {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [quizChecklist, setQuizChecklist] = useState({ quiz: false });
  const [notesChecklist, setNotesChecklist] = useState({ note: false });
  const [uploadedVideo, setUploadedVideo] = useState(null);

  // Sample data for uploads and discover content
  const classData = useMemo(
    () => [
      { id: '10A', title: 'Class 10A', students: 25, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800' },
      { id: '11B', title: 'Class 11B', students: 30, image: 'https://images.unsplash.com/photo-1559223607-b32ab8dbfd54?w=800' },
      { id: '9C', title: 'Class 9C', students: 28, image: 'https://images.unsplash.com/photo-1577896849786-alsf?ixlib=rb-4.0.3' },
    ],
    []
  );

  const handleVideoUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video' });
    if (!result.canceled) setUploadedVideo(result);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Content</Text>

      {/* Selection Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Grade</Text>
        <Picker
          selectedValue={selectedGrade}
          onValueChange={setSelectedGrade}
          style={styles.picker}
        >
          <Picker.Item label="Select Grade" value="" />
          <Picker.Item label="Grade 1" value="1" />
          <Picker.Item label="Grade 2" value="2" />
        </Picker>

        <Text style={styles.sectionTitle}>Select Subject</Text>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={setSelectedSubject}
          style={styles.picker}
        >
          <Picker.Item label="Select Subject" value="" />
          <Picker.Item label="Math" value="math" />
          <Picker.Item label="Science" value="science" />
        </Picker>

        <Text style={styles.sectionTitle}>Select Module</Text>
        <Picker
          selectedValue={selectedModule}
          onValueChange={setSelectedModule}
          style={styles.picker}
        >
          <Picker.Item label="Select Module" value="" />
          <Picker.Item label="Module 1" value="mod1" />
          <Picker.Item label="Module 2" value="mod2" />
        </Picker>

        <Text style={styles.sectionTitle}>Select Chapter</Text>
        <Picker
          selectedValue={selectedChapter}
          onValueChange={setSelectedChapter}
          style={styles.picker}
        >
          <Picker.Item label="Select Chapter" value="" />
          <Picker.Item label="Chapter 1" value="ch1" />
          <Picker.Item label="Chapter 2" value="ch2" />
        </Picker>
      </View>

      {/* Upload Video Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Upload Video</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleVideoUpload}>
          <Text style={styles.uploadButtonText}>Select Video</Text>
        </TouchableOpacity>
        {uploadedVideo && uploadedVideo.assets && uploadedVideo.assets[0] && (
          <Text style={styles.selectedFile}>Selected: {uploadedVideo.assets[0].name}</Text>
        )}
      </View>

      {/* Auto-generated Quiz Checklist */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Auto-generated Quiz</Text>
        {Object.keys(quizChecklist).map(key => (
          <View key={key} style={styles.checklistItem}>
            <Text style={styles.checklistLabel}>{key.toUpperCase()}</Text>
            <Switch
              value={quizChecklist[key]}
              onValueChange={val => setQuizChecklist({ ...quizChecklist, [key]: val })}
            />
          </View>
        ))}
      </View>

      {/* Auto-generated Notes Checklist */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Auto-generated Notes</Text>
        {Object.keys(notesChecklist).map(key => (
          <View key={key} style={styles.checklistItem}>
            <Text style={styles.checklistLabel}>{key.toUpperCase()}</Text>
            <Switch
              value={notesChecklist[key]}
              onValueChange={val => setNotesChecklist({ ...notesChecklist, [key]: val })}
            />
          </View>
        ))}
      </View>

      {/* Your Content Section (My Uploads) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Content</Text>
        <FlatList
          horizontal
          data={classData}
          keyExtractor={(i) => i.id + "-up"}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <UploadCard title={item.title.replace('Class', 'Quest')} status="In Progress" image={item.image} />
          )}
        />
      </View>

      {/* Discover Content Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Discover Content</Text>
        <View style={styles.filtersRow}>
          <Chip label="Subject" />
          <Chip label="Grade" />
          <Chip label="Language" />
          <Chip label="Difficulty" />
        </View>
        <ContentCard
          title="Interactive Math Quest"
          subtitle="Engage students with this interactive quest covering algebra and geometry."
          cta="Add to My Assignments"
          image={classData[0].image}
        />
        <ContentCard
          title="Science Experiment Guide"
          subtitle="Step-by-step guide for a fun and educational science experiment."
          cta="Add to My Assignments"
          image={classData[2].image}
        />
      </View>
    </ScrollView>
  );
}

// Reused components from dashboard
function UploadCard({ title, status, image }: { title: string; status: string; image: string }) {
  return (
    <View style={styles.uploadCard}>
      <View style={[styles.uploadImage, { backgroundColor: colors.funPalette[Math.floor(Math.random() * colors.funPalette.length)] }]} />
      <Text style={styles.uploadTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.uploadStatus}>{status}</Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}><Text style={styles.chipText}>{label}</Text></View>
  );
}

function ContentCard({ title, subtitle, cta, image }: { title: string; subtitle: string; cta: string; image: string }) {
  return (
    <View style={styles.contentCard}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.contentSubtitle} numberOfLines={3}>{subtitle}</Text>
        <View style={styles.ctaBtn}><Text style={styles.ctaText}>{cta}</Text></View>
      </View>
      <Image source={{ uri: image }} style={styles.contentImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 8 },
  picker: { backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12 },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  uploadButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  selectedFile: { color: colors.text, fontSize: 14, marginTop: 4, marginBottom: 4 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  checklistLabel: { fontSize: 16, color: colors.text },
  uploadCard: { width: 160, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10 },
  uploadImage: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
  uploadTitle: { color: colors.text, fontWeight: '700' },
  uploadStatus: { color: colors.textMuted, marginTop: 2 },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontWeight: '600' },
  contentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 12 },
  contentTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  contentSubtitle: { color: colors.textMuted, marginBottom: 10 },
  ctaBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start' },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
  contentImage: { width: 110, height: 110, borderRadius: 10 },
});

