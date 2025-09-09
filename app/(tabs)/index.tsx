import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Bell, Settings, User, LogOut } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';



export default function HomeScreen() {
  const [profile, setProfile] = useState<any>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const { theme, t } = useApp();

  const getProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`http://10.103.211.237:3000/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Profile data:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove token from storage
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              // Navigate to login page
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    setShowProfileMenu(false);
    router.push('/profile');
  };

  const handleSettingsPress = () => {
    setShowProfileMenu(false);
    router.push('/settings');
  };

  const handleNotificationsPress = () => {
    setShowProfileMenu(false);
    // Navigate to notifications page when implemented
    console.log('Navigate to notifications');
  };

  useEffect(() => {
    getProfileData();
  }, []);
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>{t('welcomeBack')} {profile?.email || profile?.user?.name || 'User'}!</Text>
          <Text style={[styles.gradeText, { color: theme.textSecondary }]}>Grade {profile?.student[0]?.grade || '12'} • {profile?.student[0]?.school_name || 'Delhi Public School'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={[styles.profileMenu, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
              <User size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleNotificationsPress}>
              <Bell size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('notifications')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
              <Settings size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('settings')}</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
              <LogOut size={20} color="#DC2626" />
              <Text style={[styles.menuText, styles.logoutText]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('activities')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activitiesScroll}>
          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#10B981' }]}>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Atoms- Question And Answer</Text>
              <Text style={styles.activitySubject}>Chemistry</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#059669' }]}>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Algebra Quiz</Text>
              <Text style={styles.activitySubject}>Mathematics</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('subjects')}</Text>
        <View style={styles.subjectsGrid}>
          <TouchableOpacity style={[styles.subjectCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.subjectIcon, { backgroundColor: theme.border }]}>
              <Text style={styles.subjectEmoji}>⚛️</Text>
            </View>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('chemistry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subjectCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.subjectIcon, { backgroundColor: theme.border }]}>
              <Text style={styles.subjectEmoji}>📐</Text>
            </View>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('mathematics')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subjectCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.subjectIcon, { backgroundColor: theme.border }]}>
              <Text style={styles.subjectEmoji}>⚗️</Text>
            </View>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('physics')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subjectCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.subjectIcon, { backgroundColor: theme.border }]}>
              <Text style={styles.subjectEmoji}>💻</Text>
            </View>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('computerScience')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressCard, { backgroundColor: theme.warning }]}>
          <Text style={[styles.progressTitle, { color: '#92400E' }]}>{t('xpLeaderboard')}</Text>
          <Text style={[styles.progressSubtitle, { color: '#92400E' }]}>{t('level')} 5</Text>
          <Text style={[styles.progressXP, { color: '#A16207' }]}>1200 XP | {t('rankInClass', { rank: '12' })}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileButton: {
    marginLeft: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  logoutItem: {
    paddingVertical: 12,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  activitiesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  activityCard: {
    width: 200,
    height: 120,
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  activityContent: {
    gap: 4,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activitySubject: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectEmoji: {
    fontSize: 24,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  progressCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  progressSubtitle: {
    fontSize: 16,
    color: '#92400E',
    marginBottom: 4,
  },
  progressXP: {
    fontSize: 14,
    color: '#A16207',
  },
});