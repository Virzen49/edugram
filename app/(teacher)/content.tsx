import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { getCategory, getModules } from '../api/course';
import { generateQuiz } from '../api/quiz';
import { useRouter } from 'expo-router';
import { createUpload, getGrade } from '../api/content';

const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  primary: '#E91E63',
  accent: '#22C55E',
};

export default function TeacherContentScreen() {
  const router = useRouter();

  const [stage, setStage] = useState(1); // 1 = metadata, 2 = video, 3 = pdf, 4 = quiz

  const [grades, setGrades] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [chapter, setChapter] = useState('');
  const [description, setDescription] = useState('');

  const [videoFile, setVideoFile] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<any>(null);

  const [quizLinks, setQuizLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // -------- Fetch dropdown data --------
  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      const res = await getGrade();
      if (res.ok && res.data && Array.isArray(res.data.grades)) {
        setGrades(res.data.grades);
      }
      setLoading(false);
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    if (!selectedGrade) return;
    const fetchCategories = async () => {
      const res = await getCategory(selectedGrade);
      if (res.ok && res.data && Array.isArray(res.data.module)) {
        setCategories(res.data.module);
      }
    };
    fetchCategories();
  }, [selectedGrade]);

  useEffect(() => {
    if (!selectedSubject) return;
    const fetchModules = async () => {
      const res = await getModules(Number(selectedSubject));
      if (res.ok && res.data && Array.isArray(res.data.module)) {
        setModules(res.data.module);
      }
    };
    fetchModules();
  }, [selectedSubject]);

  // -------- Handlers --------
  const handleVideoUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (result.canceled) return;

    const file = result.assets[0];
    setVideoFile(file);

    setLoading(true);
    try {
      const res = await createUpload(
        selectedModule,
        selectedSubject,
        chapter,
        description,
        {
          uri: file.uri,
          type: file.mimeType || 'video/mp4',
          name: file.name || `video_${Date.now()}.mp4`,
        }
      );

      if (res?.ok) {
        Alert.alert('Success', 'Video uploaded successfully');
      } else {
        console.error('createUpload(video) response:', res);
        Alert.alert('Error', 'Failed to upload video');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });
    if (result.canceled) return;

    const file = result.assets[0];
    setPdfFile(file);

    setLoading(true);
    try {
      const res = await createUpload(
        selectedModule,
        selectedSubject,
        chapter,
        description,
        {
          uri: file.uri,
          type: file.mimeType || 'application/pdf',
          name: file.name || `notes_${Date.now()}.pdf`,
        }
      );

      if (res?.ok) {
        Alert.alert('Success', 'PDF uploaded successfully');
      } else {
        console.error('createUpload(pdf) response:', res);
        Alert.alert('Error', 'Failed to upload PDF');
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      Alert.alert('Error', 'Failed to upload PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const res = await generateQuiz(
        Number(selectedSubject),
        Number(selectedModule)
      );
      if (res.ok && res.data?.links) {
        setQuizLinks(res.data.links);
      } else {
        Alert.alert('Error', 'Failed to generate quiz');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
    setLoading(false);
  };

  // -------- Render stages --------
  const renderStage = () => {
    if (loading) {
      return (
        <View style={[styles.card, { alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10 }}>Processing...</Text>
        </View>
      );
    }

    switch (stage) {
      case 1:
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Grade</Text>
            <Picker
              selectedValue={selectedGrade}
              onValueChange={setSelectedGrade}
              style={styles.picker}
            >
              <Picker.Item label="Select Grade" value="" />
              {grades.map((g) => (
                <Picker.Item key={g.grade_id} label={g.grade} value={g.grade} />
              ))}
            </Picker>

            <Text style={styles.sectionTitle}>Select Subject</Text>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={setSelectedSubject}
              style={styles.picker}
            >
              <Picker.Item label="Select Subject" value="" />
              {categories.map((c) => (
                <Picker.Item
                  key={c.cat_id}
                  label={c.category_name}
                  value={c.cat_id}
                />
              ))}
            </Picker>

            <Text style={styles.sectionTitle}>Select Module</Text>
            <Picker
              selectedValue={selectedModule}
              onValueChange={setSelectedModule}
              style={styles.picker}
            >
              <Picker.Item label="Select Module" value="" />
              {modules.map((m) => (
                <Picker.Item
                  key={m.mod_id}
                  label={m.module_name}
                  value={m.mod_id.toString()}
                />
              ))}
            </Picker>

            <Text style={styles.sectionTitle}>Chapter</Text>
            <TextInput
              style={styles.textInput}
              value={chapter}
              onChangeText={setChapter}
              placeholder="Enter chapter name"
            />

            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
            />

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStage(2)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upload Video</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleVideoUpload}
            >
              <Text style={styles.uploadButtonText}>Select Video</Text>
            </TouchableOpacity>
            {videoFile?.name && (
              <Text style={styles.selectedFile}>{videoFile.name}</Text>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStage(3)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upload PDF</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePdfUpload}
            >
              <Text style={styles.uploadButtonText}>Select PDF</Text>
            </TouchableOpacity>
            {pdfFile?.name && (
              <Text style={styles.selectedFile}>{pdfFile.name}</Text>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStage(4)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Generate Quiz</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleGenerateQuiz}
              disabled={loading}
            >
              <Text style={styles.uploadButtonText}>
                {loading ? 'Generating...' : 'Generate Quiz'}
              </Text>
            </TouchableOpacity>

            {quizLinks.length > 0 &&
              quizLinks.map((link, idx) => (
                <Text key={idx} style={{ color: colors.text, marginTop: 8 }}>
                  🔗 {link}
                </Text>
              ))}

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/(teacher)/contentDone')}
            >
              <Text style={styles.nextButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return <ScrollView style={styles.container}>{renderStage()}</ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  picker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})