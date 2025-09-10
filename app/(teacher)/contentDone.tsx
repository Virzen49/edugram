import { View, Text, StyleSheet } from 'react-native';

export default function TeacherContentDoneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Content Uploaded Successfully!</Text>
      <Text style={styles.subtitle}>Your video and PDF have been saved for the selected grade, subject, and module.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#22C55E', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#374151', textAlign: 'center' },
});