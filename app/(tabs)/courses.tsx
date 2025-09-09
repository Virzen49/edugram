import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CoursesScreen() {
  const subjects = [
    { name: 'General Science', icon: '🔬', color: '#14B8A6' },
    { name: 'Biology', icon: '🧬', color: '#10B981' },
    { name: 'Chemistry', icon: '⚛️', color: '#F59E0B' },
    { name: 'Physics', icon: '⚗️', color: '#3B82F6' },
    { name: 'General Math', icon: '📐', color: '#14B8A6' },
    { name: 'Algebra', icon: '📊', color: '#8B5CF6' },
    { name: 'Geometry', icon: '📐', color: '#14B8A6' },
    { name: 'Calculus', icon: '∫', color: '#8B5CF6' },
    { name: 'Computer Science', icon: '💻', color: '#14B8A6' },
    { name: 'Programming', icon: '⌨️', color: '#3B82F6' },
    { name: 'Robotics', icon: '🤖', color: '#14B8A6' },
    { name: 'General Engineering', icon: '⚙️', color: '#14B8A6' },
    { name: 'Mechanical Engineering', icon: '🔧', color: '#3B82F6' },
    { name: 'Civil Engineering', icon: '🏗️', color: '#14B8A6' },
  ];

  const categories = [
    { name: 'Science', subjects: subjects.slice(0, 4) },
    { name: 'Mathematics', subjects: subjects.slice(4, 8) },
    { name: 'Technology', subjects: subjects.slice(8, 11) },
    { name: 'Engineering', subjects: subjects.slice(11, 14) },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Subject</Text>
      </View>

      {categories.map((category, index) => (
        <View key={index} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <View style={styles.subjectsGrid}>
            {category.subjects.map((subject, subIndex) => (
              <TouchableOpacity key={subIndex} style={[styles.subjectCard, { borderColor: subject.color }]}>
                <View style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}>
                  <Text style={styles.subjectEmoji}>{subject.icon}</Text>
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  category: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectEmoji: {
    fontSize: 24,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
});