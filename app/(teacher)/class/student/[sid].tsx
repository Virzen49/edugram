import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';

export default function StudentProfileScreen() {
  const { sid } = useLocalSearchParams<{ sid: string }>();
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.title}>{`Student ${sid}`}</Text>
          <Text style={styles.subtle}>Class Member</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.card}><Text style={styles.subtle}>Coming soon</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E9ECEF' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtle: { color: colors.textMuted },
  sectionTitle: { color: colors.text, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
});


