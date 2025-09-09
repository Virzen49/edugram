import { View, Text, StyleSheet } from 'react-native';

export default function TeacherSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtle}>Profile and app preferences.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtle: { color: '#6B7280', marginTop: 8 },
});


