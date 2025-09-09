import { View, Text, StyleSheet, FlatList, Pressable, ScrollView, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClassDetailsScreen() {
  const { id, title, students: count } = useLocalSearchParams<{ id: string; title?: string; students?: string }>();
  const router = useRouter();
  const [students, setStudents] = useState<Array<{id: string; name: string; status: string; badges: string[]}>>([]);
  const [tab, setTab] = useState<'Roster'|'Lessons'|'Analytics'|'Messages'>('Roster');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // Load students from storage or initialize if not found
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem(`class_${id}_students`);
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        } else {
          // Initialize with default students
          const defaultStudents = Array.from({ length: Number(count||8) }).map((_, i) => ({
            id: `${i+1}`,
            name: `Student ${i+1}`,
            status: i%3===0 ? 'absent' : 'present',
            badges: i%4===0 ? ['⭐'] : []
          }));
          setStudents(defaultStudents);
          await AsyncStorage.setItem(`class_${id}_students`, JSON.stringify(defaultStudents));
        }
      } catch (error) {
        console.error('Failed to load students:', error);
      }
    };
    
    loadStudents();
  }, [id, count]);
  
  // Save students whenever they change
  useEffect(() => {
    const saveStudents = async () => {
      try {
        await AsyncStorage.setItem(`class_${id}_students`, JSON.stringify(students));
      } catch (error) {
        console.error('Failed to save students:', error);
      }
    };
    
    if (students.length > 0) {
      saveStudents();
    }
  }, [students, id]);
  
  const handleDeleteStudent = (studentId: string) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to remove this student from the class?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedStudents = students.filter(student => student.id !== studentId);
            setStudents(updatedStudents);
            setMenuVisible(false);
            
            try {
              // Save updated students to AsyncStorage
              await AsyncStorage.setItem(`students-${id}`, JSON.stringify(updatedStudents));
              
              // Update class data in AsyncStorage to reflect new student count
              const savedClassData = await AsyncStorage.getItem('teacherClassData');
              if (savedClassData) {
                const classData = JSON.parse(savedClassData);
                const updatedClassData = classData.map((cls: { id: string; students: number }) => {
                  if (cls.id === id) {
                    return { ...cls, students: updatedStudents.length };
                  }
                  return cls;
                });
                
                // Save updated class data
                await AsyncStorage.setItem('teacherClassData', JSON.stringify(updatedClassData));
              }
              
              // Show success message
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to update data:', error);
            }
          }
        },
      ]
    );
  };
  
  const handleEditStudent = (studentId: string) => {
    setMenuVisible(false);
    router.push(`/(teacher)/class/student/${studentId}?classId=${id}`);
  };
  
  const showMenu = (studentId: string, event: any) => {
    // Get the position from the event to show the menu near the pressed element
    setMenuPosition({
      x: event.nativeEvent.pageX - 100, // Offset to position menu properly
      y: event.nativeEvent.pageY - 20
    });
    setSelectedStudent(studentId);
    setMenuVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>{title || `Class ${id}`}</Text>
          <Text style={styles.subtleHeader}>{`${students.length} Students`}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={styles.syncPill}><MaterialCommunityIcons name="cloud-check" size={16} color={colors.text} /><Text style={styles.syncText}>online</Text></View>
          <Pressable style={styles.startBtn} accessibilityRole="button" accessibilityLabel="Start Session" onPress={()=>alert('Starting today\'s session…')}><Text style={styles.startText}>Start Session</Text></Pressable>
        </View>
      </View>

      {/* Quick Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
        {(['Roster','Lessons','Analytics','Messages'] as const).map((t, i)=> (
          <Pressable key={i} onPress={()=>setTab(t)}>
            <View style={[styles.chip, tab===t && { backgroundColor: '#FFF8E1', borderColor: colors.primary }]}>
              <Text style={[styles.chipText, tab===t && { color: colors.text }]}>{t}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Roster */}
      {tab==='Roster' && (
        <>
          <Text style={styles.sectionTitle}>Roster</Text>
          <View style={styles.grid}>
            {students.map((item)=> (
              <View key={item.id} style={styles.cardCell}>
                <Pressable 
                  style={styles.studentCard}
                  onPress={()=>router.push(`/(teacher)/class/student/${item.id}?classId=${id}`)}
                  accessibilityRole="button" 
                  accessibilityLabel={`Open ${item.name} profile`}
                >
                  <View style={[styles.avatarLg, { backgroundColor: colors.funPalette[Number(item.id)%colors.funPalette.length] }]} />
                  <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.subtle}>{item.status==='present'?'🟢 Present':'🔴 Absent'}</Text>
                </Pressable>
                <Pressable 
                  style={styles.optionsButton}
                  onPress={(e) => showMenu(item.id, e)}
                  accessibilityLabel={`Options for ${item.name}`}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.text} />
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
      {tab==='Analytics' && (
        <>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.snapRow}>
            <View style={styles.snapCard}><Text style={styles.snapLabel}>Literacy</Text><Text style={styles.snapValue}>72%</Text></View>
            <View style={styles.snapCard}><Text style={styles.snapLabel}>Numeracy</Text><Text style={styles.snapValue}>64%</Text></View>
            <View style={styles.snapCard}><Text style={styles.snapLabel}>Participation</Text><Text style={styles.snapValue}>81%</Text></View>
          </View>
        </>
      )}

      {/* Analytics Snapshot */}
      <Text style={styles.sectionTitle}>Snapshot</Text>
      <View style={styles.snapRow}>
        <View style={styles.snapCard}><Text style={styles.snapLabel}>Literacy</Text><Text style={styles.snapValue}>72%</Text></View>
        <View style={styles.snapCard}><Text style={styles.snapLabel}>Numeracy</Text><Text style={styles.snapValue}>64%</Text></View>
        <View style={styles.snapCard}><Text style={styles.snapLabel}>Participation</Text><Text style={styles.snapValue}>81%</Text></View>
      </View>
      <Text style={styles.insight}>5 students need help in reading comprehension.</Text>

      {/* FAB placeholder is inherited from parent tabs */}
      
      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x }]}>
            <Pressable 
              style={styles.menuItem} 
              onPress={() => selectedStudent && handleEditStudent(selectedStudent)}
            >
              <MaterialCommunityIcons name="pencil" size={18} color={colors.text} />
              <Text style={styles.menuText}>Edit</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable 
              style={styles.menuItem} 
              onPress={() => selectedStudent && handleDeleteStudent(selectedStudent)}
            >
              <MaterialCommunityIcons name="delete" size={18} color={colors.chipDanger} />
              <Text style={[styles.menuText, { color: colors.chipDanger }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtleHeader: { color: colors.textMuted },
  syncPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: '#E7F6E9' },
  syncText: { color: colors.text, fontWeight: '600' },
  startBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  startText: { color: '#FFFFFF', fontWeight: '700' },
  chip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  chipText: { color: colors.text, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardCell: { width: '31%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, position: 'relative' },
  studentCard: { alignItems: 'center', width: '100%' },
  optionsButton: { position: 'absolute', top: 5, right: 5, padding: 5 },
  avatarLg: { width: 56, height: 56, borderRadius: 28, marginBottom: 6 },
  studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  studentName: { color: colors.text, fontWeight: '700' },
  subtle: { color: colors.textMuted, marginTop: 2 },
  actionBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  actionText: { color: colors.text, fontWeight: '600' },
  snapRow: { flexDirection: 'row', gap: 10 },
  snapCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  snapLabel: { color: colors.textMuted },
  snapValue: { color: colors.text, fontWeight: '700', marginTop: 4 },
  insight: { color: colors.textMuted, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuContainer: { position: 'absolute', width: 150, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  menuText: { color: colors.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: colors.border },
});


