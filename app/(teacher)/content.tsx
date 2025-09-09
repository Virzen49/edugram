import { View, Text, StyleSheet } from 'react-native';

export default function TeacherContentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content</Text>
      <Text style={styles.subtle}>Manage lessons and assignments here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtle: { color: '#6B7280', marginTop: 8 },
});


