import { View, Text, StyleSheet, Image, ScrollView, FlatList, Pressable, Animated, Easing, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { typography } from '@/styles/typography';
import { UserCircle2 } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Hello,');
  const [dateText, setDateText] = useState('');
  const [syncStatus, setSyncStatus] = useState<'online'|'offline'|'syncing'>('online');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [messages, setMessages] = useState<Array<{id:string; sender:string; preview:string; time:string}>>([]);
  const [composeVisible, setComposeVisible] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Monday');
  const [scheduleType, setScheduleType] = useState('class');
  
  // Reference to the WeeklySchedule component
  // Define the type for the WeeklySchedule component ref
type WeeklyScheduleRefType = {
  addScheduleItem: (day: string, item: {time: string, title: string, type: string}) => void;
};

const weeklyScheduleRef = useRef<WeeklyScheduleRefType>(null);
  const navigateAndClose = (path: any) => {
    setShowFabMenu(false);
    setTimeout(() => router.push(path), 100);
  };
  const handleReply = async (id: string) => {
    const outboxRaw = (await AsyncStorage.getItem('outbox')) || '[]';
    const outbox = JSON.parse(outboxRaw);
    outbox.push({ id: `reply-${Date.now()}`, to: id, type: 'text', body: 'Thanks, noted.' });
    await AsyncStorage.setItem('outbox', JSON.stringify(outbox));
  };
  const progressAnim = useRef(new Animated.Value(0)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;

  const [classData, setClassData] = useState([
    { id: '10A', title: 'Class 10A', students: 25, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800' },
    { id: '11B', title: 'Class 11B', students: 30, image: 'https://images.unsplash.com/photo-1559223607-b32ab8dbfd54?w=800' },
    { id: '9C', title: 'Class 9C', students: 28, image: 'https://images.unsplash.com/photo-1577896849786-alsf?ixlib=rb-4.0.3' },
  ]);
  
  // Notification state
  const [notifications, setNotifications] = useState(3); // Number of unread notifications

  const CARD_WIDTH = 260;
  const ITEM_SPACING = 12;
  
  // Function to save class data to AsyncStorage
  const saveClassData = async (data: any) => {
    try {
      await AsyncStorage.setItem('teacherClassData', JSON.stringify(data));
      // Increment notifications when class data changes
      setNotifications(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save class data:', error);
    }
  };

  useEffect(() => {
    const loadName = async () => {
      const storedName = (await AsyncStorage.getItem('displayName')) || 'Mr. Sharma';
      const hour = new Date().getHours();
      const salutation = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
      setGreeting(`${salutation}, ${storedName} 👋`);
      const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      setDateText(formatter.format(new Date()));
    };
    loadName();
    const loadMessages = async () => {
      const raw = await AsyncStorage.getItem('messages');
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([
        { id: 'm1', sender: "Parent - Anil's Mom", preview: 'Can we discuss today\'s homework?', time: '10:24 AM' },
        { id: 'm2', sender: 'School Admin', preview: 'Meeting moved to Thursday.', time: '9:10 AM' },
      ]);
    };
    loadMessages();
    
    // Load class data from AsyncStorage
    const loadClassData = async () => {
      try {
        const savedClassData = await AsyncStorage.getItem('teacherClassData');
        if (savedClassData) {
          setClassData(JSON.parse(savedClassData));
        }
      } catch (error) {
        console.error('Failed to load class data:', error);
      }
    };
    loadClassData();
    
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
    const ping = async () => {
      try {
        setSyncStatus('syncing');
        await fetch('http://10.103.211.237:3000/', { method: 'HEAD' });
        setSyncStatus('online');
        // Flush outbox if present
        const outboxRaw = await AsyncStorage.getItem('outbox');
        if (outboxRaw) {
          await AsyncStorage.removeItem('outbox');
        }
      } catch {
        setSyncStatus('offline');
      }
    };
    ping();
    const t = setInterval(ping, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View>
          <Animated.Text style={[styles.greeting, { opacity: greetingOpacity }]} accessibilityRole="header" accessibilityLabel={greeting}>
            {greeting}
          </Animated.Text>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.syncPill, syncStatus === 'online' ? { backgroundColor: '#E7F6E9' } : syncStatus === 'offline' ? { backgroundColor: '#FDE2E1' } : { backgroundColor: '#FFF4CC' } ]}>
            <MaterialCommunityIcons name={syncStatus === 'online' ? 'cloud-check' : syncStatus === 'offline' ? 'cloud-off-outline' : 'cloud-sync-outline'} size={16} color={colors.text} />
            <Text style={styles.syncText}>{syncStatus}</Text>
          </View>
          <Pressable 
            style={{ marginRight: 10, position: 'relative' }}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setNotifications(0);
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {notifications > 0 && (
              <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: colors.chipDanger, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{notifications}</Text>
              </View>
            )}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" style={[styles.profileBtn, { backgroundColor: colors.funPalette[2] }] }>
            <View style={styles.profileCircle}>
              <UserCircle2 color={colors.text} size={22} />
            </View>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }} style={{ marginBottom: 8 }}>
        <HeroAction label="Start Session" icon="run" onPress={() => router.push('/(teacher)/class/10A?title=Class%2010A&students=25')} />
        <HeroAction label="Start Lesson" icon="book-open-variant" onPress={() => router.push('/(teacher)/content')} />
        <HeroAction label="Activity" icon="gamepad-variant-outline" onPress={() => router.push('/(teacher)/content')} />
        <HeroAction label="Quick Quiz" icon="clipboard-text-outline" onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(teacher)/quiz'); }} />
        <HeroAction label="Parent Update" icon="send" onPress={() => setComposeVisible(true)} />
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        <Pressable 
          onPress={() => {
            Alert.alert(
              'My Classes',
              'Manage your classes, view student details, and track attendance. Long press on a class card for more options.'
            );
          }}
          style={{ marginLeft: 8 }}
        >
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.text} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flex: 1 }} />
        <Pressable 
          onPress={() => {
            Alert.alert(
              'Add New Class',
              'Enter a name for the new class',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Add',
                  onPress: () => {
                    const newClass = {
                      id: Date.now().toString(),
                      title: 'New Class',
                      students: 0,
                      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
                    };
                    const updatedClasses = [...classData, newClass];
                    setClassData(updatedClasses);
                    
                    // Save to AsyncStorage using the saveClassData function
                    saveClassData(updatedClasses);
                    
                    // Show success message
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
              ]
            );
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Add Class</Text>
        </Pressable>
      </View>
      {classData.map((c) => (
        <Pressable
          key={c.id}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
              c.title,
              `${c.students} Students`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete Class', 
                  style: 'destructive',
                  onPress: () => {
                    const updatedClasses = classData.filter(cls => cls.id !== c.id);
                    setClassData(updatedClasses);
                    
                    // Save to AsyncStorage using the saveClassData function
                    saveClassData(updatedClasses);
                      
                    // Show success message
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
              ]
            );
          }}
        >
          <ClassListCard title={c.title} students={c.students} onPress={() => router.push(`/(teacher)/class/${c.id}?title=${encodeURIComponent(c.title)}&students=${c.students}`)} />
        </Pressable>
      ))}

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

      {/* Performance full-width card - simple svg line chart */}
      <View style={[styles.card]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardTitle}>Class Performance</Text>
          <View style={styles.viewTrends}><Text style={styles.viewTrendsText}>View Trends</Text></View>
        </View>
        <View style={{ height: 120, marginTop: 8, marginBottom: 10, justifyContent: 'center' }}>
          <View style={{ height: 2, backgroundColor: '#EEF2FF', position: 'absolute', left: 0, right: 0, top: 60 }} />
          <View style={{ height: 2, backgroundColor: '#F3F4F6', position: 'absolute', left: 0, right: 0, top: 90 }} />
          <View style={{ height: 2, backgroundColor: '#F3F4F6', position: 'absolute', left: 0, right: 0, top: 30 }} />
          <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end' }}>
            { [60,65,70,68,75].map((v,i)=> (
              <Pressable key={i} onPress={()=>alert(`Avg: ${v}%`)} style={{ width: 40, height: 2, backgroundColor: colors.primary, marginLeft: i===0?0:8, transform: [{ translateY: -(v-50) }] }} />
            )) }
          </View>
        </View>
        <View style={styles.chartLegend}>
          <View style={[styles.dot,{backgroundColor:colors.primary}]} />
          <Text style={styles.legendLabel}>Avg. Score</Text>
          <View style={[styles.dot,{backgroundColor:'#EAB308', marginLeft:12}]} />
          <Text style={styles.legendLabel}>Target</Text>
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
      {/* Analytics Snapshot */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Analytics Snapshot</Text>
          <Pressable 
            onPress={() => {
              Alert.alert(
                'Analytics Overview',
                'Quick overview of key metrics across all your classes. Tap on any card to see detailed analytics.'
              );
            }}
            style={{ marginLeft: 8 }}
          >
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }} contentContainerStyle={{ paddingRight: 8 }}>
        <Pressable onPress={() => Alert.alert('Literacy Analytics', 'View detailed literacy performance across all classes.')}>
          <MetricCard icon="book-open-page-variant" label="Literacy" value={72} color={colors.chipSuccess} />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Numeracy Analytics', 'Track numeracy skills and identify areas for improvement.')}>
          <MetricCard icon="abacus" label="Numeracy" value={64} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Participation Analytics', 'Monitor student engagement and participation metrics.')}>
          <MetricCard icon="drama-masks" label="Participation" value={81} color={colors.chipInfo} />
        </Pressable>
        <Pressable onPress={() => Alert.alert('Attendance Analytics', 'View detailed attendance reports for all classes.')}>
          <MetricCard icon="target" label="Attendance" value={92} color={colors.chipWarn} />
        </Pressable>
      </ScrollView>

      {/* Weekly Schedule */}
      <View style={{marginBottom: 16}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <Pressable 
              onPress={() => {
                Alert.alert(
                  'Weekly Schedule',
                  'View and manage your weekly classes, meetings, and events. Long press on any schedule item to delete it. Add new items using the Add Item button.'
                );
              }}
              style={{ marginLeft: 8 }}
            >
              <MaterialCommunityIcons name="information-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
          <Pressable onPress={() => setComposeVisible(true)} accessibilityRole="button" accessibilityLabel="Add schedule item">
            <Text style={{color: colors.primary, fontWeight: '600'}}>Add Item</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleContainer}>
          <WeeklySchedule ref={weeklyScheduleRef} />
        </ScrollView>
      </View>
      
      {/* Add Schedule Modal */}
      <Modal visible={composeVisible} transparent animationType="fade" onRequestClose={() => setComposeVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setComposeVisible(false)}>
          <View style={styles.composeCard}>
            <Text style={styles.composeTitle}>Add Schedule Item</Text>
            <TextInput style={styles.input} placeholder="Enter title" placeholderTextColor={colors.textMuted} value={scheduleTitle} onChangeText={setScheduleTitle} />
            <TextInput style={styles.input} placeholder="Enter time (e.g. 10:00 AM)" placeholderTextColor={colors.textMuted} value={scheduleTime} onChangeText={setScheduleTime} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleDay === 'Monday' && {backgroundColor: colors.primary}]} onPress={() => setScheduleDay('Monday')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Mon</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleDay === 'Tuesday' && {backgroundColor: colors.primary}]} onPress={() => setScheduleDay('Tuesday')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Tue</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleDay === 'Wednesday' && {backgroundColor: colors.primary}]} onPress={() => setScheduleDay('Wednesday')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Wed</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleDay === 'Thursday' && {backgroundColor: colors.primary}]} onPress={() => setScheduleDay('Thursday')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Thu</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleDay === 'Friday' && {backgroundColor: colors.primary}]} onPress={() => setScheduleDay('Friday')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Fri</Text></Pressable>
             </View>
             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleType === 'class' && {backgroundColor: colors.primary}]} onPress={() => setScheduleType('class')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Class</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleType === 'meeting' && {backgroundColor: colors.primary}]} onPress={() => setScheduleType('meeting')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Meeting</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleType === 'event' && {backgroundColor: colors.primary}]} onPress={() => setScheduleType('event')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Event</Text></Pressable>
               <Pressable style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, scheduleType === 'training' && {backgroundColor: colors.primary}]} onPress={() => setScheduleType('training')}><Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Training</Text></Pressable>
             </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable style={styles.secondaryBtnSmall} onPress={() => setComposeVisible(false)}><Text style={styles.sheetLabel}>Cancel</Text></Pressable>
              <Pressable style={styles.primaryBtnSmall} onPress={async () => { 
                if (!scheduleTitle.trim() || !scheduleTime.trim()) return; 
                // Add the new schedule item to the appropriate day
                if (weeklyScheduleRef.current) {
                  weeklyScheduleRef.current.addScheduleItem(scheduleDay, {
                    time: scheduleTime,
                    title: scheduleTitle,
                    type: scheduleType
                  });
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                setScheduleTitle('');
                setScheduleTime('');
                setScheduleDay('Monday');
                setScheduleType('class');
                setComposeVisible(false); 
              }}><Text style={{ color:'#FFFFFF', fontWeight:'700' }}>Add</Text></Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Gamification */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }} style={{ marginBottom: 8 }}>
        <Badge label="Mentor" />
        <Badge label="Innovator" />
        <Badge label="Attendance Star" />
        <Badge label="Lesson Pro" />
        <Badge label="Quiz Master" />
      </ScrollView>
      <View style={styles.microMotivation}><Text style={styles.microText}>You saved 2 hours this week with auto-quizzes! 🎉</Text></View>

      {/* Teacher Growth */}
      <Text style={styles.sectionTitle}>Your Learning Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
        <LearnCard title="5-min: Fun with AR" progress={0.4} />
        <LearnCard title="Better Parent Comms" progress={0.7} />
        <LearnCard title="Micro Assessments" progress={0.2} />
      </ScrollView>

      {/* FAB */}
      <View style={{ height: 80 }} />

      
      <Pressable style={styles.fab} accessibilityRole="button" accessibilityLabel="Create" onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowFabMenu(true); }}>
        <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
      </Pressable>
      <Modal visible={showFabMenu} transparent animationType="fade" onRequestClose={() => setShowFabMenu(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowFabMenu(false)}>
          <View style={styles.sheet}>
            <SheetItem icon="account-plus" label="Add Student" onPress={async () => { await Haptics.selectionAsync(); navigateAndClose('/(teacher)/classes'); }} />
            <SheetItem icon="file-plus" label="Create Activity" onPress={async () => { await Haptics.selectionAsync(); navigateAndClose('/(teacher)/content'); }} />
            <SheetItem icon="alert-circle-outline" label="Report Issue" onPress={async () => { await Haptics.selectionAsync(); navigateAndClose('/(teacher)/settings'); }} />
          </View>
        </Pressable>
      </Modal>
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

function HeroAction({ label, icon, onPress }: { label: string; icon: any; onPress?: () => void }) {
  return (
    <Pressable style={styles.heroAction} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.heroIconWrap, { backgroundColor: colors.funPalette[Math.floor(Math.random()*colors.funPalette.length)] }]}>
        <MaterialCommunityIcons name={icon} color={colors.text} size={22} />
      </View>
      <Text style={styles.heroLabel}>{label}</Text>
    </Pressable>
  );
}

function ClassListCard({ title, students, onPress }: { title: string; students: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.classListCard}>
      <View style={[styles.avatar, { backgroundColor: colors.funPalette[0] }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.className}>{title}</Text>
        <Text style={styles.subtle}>{`${Math.floor(students*0.75)}/${students} present today`}</Text>
        <View style={styles.miniTrack}><View style={[styles.miniFill, { width: '65%' }]} /></View>
      </View>
      <View style={styles.alertDot} />
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

function MetricCard({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <View style={styles.metricCardSmall}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.text} />
      <Text style={styles.metricLabelSmall}>{label}</Text>
      <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${value}%`, backgroundColor: color }]} /></View>
      <Text style={styles.metricValueSmall}>{value}%</Text>
    </View>
  );
}

function MessageItem({ sender, preview, time, onReply }: { sender: string; preview: string; time: string; onReply?: () => void }) {
  return (
    <View style={styles.messageRow}>
      <View style={[styles.avatar, { backgroundColor: colors.funPalette[3] }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.sender}>{sender}</Text>
        <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
      <Pressable style={styles.replyBtn} onPress={onReply}><Text style={styles.replyText}>Reply</Text></Pressable>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}><Text style={styles.badgeText}>{label}</Text></View>
  );
}

function LearnCard({ title, progress }: { title: string; progress: number }) {
  return (
    <View style={styles.learnCard}>
      <Text style={styles.learnTitle}>{title}</Text>
      <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.floor(progress*100)}%` }]} /></View>
    </View>
  );
}

function SheetItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.sheetItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
      <Text style={styles.sheetLabel}>{label}</Text>
    </Pressable>
  );
}

// Define the interface for the WeeklySchedule component props and ref
interface WeeklyScheduleProps {}

const WeeklySchedule = forwardRef<WeeklyScheduleRefType, WeeklyScheduleProps>((props, ref) => {
  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    
    const monday = new Date(today.setDate(diff));
    const weekDates = [];
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };
  
  const weekDates = getCurrentWeekDates();
  
  // State for schedule data
  const [scheduleData, setScheduleData] = useState<Array<{day: string; items: Array<{id: string; time: string; title: string; type: string}>}>>([
    { day: 'Monday', items: [
      { id: '1', time: '9:00 AM', title: 'Class 10A - Math', type: 'class' },
      { id: '2', time: '11:30 AM', title: 'Staff Meeting', type: 'meeting' },
      { id: '3', time: '2:00 PM', title: 'Class 11B - Physics', type: 'class' },
    ]},
    { day: 'Tuesday', items: [
      { id: '4', time: '10:00 AM', title: 'Class 9C - Chemistry', type: 'class' },
      { id: '5', time: '1:00 PM', title: 'Parent-Teacher Meeting', type: 'meeting' },
    ]},
    { day: 'Wednesday', items: [
      { id: '6', time: '9:00 AM', title: 'Class 10A - Math', type: 'class' },
      { id: '7', time: '12:00 PM', title: 'Department Lunch', type: 'event' },
      { id: '8', time: '2:00 PM', title: 'Class 11B - Physics', type: 'class' },
    ]},
    { day: 'Thursday', items: [
      { id: '9', time: '10:00 AM', title: 'Class 9C - Chemistry', type: 'class' },
      { id: '10', time: '3:00 PM', title: 'Professional Development', type: 'training' },
    ]},
    { day: 'Friday', items: [
      { id: '11', time: '9:00 AM', title: 'Class 10A - Math', type: 'class' },
      { id: '12', time: '11:00 AM', title: 'School Assembly', type: 'event' },
      { id: '13', time: '2:00 PM', title: 'Class 11B - Physics', type: 'class' },
    ]},
  ]);
  
  // Load schedule data from AsyncStorage on component mount
  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const savedSchedule = await AsyncStorage.getItem('teacherSchedule');
        if (savedSchedule) {
          setScheduleData(JSON.parse(savedSchedule));
        }
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      }
    };
    
    loadScheduleData();
  }, []);
  
  // Function to add a new schedule item
  const addScheduleItem = (day: string, newItem: { time: string; title: string; type: string }) => {
    const updatedSchedule = scheduleData.map(daySchedule => {
      if (daySchedule.day === day) {
        return {
          ...daySchedule,
          items: [...daySchedule.items, { ...newItem, id: Date.now().toString() }]
        };
      }
      return daySchedule;
    });
    
    setScheduleData(updatedSchedule);
    saveScheduleData(updatedSchedule);
  };
  
  // Function to delete a schedule item
  const deleteScheduleItem = (itemId: string) => {
    const updatedSchedule = scheduleData.map(daySchedule => ({
      ...daySchedule,
      items: daySchedule.items.filter(item => item.id !== itemId)
    }));
    
    setScheduleData(updatedSchedule);
    saveScheduleData(updatedSchedule);
  };
  
  // Function to save schedule data to AsyncStorage
  const saveScheduleData = async (data: any) => {
    try {
      await AsyncStorage.setItem('teacherSchedule', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save schedule data:', error);
    }
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addScheduleItem,
    deleteScheduleItem
  }));
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'class': return colors.primary;
      case 'meeting': return colors.chipInfo;
      case 'event': return colors.chipSuccess;
      case 'training': return colors.chipWarn;
      default: return colors.textMuted;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };
  
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  return (
    <View style={styles.weeklySchedule}>
      {scheduleData.map((daySchedule, index) => (
        <View key={daySchedule.day} style={styles.dayColumn}>
          <View style={[styles.dayHeader, new Date().getDay() - 1 === index ? styles.currentDayHeader : null]}>
            <Text style={styles.dayName}>{getDayName(weekDates[index])}</Text>
            <Text style={styles.dayDate}>{formatDate(weekDates[index])}</Text>
          </View>
          <View style={styles.scheduleItems}>
            {daySchedule.items.map((item) => (
              <Pressable 
                key={item.id} 
                style={styles.scheduleItem}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Schedule Item',
                    `${item.title} at ${item.time}`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => deleteScheduleItem(item.id)
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <View style={[styles.scheduleItemContent, { borderLeftColor: getTypeColor(item.type) }]}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleType}>{item.type}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    notificationBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: colors.chipDanger,
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
  scheduleContainer: {
    marginBottom: 16,
  },
  weeklySchedule: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayColumn: {
    width: 200,
    marginRight: 12,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  currentDayHeader: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.primary,
  },
  dayName: {
    fontWeight: '700',
    color: colors.text,
  },
  dayDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  scheduleItems: {
    gap: 8,
  },
  scheduleItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  scheduleTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  scheduleItemContent: {
    borderLeftWidth: 3,
    paddingLeft: 8,
  },
  scheduleTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  scheduleType: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
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
  dateText: { ...typography.subtle, marginTop: 2 },
  syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  syncText: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  profileBtn: { padding: 0, borderRadius: 18 },
  profileCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    ...typography.sectionTitle,
    marginTop: 8,
    marginBottom: 8,
  },
  heroAction: { width: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginRight: 10, alignItems: 'center' },
  heroIconWrap: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroLabel: { color: colors.text, fontWeight: '700' },
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
  legendLabel: { color: colors.textMuted },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontWeight: '600' },
  metricCard: { width: 160, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginRight: 10 },
  metricLabel: { color: colors.textMuted, marginTop: 6, marginBottom: 6 },
  metricValue: { color: colors.text, fontWeight: '700', marginTop: 6 },
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
  classListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  className: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  miniTrack: { width: 140, height: 6, borderRadius: 4, backgroundColor: '#E9ECEF', marginTop: 6 },
  miniFill: { height: 6, borderRadius: 4, backgroundColor: colors.primary },
  alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.chipDanger },
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
  listCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 2, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border },
  microMotivation: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, marginBottom: 12 },
  microText: { color: colors.text, fontWeight: '600' },
  
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, paddingVertical: 6, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
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
  metricCardSmall: {
    width: 120,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 10,
  },
  metricLabelSmall: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  metricValueSmall: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  messageRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  sender: { fontWeight: '700', color: colors.text, marginBottom: 2 },
  preview: { color: colors.textMuted, fontSize: 14 },
  time: { color: colors.textMuted, fontSize: 12, marginLeft: 10 },
  replyBtn: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10 },
  replyText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  badge: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, marginRight: 10 },
  badgeText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  learnCard: { width: 120, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: 10 },
  learnTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetLabel: { color: colors.text, fontSize: 16, marginLeft: 12 },
  composeCard: { backgroundColor: colors.surface, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  composeTitle: { color: colors.text, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.text, marginBottom: 12 },
  primaryBtnSmall: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  secondaryBtnSmall: { backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border },

});


