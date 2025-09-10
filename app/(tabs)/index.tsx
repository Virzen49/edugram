import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Animated } from 'react-native';
import { Bell, Settings, User, LogOut, Trophy, Star, TrendingUp, Type, Grid3X3, Calculator, Beaker, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { getProfile, updateProfileStats } from '../api/auth';



export default function HomeScreen() {
  const [profile, setProfile] = useState<any>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showSubjectSelection, setShowSubjectSelection] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({ xp: 0, rank: 0, level: 1 });
  const router = useRouter();
  const { theme, t } = useApp();

  // Animation values for hamburger menu
  const animatedValue = useState(new Animated.Value(0))[0];
  const topLineRotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  const middleLineOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });
  const bottomLineRotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg']
  });
  const topLineTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8]
  });
  const bottomLineTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });

  // Motivational quotes array
  const motivationalQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Education is the most powerful weapon which you can use to change the world.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The expert in anything was once a beginner."
  ];

  // Get random quote
  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const [currentQuote, setCurrentQuote] = useState(getRandomQuote());

  const getProfileData = async () => {
    try {
        const res = await getProfile()
        console.log('Profile data:', res);
        setProfile(res.data);
        
        // Update leaderboard data
        if (res.data) {
          setLeaderboardData({
            xp: res.data.points || 0,
            rank: res.data.rank || 0,
            level: res.data.level || 1
          });
        }
      }catch (error) {
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

  const handleMenuToggle = () => {
    const toValue = showProfileMenu ? 0 : 1;
    
    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowProfileMenu(!showProfileMenu);
  };

  const handleCloseMenu = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowProfileMenu(false);
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  const handleGameSelection = (gameType: string) => {
    setSelectedGame(gameType);
    setShowSubjectSelection(true);
  };

  const handleSubjectSelection = (subject: string) => {
    if (selectedGame === 'hangman') {
      router.push(`/game?type=hangman&subject=${subject}`);
    } else if (selectedGame === 'puzzle') {
      router.push(`/puzzle?subject=${subject}`);
    } else if (selectedGame === 'sudoku') {
      router.push(`/sudoku?subject=${subject}`);
    } else if (selectedGame === 'riddle') {
      router.push(`/riddle?subject=${subject}`);
    }
    setShowSubjectSelection(false);
  };

  const handleCloseSubjectSelection = () => {
    setShowSubjectSelection(false);
    setSelectedGame(null);
  };

  useEffect(() => {
    getProfileData();
  }, []);

  // Add effect to update profile when games are completed
  useEffect(() => {
    const updateProfileListener = () => {
      getProfileData();
    };
    
    // Add event listener for profile updates (this would be triggered from games)
    // In a real app, you might use a global state management solution or WebSocket
    // For now, we'll just refresh the profile data periodically
    const interval = setInterval(() => {
      getProfileData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>{t('welcomeBack')} {profile?.email || profile?.user?.name || 'User'}!</Text>
          <Text style={[styles.gradeText, { color: theme.textSecondary }]}>Grade {profile?.student[0]?.grade || '12'} • {profile?.student[0]?.school_name || 'Delhi Public School'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={handleMenuToggle}
        >
          <View style={styles.hamburgerContainer}>
            <Animated.View 
              style={[
                styles.hamburgerLine,
                { backgroundColor: theme.text },
                {
                  transform: [
                    { translateY: topLineTranslateY },
                    { rotate: topLineRotation }
                  ]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.hamburgerLine,
                { backgroundColor: theme.text },
                { opacity: middleLineOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.hamburgerLine,
                { backgroundColor: theme.text },
                {
                  transform: [
                    { translateY: bottomLineTranslateY },
                    { rotate: bottomLineRotation }
                  ]
                }
              ]} 
            />
          </View>
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
          onPress={handleCloseMenu}
        >
          <View style={[styles.profileMenu, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { handleCloseMenu(); handleProfilePress(); }}>
              <User size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { handleCloseMenu(); handleNotificationsPress(); }}>
              <Bell size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('notifications')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { handleCloseMenu(); handleSettingsPress(); }}>
              <Settings size={20} color={theme.text} />
              <Text style={[styles.menuText, { color: theme.text }]}>{t('settings')}</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={() => { handleCloseMenu(); handleLogout(); }}>
              <LogOut size={20} color="#DC2626" />
              <Text style={[styles.menuText, styles.logoutText]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subject Selection Modal for Games */}
      <Modal
        visible={showSubjectSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseSubjectSelection}
      >
        <View style={styles.gameModalOverlay}>
          <View style={[styles.subjectSelectionModal, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Choose Subject for {selectedGame === 'hangman' ? 'Hangman' : selectedGame === 'puzzle' ? 'Puzzle' : selectedGame === 'riddle' ? 'Riddle' : 'Sudoku'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseSubjectSelection}
              >
                <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Select a subject to play {selectedGame === 'hangman' ? 'word guessing game' : selectedGame === 'puzzle' ? 'educational puzzle' : selectedGame === 'riddle' ? 'brain teaser' : 'logic puzzle'}
            </Text>
            
            <View style={styles.subjectOptionsGrid}>
              {selectedGame === 'hangman' ? (
                // Only Chemistry for Hangman
                <TouchableOpacity 
                  style={[styles.subjectOption, { backgroundColor: theme.background }]}
                  onPress={() => handleSubjectSelection('chemistry')}
                >
                  <View style={[styles.subjectOptionIcon, { backgroundColor: '#10B98120' }]}>
                    <Text style={styles.subjectOptionEmoji}>⚛️</Text>
                  </View>
                  <Text style={[styles.subjectOptionName, { color: theme.text }]}>Chemistry</Text>
                  <Text style={[styles.subjectOptionDesc, { color: theme.textSecondary }]}>
                    Chemical terms and vocabulary
                  </Text>
                </TouchableOpacity>
              ) : (
                // Both subjects for other games
                <>
                  <TouchableOpacity 
                    style={[styles.subjectOption, { backgroundColor: theme.background }]}
                    onPress={() => handleSubjectSelection('chemistry')}
                  >
                    <View style={[styles.subjectOptionIcon, { backgroundColor: '#10B98120' }]}>
                      <Text style={styles.subjectOptionEmoji}>⚛️</Text>
                    </View>
                    <Text style={[styles.subjectOptionName, { color: theme.text }]}>Chemistry</Text>
                    <Text style={[styles.subjectOptionDesc, { color: theme.textSecondary }]}>
                      {selectedGame === 'riddle' ? 'Chemistry riddles' : selectedGame === 'puzzle' ? 'Chemistry facts' : 'Chemistry puzzles'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.subjectOption, { backgroundColor: theme.background }]}
                    onPress={() => handleSubjectSelection('mathematics')}
                  >
                    <View style={[styles.subjectOptionIcon, { backgroundColor: '#3B82F620' }]}>
                      <Text style={styles.subjectOptionEmoji}>📐</Text>
                    </View>
                    <Text style={[styles.subjectOptionName, { color: theme.text }]}>Mathematics</Text>
                    <Text style={[styles.subjectOptionDesc, { color: theme.textSecondary }]}>
                      {selectedGame === 'riddle' ? 'Math riddles' : selectedGame === 'puzzle' ? 'Number puzzles' : 'Logic puzzles'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('activities')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activitiesScroll}>
          <TouchableOpacity 
            style={[styles.activityCard, { backgroundColor: '#10B981' }]}
            onPress={() => router.push('/quiz?subjectId=1&moduleId=1')}
          >
            <View style={styles.activityImageContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.activityIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Beaker size={24} color="white" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>Quiz</Text>
              </View>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Atoms-Practice Quiz</Text>
              <Text style={styles.activitySubject}>Chemistry</Text>
              <View style={styles.activityProgress}>
                <View style={[styles.activityProgressBar, { width: '70%' }]} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.activityCard, { backgroundColor: '#059669' }]}
            onPress={() => router.push('/quiz?subjectId=2&moduleId=2')}
          >
            <View style={styles.activityImageContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.activityIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Calculator size={24} color="white" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>Quiz</Text>
              </View>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Algebra Practice Quiz</Text>
              <Text style={styles.activitySubject}>Mathematics</Text>
              <View style={styles.activityProgress}>
                <View style={[styles.activityProgressBar, { width: '45%' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('subjects')}</Text>
        <View style={styles.subjectsGrid}>
          <TouchableOpacity 
            style={[styles.subjectCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/(tabs)/courses?subject=chemistry')}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={[styles.subjectIcon, { backgroundColor: theme.border }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Beaker size={24} color="white" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('chemistry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.subjectCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/(tabs)/courses?subject=mathematics')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={[styles.subjectIcon, { backgroundColor: theme.border }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Calculator size={24} color="white" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.subjectName, { color: theme.text }]}>{t('mathematics')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Games Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Games</Text>
        <View style={styles.gamesGrid}>
          <TouchableOpacity 
            style={[styles.gameCard, { backgroundColor: theme.surface }]}
            onPress={() => handleGameSelection('hangman')}
          >
            <View style={[styles.gameIcon, { backgroundColor: '#8B5CF620' }]}>
              <Type size={28} color="#8B5CF6" />
            </View>
            <Text style={[styles.gameName, { color: theme.text }]}>Hangman</Text>
            <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>Guess the word</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gameCard, { backgroundColor: theme.surface }]}
            onPress={() => handleGameSelection('sudoku')}
          >
            <View style={[styles.gameIcon, { backgroundColor: '#3B82F620' }]}>
              <Grid3X3 size={28} color="#3B82F6" />
            </View>
            <Text style={[styles.gameName, { color: theme.text }]}>Sudoku</Text>
            <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>Logic puzzle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gameCard, { backgroundColor: theme.surface }]}
            onPress={() => handleGameSelection('riddle')}
          >
            <View style={[styles.gameIcon, { backgroundColor: '#F59E0B20' }]}>
              <FileText size={28} color="#F59E0B" />
            </View>
            <Text style={[styles.gameName, { color: theme.text }]}>Riddle</Text>
            <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>Solve riddles</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Quote Section */}
      <View style={styles.section}>
        <View style={[styles.quoteCard, { backgroundColor: theme.surface }]}>
          <View style={styles.quoteHeader}>
            <Star size={20} color="#F59E0B" />
            <Text style={[styles.quoteLabel, { color: theme.text }]}>Daily Motivation</Text>
          </View>
          <Text style={[styles.quoteText, { color: theme.textSecondary }]}>
            "{currentQuote}"
          </Text>
          <TouchableOpacity 
            style={styles.refreshQuoteBtn}
            onPress={() => setCurrentQuote(getRandomQuote())}
          >
            <Text style={styles.refreshQuoteText}>Get New Quote</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Progress Section */}
      <View style={styles.progressSection}>
        <View style={[styles.progressCard, { backgroundColor: '#ECFDF5' }]}>
          <View style={styles.progressHeader}>
            <Trophy size={24} color="#10B981" />
            <Text style={[styles.progressTitle, { color: '#064E3B' }]}>XP & Leaderboard</Text>
          </View>
          
          <View style={styles.levelSection}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{leaderboardData.level}</Text>
            </View>
            <Text style={[styles.levelText, { color: '#064E3B' }]}>Level {leaderboardData.level}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={[styles.statValue, { color: '#059669' }]}>{leaderboardData.xp} XP</Text>
              <Text style={[styles.statLabel, { color: '#6B7280' }]}>Experience</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Trophy size={16} color="#10B981" />
              <Text style={[styles.statValue, { color: '#059669' }]}>#{leaderboardData.rank}</Text>
              <Text style={[styles.statLabel, { color: '#6B7280' }]}>Class Rank</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
            <Text style={[styles.progressBarText, { color: '#6B7280' }]}>600 XP to Level {leaderboardData.level + 1}</Text>
          </View>
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
  hamburgerButton: {
    padding: 8,
    marginLeft: 16,
  },
  hamburgerContainer: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
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
    width: 220,
    height: 140,
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  activityImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activityContent: {
    gap: 6,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  activitySubject: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
    fontWeight: '500',
  },
  activityProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  activityProgressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Quote Card Styles
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  quoteLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshQuoteBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
  },
  refreshQuoteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Games Section Styles
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Modal Styles for Game Subject Selection
  gameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subjectSelectionModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  subjectOptionsGrid: {
    gap: 16,
  },
  subjectOption: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectOptionEmoji: {
    fontSize: 24,
  },
  subjectOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  subjectOptionDesc: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});