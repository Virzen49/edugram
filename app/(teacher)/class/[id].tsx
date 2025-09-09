import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ClassDetailsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();

  const students = [
    { id: '1', name: 'Ethan Carter' },
    { id: '2', name: 'Olivia Bennett' },
    { id: '3', name: 'Noah Thompson' },
    { id: '4', name: 'Ava Harper' },
    { id: '5', name: 'Liam Foster' },
    { id: '6', name: 'Isabella Hayes' },
    { id: '7', name: 'Jackson Reed' },
    { id: '8', name: 'Sophia Morgan' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || `Class ${id}`}</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <View style={[styles.avatar, { backgroundColor: colors.funPalette[Number(item.id) % colors.funPalette.length] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.subtle}>Performance Summary</Text>
            </View>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionText}>Action</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 },
  studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  studentName: { color: colors.text, fontWeight: '700' },
  subtle: { color: colors.textMuted, marginTop: 2 },
  actionBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  actionText: { color: colors.text, fontWeight: '600' },
});


