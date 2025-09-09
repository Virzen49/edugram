import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';

export default function TeacherClassesScreen() {
  const router = useRouter();
  const { selectedId, title, students } = useLocalSearchParams<{ selectedId?: string; title?: string; students?: string }>();
  const classes = [
    { id: '10', title: 'Standard 10', students: 25 },
    { id: '11', title: 'Standard 11', students: 30 },
    { id: '9', title: 'Standard 9', students: 28 },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Class Management</Text>
      {selectedId ? (
        <View style={styles.selectedBanner}>
          <Text style={styles.bannerText}>{title} • {students} students</Text>
        </View>
      ) : null}
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.classRow} onPress={() => router.push(`/(teacher)/class/${item.id}?title=${encodeURIComponent(item.title)}&students=${item.students}`)}>
            <Text style={styles.className}>{item.title}</Text>
            <Text style={styles.classCount}>{item.students} students</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtle: { color: '#6B7280', marginTop: 8 },
  selectedBanner: { marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: colors.funPalette[1] },
  bannerText: { color: colors.text, fontWeight: '700' },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 12 },
  className: { color: colors.text, fontWeight: '700' },
  classCount: { color: colors.textMuted },
});


