import { View, Text, StyleSheet, Image, ScrollView, FlatList, Pressable, Animated, Easing, Modal, TextInput, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { createContext } from 'react';

// Define types for student and class data
type StudentType = {
  id: string;
  name: string;
  rollNo: string;
  badges?: string[];
};

type ClassDataType = {
  id: string;
  title: string;
  students: number;
  studentsList: StudentType[];
  image: string;
};

// Create context for sharing class data between components
type ClassDataContextType = {
  classData: ClassDataType[];
  setClassData: React.Dispatch<React.SetStateAction<ClassDataType[]>>;
  saveClassData: (data: ClassDataType[]) => Promise<void>;
};

const ClassDataContext = createContext<ClassDataContextType>({} as ClassDataContextType);
import { typography } from '@/styles/typography';
import { UserCircle2, Home, Users, BarChart2, BookOpen, Settings } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Define the type for the WeeklySchedule component ref
type WeeklyScheduleRefType = {
  addScheduleItem: (day: string, item: {time: string, title: string, type: string}) => void;
};

export default function TeacherSpaceScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome,');
  const [dateText, setDateText] = useState('');
  const [syncStatus, setSyncStatus] = useState('offline');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const [messages, setMessages] = useState<Array<{id:string; sender:string; preview:string; time:string}>>([]);
  const [composeVisible, setComposeVisible] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Monday');
  const [scheduleType, setScheduleType] = useState('class');
  
  // Reference to the WeeklySchedule component
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

  const [classData, setClassData] = useState<ClassDataType[]>([
    { 
      id: '10', 
      title: 'Standard 10', 
      students: 25, 
      studentsList: [
        { id: '1001', name: 'Aditya Sharma', rollNo: '01' },
        { id: '1002', name: 'Priya Patel', rollNo: '02' },
        { id: '1003', name: 'Rahul Singh', rollNo: '03' },
      ],
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800' 
    },
    { 
      id: '11', 
      title: 'Standard 11', 
      students: 30, 
      studentsList: [
        { id: '1101', name: 'Neha Gupta', rollNo: '01' },
        { id: '1102', name: 'Vikram Mehta', rollNo: '02' },
      ],
      image: 'https://images.unsplash.com/photo-1559223607-b32ab8dbfd54?w=800' 
    },
    { 
      id: '9', 
      title: 'Standard 9', 
      students: 28, 
      studentsList: [
        { id: '901', name: 'Ananya Desai', rollNo: '01' },
        { id: '902', name: 'Rohan Kumar', rollNo: '02' },
        { id: '903', name: 'Meera Joshi', rollNo: '03' },
      ],
      image: 'https://images.unsplash.com/photo-1577896849786-alsf?ixlib=rb-4.0.3' 
    },
  ]);
  
  // Notification state
  const [notifications, setNotifications] = useState(3); // Number of unread notifications

  const CARD_WIDTH = 260;
  const ITEM_SPACING = 12;
  
  // Function to save class data to AsyncStorage
  const saveClassData = async (data: ClassDataType[]) => {
    try {
      await AsyncStorage.setItem('teacherClassData', JSON.stringify(data));
      // Increment notifications when class data changes
      setNotifications(prev => prev + 1);
      console.log('Class data saved successfully');
    } catch (error) {
      console.error('Failed to save class data:', error);
    }
  };
  
  // Function to add a student to a class
  const addStudentToClass = (classId: string, studentName: string, rollNo: string) => {
    const updatedClasses = classData.map(c => {
      if (c.id === classId) {
        const newStudent: StudentType = {
          id: Date.now().toString(),
          name: studentName,
          rollNo: rollNo
        };
        const updatedStudentsList = [...(c.studentsList || []), newStudent];
        return {
          ...c,
          studentsList: updatedStudentsList,
          students: updatedStudentsList.length // Update the count
        };
      }
      return c;
    });
    
    setClassData(updatedClasses);
    saveClassData(updatedClasses);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    const loadName = async () => {
      const storedName = (await AsyncStorage.getItem('displayName')) || 'Mr. Sharma';
      const hour = new Date().getHours();
      const salutation = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
      setGreeting(`${salutation}, ${storedName}`);
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
    // Removed online/offline status check
    return () => {};
  }, []);

  // Toggle profile menu with animation
  const toggleProfileMenu = () => {
    if (showProfileMenu) {
      // Animate out
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowProfileMenu(false);
      });
    } else {
      setShowProfileMenu(true);
      // Animate in
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Add a background press handler to the ScrollView content
  const handleContentPress = () => {
    if (showProfileMenu) {
      toggleProfileMenu();
    }
  };
  
  // Get current route to highlight active menu item
  const pathname = usePathname();
  const currentRoute = pathname.split('/').pop() || 'index';

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={{ padding: 20, paddingTop: 28 }} 
      showsVerticalScrollIndicator={false}
      onStartShouldSetResponder={() => true}
      onResponderRelease={handleContentPress}
      removeClippedSubviews={true}>
      <View style={[styles.topBar, { marginTop: 40, marginBottom: 20 }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.pageTitle}>Teacher Space</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Pressable 
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setNotifications(0);
                }}
              >
                <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
                {notifications > 0 && (
                  <View style={styles.profileNotificationBadge}>
<Text style={styles.profileNotificationText}>{notifications}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable 
                accessibilityRole="button" 
                accessibilityLabel="Profile" 
                onPress={toggleProfileMenu}
              >
                <UserCircle2 color={colors.text} size={22} />
              </Pressable>
            </View>
          </View>
          <Animated.Text style={[styles.greeting, { opacity: greetingOpacity, marginTop: 8 }]} accessibilityRole="header" accessibilityLabel={greeting}>
            {greeting}
          </Animated.Text>
          <Text style={styles.dateText}>{dateText}</Text>

        </View>
        {/* End of header section */}
          
          {/* Profile dropdown menu */}
          {showProfileMenu && (
            <Animated.View 
              style={[styles.profileDropdown, {
                opacity: menuAnimation,
                transform: [{ translateY: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0]
                })}]
              }]} 
              onStartShouldSetResponder={() => true}>
              <Pressable 
                style={[styles.menuItem, currentRoute === 'index' && styles.menuItemActive]} 
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/(teacher)');
                }}
              >
                <Home size={20} color={currentRoute === 'index' ? colors.primary : colors.text} />
                <Text style={[styles.menuItemText, currentRoute === 'index' && {color: colors.primary}]}>Teacher Space</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.menuItem, currentRoute === 'classes' && styles.menuItemActive]} 
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/(teacher)/classes');
                }}
              >
                <Users size={20} color={currentRoute === 'classes' ? colors.primary : colors.text} />
                <Text style={[styles.menuItemText, currentRoute === 'classes' && {color: colors.primary}]}>Classes</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.menuItem, currentRoute === 'analytics' && styles.menuItemActive]} 
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/(teacher)/analytics');
                }}
              >
                <BarChart2 size={20} color={currentRoute === 'analytics' ? colors.primary : colors.text} />
                <Text style={[styles.menuItemText, currentRoute === 'analytics' && {color: colors.primary}]}>Analytics</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.menuItem, currentRoute === 'content' && styles.menuItemActive]} 
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/(teacher)/content');
                }}
              >
                <BookOpen size={20} color={currentRoute === 'content' ? colors.primary : colors.text} />
                <Text style={[styles.menuItemText, currentRoute === 'content' && {color: colors.primary}]}>Content</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.menuItem, currentRoute === 'settings' && styles.menuItemActive]} 
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/(teacher)/settings');
                }}
              >
                <Settings size={20} color={currentRoute === 'settings' ? colors.primary : colors.text} />
                <Text style={[styles.menuItemText, currentRoute === 'settings' && {color: colors.primary}]}>Settings</Text>
              </Pressable>
            </Animated.View>
            )}
        </View>
      {/* </View>
    </ScrollView>

    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      {/* Quick Actions section removed as requested */}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable 
            style={styles.addClassButton}
            onPress={() => {
              Alert.prompt(
                'Add New Standard',
                'Enter the standard number',
                [{ text: 'Cancel', style: 'cancel' },
                 { text: 'Add', onPress: (standardNumber) => {
                    if (!standardNumber) return;
                    const newClass = {
                      id: standardNumber,
                      title: `Standard ${standardNumber}`,
                      students: 0,
                      studentsList: [], // Add empty studentsList array
                      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
                    };
                    const updatedClasses = [...classData, newClass];
                    setClassData(updatedClasses);
                    saveClassData(updatedClasses);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                 }}
                ]
              );
            }}
          >
            <Text style={styles.addClassButtonText}>Add Class</Text>
          </Pressable>
          <Pressable 
            style={styles.manageButton}
            onPress={() => {
              Alert.alert(
                'Manage Classes',
                'What would you like to do?',
                [
                  { 
                    text: 'Add Standard', 
                    onPress: () => {
                      Alert.prompt(
                        'Add New Standard',
                        'Enter the standard number',
                        [{ text: 'Cancel', style: 'cancel' },
                         { text: 'Add', onPress: (standardNumber) => {
                            if (!standardNumber) return;
                            const newClass = {
                              id: standardNumber,
                              title: `Standard ${standardNumber}`,
                              students: 0,
                              studentsList: [], // Add empty studentsList array
                              image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
                            };
                            const updatedClasses = [...classData, newClass];
                            setClassData(updatedClasses);
                            saveClassData(updatedClasses);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                         }}
                        ]
                      );
                    } 
                  },
                  { 
                    text: 'Reorder Classes', 
                    onPress: () => {
                      // Future implementation for reordering
                      Alert.alert('Coming Soon', 'This feature will be available in the next update.');
                    } 
                  },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </Pressable>
        </View>
      </View>
      {classData.map((c) => (
        <Pressable
          key={c.id}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
              `Manage ${c.title}`,
              'What would you like to do?',
              [
                { 
                  text: 'Delete Standard', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Confirm Delete',
                      `Are you sure you want to delete ${c.title}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => {
                            const updatedClasses = classData.filter(cls => cls.id !== c.id);
                            setClassData(updatedClasses);
                            saveClassData(updatedClasses);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
                        }
                      ]
                    );
                  } 
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <ClassListCard 
            title={c.title} 
            students={c.studentsList ? c.studentsList.length : c.students} 
            onPress={() => router.push(`/(teacher)/class/${c.id}?title=${encodeURIComponent(c.title)}&students=${c.students}`)} 
            classData={classData}
            setClassData={setClassData}
            saveClassData={saveClassData}
          />
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Class Overview</Text>

      {/* Simplified Class Overview */}
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

      {/* My Uploads section removed as requested */}

      {/* Discover Content section removed as requested */}
      {/* Analytics Snapshot */}
      <Text style={styles.sectionTitle}>Analytics Snapshot</Text>
      <View>
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingRight: 8 }}>
          <Pressable onPress={() => Alert.alert('Literacy Analytics', 'View detailed literacy performance across all classes.')}>
            <MetricCard icon="book-open-page-variant" label="Literacy" value={72} color={colors.chipSuccess} />
          </Pressable>
          <Pressable onPress={() => Alert.alert('Numeracy Analytics', 'Track numeracy skills and identify areas for improvement.')}>
            <MetricCard icon="abacus" label="Numeracy" value={64} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => Alert.alert('Participation Analytics', 'Monitor student engagement and participation metrics.')}>
            <MetricCard icon="drama-masks" label="Participation" value={81} color={colors.chipInfo} />
          </Pressable>
        </View>
      </View>

      {/* Weekly Schedule - Vertical Scroll */}
      <View style={{marginBottom: 16}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <Pressable onPress={() => setComposeVisible(true)} accessibilityRole="button" accessibilityLabel="Add schedule item">
            <Text style={{color: colors.primary, fontWeight: '600'}}>Add Item</Text>
          </Pressable>
        </View>
        <View style={styles.scheduleContainer}>
          <WeeklySchedule ref={weeklyScheduleRef} />
        </View>
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

      {/* Achievements and Learning sections removed as requested */}

      {/* FAB */}
      <View style={{ height: 80 }} />

      <View>
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
      </View>
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

function ClassListCard({ title, students, onPress, classData, setClassData, saveClassData }: { 
  title: string; 
  students: number; 
  onPress: () => void;
  classData: ClassDataType[];
  setClassData: React.Dispatch<React.SetStateAction<ClassDataType[]>>;
  saveClassData: (data: ClassDataType[]) => Promise<void>;
}) {
  return (
    <Pressable onPress={onPress} style={styles.classListCard} accessibilityRole="button" accessibilityLabel={`Open ${title}`}>
      <View style={[styles.avatar, { backgroundColor: colors.funPalette[0] }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.className}>{title}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.subtle}>{`${students} students`}</Text>
          <Pressable 
          style={styles.addStudentButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.prompt(
              `Add Student to ${title}`,
              'Enter student name',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add', onPress: (name) => {
                  if (!name) return;
                  Alert.prompt(
                    'Student Roll Number',
                    'Enter roll number',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Add', onPress: (rollNo) => {
                        if (!rollNo) return;
                        // Extract class ID from the title (Standard X)
                        const classId = title.split(' ')[1];
                        // Find the class and update it directly since addStudentToClass isn't accessible here
                        const updatedClasses = classData.map(c => {
                          if (c.id === classId) {
                            const newStudent: StudentType = {
                              id: Date.now().toString(),
                              name: name,
                              rollNo: rollNo || '',
                              badges: []
                            };
                            const updatedStudentsList = [...(c.studentsList || []), newStudent];
                            return {
                              ...c,
                              studentsList: updatedStudentsList,
                              students: updatedStudentsList.length // Update the count
                            };
                          }
                          return c;
                        });
                        
                        setClassData(updatedClasses);
                        saveClassData(updatedClasses);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }}
                    ]
                  );
                }}
              ]
            );
          }}
        >
            <Text style={styles.addStudentText}>+ Add Student</Text>
          </Pressable>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
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
      { id: '1', time: '9:00 AM', title: 'Standard 10 - Math', type: 'class' },
      { id: '2', time: '11:30 AM', title: 'Staff Meeting', type: 'meeting' },
      { id: '3', time: '2:00 PM', title: 'Standard 11 - Physics', type: 'class' },
    ]},
    { day: 'Tuesday', items: [
      { id: '4', time: '10:00 AM', title: 'Standard 9 - Chemistry', type: 'class' },
      { id: '5', time: '1:00 PM', title: 'Parent-Teacher Meeting', type: 'meeting' },
    ]},
    { day: 'Wednesday', items: [
      { id: '6', time: '9:00 AM', title: 'Standard 10 - Math', type: 'class' },
      { id: '7', time: '12:00 PM', title: 'Department Lunch', type: 'event' },
      { id: '8', time: '2:00 PM', title: 'Standard 11 - Physics', type: 'class' },
    ]},
    { day: 'Thursday', items: [
      { id: '9', time: '10:00 AM', title: 'Standard 9 - Chemistry', type: 'class' },
      { id: '10', time: '3:00 PM', title: 'Professional Development', type: 'training' },
    ]},
    { day: 'Friday', items: [
      { id: '11', time: '9:00 AM', title: 'Standard 10 - Math', type: 'class' },
      { id: '12', time: '11:00 AM', title: 'School Assembly', type: 'event' },
      { id: '13', time: '2:00 PM', title: 'Standard 11 - Physics', type: 'class' },
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
          <View key={day} style={[styles.dayHeader, { flex: 1, marginHorizontal: 2, alignItems: 'center' }, new Date().getDay() - 1 === idx ? styles.currentDayHeader : null]}>
            <Text style={[styles.dayName, { fontSize: 14 }]}>{day}</Text>
            <Text style={[styles.dayDate, { fontSize: 12 }]}>{formatDate(weekDates[idx])}</Text>
          </View>
        ))}
      </View>
      
      <View style={{ flexDirection: 'row' }}>
        {scheduleData.map((daySchedule, index) => (
          <View key={daySchedule.day} style={[styles.dayRow, { flex: 1, marginHorizontal: 2 }]}>
            <View style={styles.scheduleItems}>
              {daySchedule.items.length > 0 ? (
                daySchedule.items.map((item) => (
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
                      <Text style={styles.scheduleTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                      <Text style={styles.scheduleType}>{item.type}</Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View style={[styles.scheduleItem, {justifyContent: 'center', paddingVertical: 10}]}>
                  <Text style={{color: colors.textMuted, textAlign: 'center', fontStyle: 'italic', fontSize: 12}}>No events</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    manageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  addClassButton: {
    backgroundColor: colors.chipSuccess,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addClassButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
    addStudentButton: {
      marginLeft: 12,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    addStudentText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '500',
    },
    profileDropdown: {
      position: 'absolute',
      top: 50,
      right: 0,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 1000,
      width: 180,
    },
    menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: colors.surface,
  },
    menuItemText: {
      marginLeft: 12,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    profileNotificationBadge: {
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
    profileNotificationText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
  scheduleContainer: {
    marginBottom: 20,
  },
  weeklySchedule: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  dayRow: {
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  currentDayHeader: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.primary,
  },
  dayName: {
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
    fontSize: 16,
  },
  dayDate: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleItems: {
    gap: 10,
  },
  scheduleItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    width: 60,
  },
  scheduleItemContent: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    flex: 1,
  },
  scheduleTitle: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  scheduleType: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  content: {
    padding: 20,
    paddingTop: 28,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 0,
  },
  greeting: {
    ...typography.headline,
    fontSize: 18,
    marginBottom: 0,
  },
  dateText: { ...typography.subtle, marginTop: 2 },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
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


