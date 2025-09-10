import { View, Text, StyleSheet, Image, ScrollView, Pressable, Animated, Easing, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { useRouter, usePathname } from 'expo-router';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { typography } from '@/styles/typography';
import { UserCircle2, Home, Users, BarChart2, BookOpen, Settings } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getProfile } from '../api/auth';
import { getTeacher } from '../api/course';

// ---------------- TYPES ----------------
type TeacherType = {
  teach_id: number;
  user_id: number;
  grade_id: number;
  grade: string;
  total_students: number;
};

// ---------------- MAIN COMPONENT ----------------
export default function TeacherSpaceScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome,');
  const [dateText, setDateText] = useState('');
  const [notifications, setNotifications] = useState(3);

  const [teacherList, setTeacherList] = useState<TeacherType[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  const menuAnimation = useRef(new Animated.Value(0)).current;
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // greeting
  useEffect(() => {
    const loadName = async () => {
      const storedName = await getProfile().then(res => res.ok && res.data ? res.data.user?.name : 'Teacher');
      const hour = new Date().getHours();
      const salutation = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
      setGreeting(`${salutation}, ${storedName}`);
      const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      setDateText(formatter.format(new Date()));
    };
    loadName();
  }, []);

  // teacher API
  useEffect(() => {
    let mounted = true;
    const fetchTeacher = async () => {
      setLoadingTeacher(true);
      try {
        const res = await getTeacher();
        if (res.ok && res.data) {
          const list = Array.isArray(res.data.teacher) ? res.data.teacher : [];
          if (mounted) setTeacherList(list);
        }
      } catch (e) {
        console.error("Failed to fetch teacher", e);
      } finally {
        if (mounted) setLoadingTeacher(false);
      }
    };
    fetchTeacher();
    return () => { mounted = false };
  }, []);

  const toggleProfileMenu = () => {
    if (showProfileMenu) {
      Animated.timing(menuAnimation, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowProfileMenu(false));
    } else {
      setShowProfileMenu(true);
      Animated.timing(menuAnimation, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  };

  const pathname = usePathname();
  const currentRoute = pathname.split('/').pop() || 'index';

  // ---------------- RENDER ----------------
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
      {/* HEADER */}
      <View style={[styles.topBar, { marginTop: 40, marginBottom: 20 }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.pageTitle}>Teacher Space</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Pressable onPress={() => router.push('/(teacher)/notifications')}>
                <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
                {notifications > 0 && (
                  <View style={styles.profileNotificationBadge}><Text style={styles.profileNotificationText}>{notifications}</Text></View>
                )}
              </Pressable>
              <Pressable onPress={() => router.push('/(teacher)/settings')}><UserCircle2 color={colors.text} size={22} /></Pressable>
            </View>
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
      </View>

      {/* MY CLASSES */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable style={styles.addContentButton} onPress={() => router.push('/(teacher)/content')}>
            <Text style={styles.addContentButtonText}>Add Content</Text>
          </Pressable>
          <Pressable style={styles.manageButton} onPress={() => router.push('/(teacher)/classes')}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </Pressable>
        </View>
      </View>
        {teacherList.map(t => (
          <Pressable
            key={t.grade_id}
            style={styles.classListCard}
            onPress={() =>
              router.push(`/(teacher)/class/${t.grade_id}?title=Grade ${t.grade}&students=${t.total_students}`)
            }
          >
            <View style={[styles.avatar, { backgroundColor: colors.funPalette[0] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.className}>Grade {t.grade}</Text>
              <Text style={styles.subtle}>{t.total_students} students</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      {/* -------- REST OF YOUR UI -------- */}
      {/* Attendance */}
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceStat}><Text style={styles.attendanceValue}>85%</Text><Text style={styles.attendanceLabel}>Overall</Text></View>
          <View style={styles.attendanceStat}><Text style={styles.attendanceValue}>42</Text><Text style={styles.attendanceLabel}>Present</Text></View>
          <View style={styles.attendanceStat}><Text style={styles.attendanceValue}>7</Text><Text style={styles.attendanceLabel}>Absent</Text></View>
        </View>
        <Text style={styles.attendanceDate}>Today's Attendance</Text>
      </View>

      {/* Analytics Overview */}
      <Pressable style={styles.analyticsCard} onPress={() => router.push('/(teacher)/analytics')}>
        <Text style={styles.analyticsTitle}>Overall Usage</Text>
        <View style={styles.graphContainer}>
          <Svg height="150" width="100%">
            <Line x1="0" y1="30" x2="100%" y2="30" stroke="#E5E7EB" strokeWidth="1" />
            <Line x1="0" y1="60" x2="100%" y2="60" stroke="#E5E7EB" strokeWidth="1" />
            <Line x1="0" y1="90" x2="100%" y2="90" stroke="#E5E7EB" strokeWidth="1" />
            <Line x1="0" y1="120" x2="100%" y2="120" stroke="#E5E7EB" strokeWidth="1" />
            <Polyline points="10,100 50,70 90,90 130,50 170,30 210,60 250,40" fill="none" stroke={colors.primary} strokeWidth="3" />
            <Circle cx="10" cy="100" r="4" fill={colors.primary} />
            <Circle cx="50" cy="70" r="4" fill={colors.primary} />
            <Circle cx="90" cy="90" r="4" fill={colors.primary} />
            <Circle cx="130" cy="50" r="4" fill={colors.primary} />
            <Circle cx="170" cy="30" r="4" fill={colors.primary} />
            <Circle cx="210" cy="60" r="4" fill={colors.primary} />
            <Circle cx="250" cy="40" r="4" fill={colors.primary} />
          </Svg>
        </View>
        <View style={styles.analyticsLegend}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <Text key={day} style={styles.legendItem}>{day}</Text>)}
        </View>
      </Pressable>

      {/* Top Performers */}
      <View style={{ marginTop: 20, marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
      </View>
      <View style={styles.topPerformersContainer}>
        <Pressable style={styles.performerCard}><View style={styles.performerRank}><Text style={styles.rankText}>1</Text></View><View style={styles.performerInfo}><Text style={styles.performerName}>Aditya Sharma</Text><Text style={styles.performerClass}>Standard 10</Text></View><Text style={styles.performerScore}>98%</Text></Pressable>
        <Pressable style={styles.performerCard}><View style={styles.performerRank}><Text style={styles.rankText}>2</Text></View><View style={styles.performerInfo}><Text style={styles.performerName}>Priya Patel</Text><Text style={styles.performerClass}>Standard 10</Text></View><Text style={styles.performerScore}>95%</Text></Pressable>
        <Pressable style={styles.performerCard}><View style={styles.performerRank}><Text style={styles.rankText}>3</Text></View><View style={styles.performerInfo}><Text style={styles.performerName}>Neha Gupta</Text><Text style={styles.performerClass}>Standard 11</Text></View><Text style={styles.performerScore}>92%</Text></Pressable>
      </View>

      {/* Weekly Schedule, FAB, etc. – keep same as your version */}
    </ScrollView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.primary },
  greeting: { ...typography.headline, fontSize: 18, marginTop: 8 },
  dateText: { ...typography.subtle, marginTop: 2 },
  card: { backgroundColor: colors.surface, padding: 12, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { ...typography.sectionTitle, marginBottom: 8 },
  classListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  className: { color: colors.text, fontWeight: '700' },
  subtle: { color: colors.textMuted, marginTop: 2 },
  manageButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  manageButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  profileNotificationBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: colors.chipDanger, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  profileNotificationText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  attendanceCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  attendanceStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  attendanceStat: { alignItems: 'center' },
  attendanceValue: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  attendanceLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  attendanceDate: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  analyticsCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  analyticsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.text },
  graphContainer: { marginTop: 10 },
  analyticsLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendItem: { color: colors.textMuted, fontSize: 12 },
  addContentButton: {
  backgroundColor: colors.chipSuccess,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
},
  addContentButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  topPerformersContainer: { gap: 10 },
  performerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  performerRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  rankText: { color: '#fff', fontWeight: '700' },
  performerInfo: { flex: 1 },
  performerName: { fontWeight: '700', color: colors.text },
  performerClass: { color: colors.textMuted, fontSize: 12 },
  performerScore: { fontWeight: '700', color: colors.text },
});