import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { getTeacher } from '../api/course';
import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function TeacherClassesScreen() {
  const router = useRouter();
  const { selectedId, title, students } = useLocalSearchParams<{ selectedId?: string; title?: string; students?: string }>();
  const [classes, setClasses] = useState<any>([]);
  const { theme } = useApp();

  // new state for teacher info
  const [teacher, setTeacher] = useState<any | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  const handleClass = async () => {
    try {
      const res = await getTeacher();
      if (res.ok && res.data) {
        console.log('Teacher data:', res.data);
        setClasses(res.data.teacher || []); // safe
      } else {
        console.error('Failed to fetch teacher data:', res.error || res.data);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  useEffect(() => {
    handleClass();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingTeacher(true);
      try {
        const res = await getTeacher();
        // API returns { message: "...", teacher: [ { ... } ] }
        const t = res?.data?.teacher;
        const first = Array.isArray(t) && t.length ? t[0] : (t || null);
        if (mounted) setTeacher(first);
      } catch (err) {
        console.warn('getTeacher failed', err);
        if (mounted) setTeacher(null);
      } finally {
        if (mounted) setLoadingTeacher(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // render teacher summary above classes list
  const TeacherSummary = () => {
    if (loadingTeacher) {
      return (
        <View style={{ padding: 12 }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }
    if (!teacher) return null;
    return (
      <View style={{ padding: 12, backgroundColor: theme.surface, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>
          Teacher • Grade {teacher.grade ?? '—'}
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Total students: {teacher.total_students ?? 0}
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Teacher ID: {teacher.teach_id ?? '—'}
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          User ID: {teacher.user_id ?? '—'}
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Grade ID: {teacher.grade_id ?? '—'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Class Management</Text>
          <Text style={styles.subtitle}>Manage your classes and students</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
      </View>

      {selectedId ? (
        <View style={styles.selectedBanner}>
          <Text style={styles.bannerText}>
            {title} • {students} students
          </Text>
        </View>
      ) : null}

      <TeacherSummary />

      <FlatList
        data={classes}
        keyExtractor={(item, idx) => (item.id ? String(item.id) : String(idx))}
        renderItem={({ item }) => (
          <Pressable
            style={styles.classRow}
            onPress={() =>
              router.push(
                `/(teacher)/class/${item.id}?title=${encodeURIComponent(item.title)}&students=${item.students}`
              )
            }
          >
            <Text style={styles.className}>{item.title ?? `Grade ${item.grade}`}</Text>
            <Text style={styles.classCount}>{item.students ?? item.total_students} students</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        style={{ marginTop: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 10,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtle: { color: '#6B7280', marginTop: 8 },
  selectedBanner: {
    marginTop: 8,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.funPalette[1],
  },
  bannerText: { color: colors.text, fontWeight: '700' },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 12,
  },
  className: { color: colors.text, fontWeight: '700' },
  classCount: { color: colors.textMuted },
});