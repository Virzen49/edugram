import { View, Text, StyleSheet, Image, ScrollView, FlatList, Pressable, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { typography } from '@/styles/typography';
import { UserCircle2 } from 'lucide-react-native';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Hello,');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;

  const classData = useMemo(
    () => [
      { id: '10A', title: 'Class 10A', students: 25, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800' },
      { id: '11B', title: 'Class 11B', students: 30, image: 'https://images.unsplash.com/photo-1559223607-b32ab8dbfd54?w=800' },
      { id: '9C', title: 'Class 9C', students: 28, image: 'https://images.unsplash.com/photo-1577896849786-alsf?ixlib=rb-4.0.3' },
    ],
    []
  );

  const CARD_WIDTH = 260;
  const ITEM_SPACING = 12;

  useEffect(() => {
    const loadName = async () => {
      const storedName = (await AsyncStorage.getItem('displayName')) || 'Mr. Sharma';
      setGreeting(`Hello, ${storedName}`);
    };
    loadName();
    Animated.timing(progressAnim, {
      toValue: 0.75,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(greetingOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Animated.Text style={[styles.greeting, { opacity: greetingOpacity }]} accessibilityRole="header" accessibilityLabel={greeting}>
          {greeting}
        </Animated.Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Profile" style={[styles.profileBtn, { backgroundColor: colors.funPalette[2] }] }>
          <View style={styles.profileCircle}>
            <UserCircle2 color={colors.text} size={22} />
          </View>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>My Classes</Text>
      <View style={styles.quickActions}>
        <QuickAction label="Add Class" />
        <QuickAction label="Create Assignment" />
        <QuickAction label="Take Attendance" />
        <QuickAction label="Messages" />
      </View>
      <FlatList
        horizontal
        data={classData}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
        snapToInterval={CARD_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
        renderItem={({ item }) => (
          <ClassCard id={item.id} title={item.title} students={item.students} image={item.image} width={CARD_WIDTH} onPress={() => router.push(`/(teacher)/classes?selectedId=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.title)}&students=${item.students}`)} />
        )}
      />

      <Text style={styles.sectionTitle}>Class Overview</Text>

      {/* Compact stats row */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard, { minHeight: 100 }]}>
          <Text style={styles.cardTitle}>78%</Text>
          <Text style={styles.bodyText}>Avg. Quiz Score</Text>
        </View>
        <View style={[styles.card, styles.halfCard, { minHeight: 100 }]}>
          <Text style={styles.cardTitle}>3 Students</Text>
          <Text style={styles.bodyText}>Trouble Spots</Text>
        </View>
      </View>

      {/* Performance full-width card */}
      <View style={[styles.card]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardTitle}>Class Performance</Text>
          <View style={styles.viewTrends}><Text style={styles.viewTrendsText}>View Trends</Text></View>
        </View>
        <View style={styles.chartLine} />
        <View style={styles.chartLegend}>
          <View style={[styles.dot,{backgroundColor:colors.primary}]} />
          <Text style={styles.legendText}>Avg. Score</Text>
          <View style={[styles.dot,{backgroundColor:colors.accent, marginLeft:12}]} />
          <Text style={styles.legendText}>Target</Text>
        </View>
      </View>

      {/* My Uploads */}
      <Text style={styles.sectionTitle}>My Uploads</Text>
      <FlatList
        horizontal
        data={classData}
        keyExtractor={(i) => i.id+"-up"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => (
          <UploadCard title={item.title.replace('Class','Quest')} status="In Progress" image={item.image} />
        )}
      />

      {/* Discover Content */}
      <Text style={styles.sectionTitle}>Discover Content</Text>
      <View style={styles.filtersRow}>
        <Chip label="Subject" />
        <Chip label="Grade" />
        <Chip label="Language" />
        <Chip label="Difficulty" />
      </View>
      <ContentCard
        title="Interactive Math Quest"
        subtitle="Engage students with this interactive quest covering algebra and geometry."
        cta="Add to My Assignments"
        image={classData[0].image}
      />
      <ContentCard
        title="Science Experiment Guide"
        subtitle="Step-by-step guide for a fun and educational science experiment."
        cta="Add to My Assignments"
        image={classData[2].image}
      />

      
    </ScrollView>
  );
}

function QuickAction({ label }: { label: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1, minWidth: 0 }}>
      <Animated.View style={[styles.quickAction, { transform: [{ scale }] }]}> 
        <Text style={styles.quickActionText} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function ClassCard({ id, title, students, image, width, onPress }: { id?: string; title: string; students: number; image: string; width?: number; onPress?: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${students} students`} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={{ marginRight: 0 }}>
      <Animated.View style={[styles.classCard, { transform: [{ scale }], width: width ?? 220 }]}> 
        <View style={[styles.classImage, { backgroundColor: colors.funPalette[Math.floor(Math.random()*colors.funPalette.length)] }]} />
        <Text style={styles.classTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtle}>{students} students</Text>
      </Animated.View>
    </Pressable>
  );
}

function UploadCard({ title, status, image }: { title: string; status: string; image: string }) {
  return (
    <View style={styles.uploadCard}>
      <View style={[styles.uploadImage, { backgroundColor: colors.funPalette[Math.floor(Math.random()*colors.funPalette.length)] }]} />
      <Text style={styles.uploadTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.uploadStatus}>{status}</Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}><Text style={styles.chipText}>{label}</Text></View>
  );
}

function ContentCard({ title, subtitle, cta, image }: { title: string; subtitle: string; cta: string; image: string }) {
  return (
    <View style={styles.contentCard}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.contentSubtitle} numberOfLines={3}>{subtitle}</Text>
        <View style={styles.ctaBtn}><Text style={styles.ctaText}>{cta}</Text></View>
      </View>
      <Image source={{ uri: image }} style={styles.contentImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 28,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  greeting: {
    ...typography.headline,
    marginBottom: 0,
  },
  profileBtn: { padding: 0, borderRadius: 18 },
  profileCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    ...typography.sectionTitle,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  halfCard: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  bodyText: {
    color: colors.textMuted,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: colors.primary },
  metricText: {
    marginTop: 6,
    color: colors.textMuted,
    fontWeight: '600',
  },
  viewTrends: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  viewTrendsText: { color: colors.text, fontWeight: '600' },
  chartLine: { height: 80, backgroundColor: '#EEF2FF', borderRadius: 8, marginTop: 6, marginBottom: 10 },
  chartLegend: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'nowrap',
    marginBottom: 14,
  },
  quickAction: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  classCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
    width: 220,
  },
  classImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subtle: {
    color: colors.textMuted,
    marginTop: 2,
  },
  uploadCard: { width: 160, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10 },
  uploadImage: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
  uploadTitle: { color: colors.text, fontWeight: '700' },
  uploadStatus: { color: colors.textMuted, marginTop: 2 },
  contentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 12 },
  contentTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  contentSubtitle: { color: colors.textMuted, marginBottom: 10 },
  ctaBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start' },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
  contentImage: { width: 110, height: 110, borderRadius: 10 },
});


