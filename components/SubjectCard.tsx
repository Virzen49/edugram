import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SubjectCardProps {
  name: string;
  icon: string;
  color: string;
  lessons?: number;
  onPress?: () => void;
}

export default function SubjectCard({ name, icon, color, lessons, onPress }: SubjectCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      {lessons && (
        <Text style={styles.lessons}>{lessons} lessons</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  lessons: {
    fontSize: 12,
    color: '#6B7280',
  },
});