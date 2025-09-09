import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';

export default function CoursesScreen() {
  const { theme, t } = useApp();
  const subjects = [
    { name: t('generalScience'), icon: '🔬', color: '#14B8A6' },
    { name: t('biology'), icon: '🧬', color: '#10B981' },
    { name: t('chemistry'), icon: '⚛️', color: '#F59E0B' },
    { name: t('physics'), icon: '⚗️', color: '#3B82F6' },
    { name: t('generalMath'), icon: '📐', color: '#14B8A6' },
    { name: t('algebra'), icon: '📊', color: '#8B5CF6' },
    { name: t('geometry'), icon: '📐', color: '#14B8A6' },
    { name: t('calculus'), icon: '∫', color: '#8B5CF6' },
    { name: t('computerScience'), icon: '💻', color: '#14B8A6' },
    { name: t('programming'), icon: '⌨️', color: '#3B82F6' },
    { name: t('robotics'), icon: '🤖', color: '#14B8A6' },
    { name: t('generalEngineering'), icon: '⚙️', color: '#14B8A6' },
    { name: t('mechanicalEngineering'), icon: '🔧', color: '#3B82F6' },
    { name: t('civilEngineering'), icon: '🏗️', color: '#14B8A6' },
  ];

  const categories = [
    { name: t('science'), subjects: subjects.slice(0, 4) },
    { name: t('mathematics'), subjects: subjects.slice(4, 8) },
    { name: t('technology'), subjects: subjects.slice(8, 11) },
    { name: t('engineering'), subjects: subjects.slice(11, 14) },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('selectSubject')}</Text>
      </View>

      {categories.map((category, index) => (
        <View key={index} style={styles.category}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.name}</Text>
          <View style={styles.subjectsGrid}>
            {category.subjects.map((subject, subIndex) => (
              <TouchableOpacity key={subIndex} style={[styles.subjectCard, { borderColor: subject.color, backgroundColor: theme.surface }]}>
                <View style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}>
                  <Text style={styles.subjectEmoji}>{subject.icon}</Text>
                </View>
                <Text style={[styles.subjectName, { color: theme.text }]}>{subject.name}</Text>
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  category: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  subjectCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    borderWidth: 2,
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
    textAlign: 'center',
  },
});