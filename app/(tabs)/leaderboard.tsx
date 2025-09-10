import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { Search, Trophy, Award, TrendingUp, Crown, Medal, Star } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLeaderboard, getProfile } from '@/app/api/auth';

// Define types for our data based on expected API response
interface Student {
  id: number | string;
  name: string;
  username?: string;
  points: number;
  xp?: number;
  rank: number;
  avatar?: string;
  subject?: string;
  grade?: string;
  streak?: number;
  badges?: number;
  trend?: 'up' | 'down' | 'same';
  user_id?: number | string;
}

interface CurrentUser {
  id: number | string;
  name: string;
  username?: string;
  points: number;
  xp?: number;
  rank: number;
  avatar?: string;
  streak?: number;
  badges?: number;
}

export default function LeaderboardScreen() {
  const { theme, t } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tabs = ['All', 'Chemistry', 'Mathematics', 'Grade 12', 'Grade 11'];
  
  // Load leaderboard data
  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leaderboard data
      const leaderboardRes = await getLeaderboard();
      console.log('Leaderboard response:', leaderboardRes);
      
      if (leaderboardRes.ok && leaderboardRes.data) {
        // Handle both array and object responses
        let leaderboardData: any[] = [];
        if (Array.isArray(leaderboardRes.data)) {
          leaderboardData = leaderboardRes.data;
        } else if (leaderboardRes.data.leaderboard) {
          leaderboardData = leaderboardRes.data.leaderboard;
        } else if (leaderboardRes.data.users) {
          leaderboardData = leaderboardRes.data.users;
        }
        
        // Format students with proper data mapping
        const formattedStudents: Student[] = leaderboardData.map((student: any, index: number) => ({
          id: student.id || student.user_id || index + 1,
          name: student.name || student.username || `User ${index + 1}`,
          username: student.username || student.name,
          points: student.points || student.xp || 0,
          xp: student.xp || student.points,
          rank: student.rank || index + 1,
          avatar: student.avatar || `https://ui-avatars.com/api/?name=${student.name || student.username || 'U'}&background=random`,
          subject: student.subject || 'General',
          grade: student.grade || '12',
          streak: student.streak || 0,
          badges: student.badges || 0,
          trend: student.trend || 'same',
          user_id: student.user_id || student.id
        }));
        setStudents(formattedStudents);
      } else {
        setError('Failed to load leaderboard data');
        console.error('Leaderboard API error:', leaderboardRes);
      }
      
      // Fetch current user profile
      const profileRes = await getProfile();
      console.log('Profile response:', profileRes);
      
      if (profileRes.ok && profileRes.data) {
        const profile = profileRes.data;
        setCurrentUser({
          id: profile.id || profile.user_id || 0,
          name: profile.name || profile.username || 'You',
          username: profile.username || profile.name,
          points: profile.points || profile.xp || 0,
          xp: profile.xp || profile.points,
          rank: profile.rank || 0,
          avatar: profile.avatar || `https://ui-avatars.com/api/?name=${profile.name || profile.username || 'Y'}&background=random`,
          streak: profile.streak || 0,
          badges: profile.badges || 0
        });
      }
    } catch (err) {
      console.error('Error loading leaderboard data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadLeaderboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (student.username && student.username.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Chemistry' || activeTab === 'Mathematics') return matchesSearch && student.subject === activeTab;
    if (activeTab.startsWith('Grade')) return matchesSearch && student.grade === activeTab.split(' ')[1];
    return matchesSearch;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Award size={24} color="#CD7F32" />;
    return <Text style={[styles.rankNumber, { color: theme.text }]}>{`#${rank}`}</Text>;
  };

  const getTrendIcon = (trend: string | undefined) => {
    if (trend === 'up') return <TrendingUp size={16} color="#10B981" />;
    if (trend === 'down') return <TrendingUp size={16} color="#EF4444" style={{ transform: [{ rotate: '180deg' }] }} />;
    return <View style={styles.trendSame} />;
  };

  // Show loading state
  if (loading && students.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>{t('loading') || 'Loading leaderboard...'}</Text>
      </View>
    );
  }

  // Show error state
  if (error && students.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>{`${t('error') || 'Error'}: ${error}`}</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10, backgroundColor: theme.primary, borderRadius: 8 }}
          onPress={loadLeaderboardData}
        >
          <Text style={{ color: 'white' }}>{t('retry') || 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#10B981']}
          tintColor="#10B981"
        />
      }
    >
      {/* Header with Stats */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>{t('leaderboard') || 'Leaderboard'}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('xpLeaderboard') || 'Track your progress & compete with peers'}</Text>
        </View>
        {currentUser && (
          <View style={styles.headerStats}>
            <View style={[styles.statCard, { backgroundColor: '#10B98120' }]}>
              <Trophy size={20} color="#10B981" />
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{`#${currentUser.rank}`}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('youRank', { rank: currentUser.rank }) || 'Your Rank'}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#3B82F620' }]}>
              <Star size={20} color="#3B82F6" />
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{currentUser.points}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('points') || 'Points'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput 
            placeholder={t('searchStudent') || "Search for a student"}
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.tab, 
              { backgroundColor: activeTab === tab ? '#10B981' : theme.border }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === tab ? '#FFFFFF' : theme.textSecondary }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Top 3 Podium */}
      <View style={styles.podiumContainer}>
        <Text style={[styles.podiumTitle, { color: theme.text }]}>🏆 {t('topPerformers') || 'Top Performers'}</Text>
        <View style={styles.podium}>
          {filteredStudents.slice(0, 3).map((student, index) => (
            <TouchableOpacity key={student.id} style={[styles.podiumItem, { backgroundColor: theme.surface }]}>
              <View style={[styles.podiumRank, {
                backgroundColor: index === 0 ? '#FFD70020' : index === 1 ? '#C0C0C020' : '#CD7F3220'
              }]}>
                {getRankIcon(student.rank)}
              </View>
              <Image source={{ uri: student.avatar }} style={styles.podiumAvatar} />
              <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>{student.name.split(' ')[0]}</Text>
              <Text style={[styles.podiumPoints, { color: theme.primary }]}>{student.points}</Text>
              <View style={styles.podiumBadges}>
                <Award size={12} color="#10B981" />
                <Text style={[styles.badgeCount, { color: theme.textSecondary }]}>{student.badges}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Leaderboard List */}
      <View style={styles.leaderboardContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('allRankings') || 'All Rankings'}</Text>
        {filteredStudents.map((student, index) => (
          <TouchableOpacity key={student.id} style={[styles.studentCard, { backgroundColor: theme.surface }]}>
            <View style={styles.studentLeft}>
              <View style={styles.rankContainer}>
                {getRankIcon(student.rank)}
                {getTrendIcon(student.trend)}
              </View>
              <Image source={{ uri: student.avatar }} style={styles.avatar} />
              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: theme.text }]}>{student.name}</Text>
                <View style={styles.studentMeta}>
                  <Text style={[styles.studentSubject, { color: theme.textSecondary }]}>{student.subject}</Text>
                  <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
                  <Text style={[styles.studentGrade, { color: theme.textSecondary }]}>{`${t('grade') || 'Grade'} ${student.grade}`}</Text>
                </View>
              </View>
            </View>
            <View style={styles.studentRight}>
              <Text style={[styles.studentPoints, { color: theme.primary }]}>{student.points}</Text>
              <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>{t('points')?.toLowerCase() || 'points'}</Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: '#F59E0B' }]}>{`${student.streak}d`}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current User Card */}
      {currentUser && (
        <View style={[styles.currentUserCard, { backgroundColor: '#10B98120' }]}>
          <View style={styles.currentUserContent}>
            <Image source={{ uri: currentUser.avatar }} style={styles.currentUserAvatar} />
            <View style={styles.currentUserInfo}>
              <Text style={[styles.currentUserName, { color: '#10B981' }]}>{currentUser.name}</Text>
              <Text style={[styles.currentUserRank, { color: '#059669' }]}>{`${t('rank') || 'Rank'} #${currentUser.rank}`}</Text>
            </View>
          </View>
          <View style={styles.currentUserStats}>
            <Text style={[styles.currentUserPoints, { color: '#10B981' }]}>{currentUser.points}</Text>
            <Text style={[styles.currentUserLabel, { color: '#059669' }]}>{t('points')?.toLowerCase() || 'points'}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  podiumContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  podiumItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  podiumRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  podiumPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  podiumBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendSame: {
    width: 16,
    height: 2,
    backgroundColor: '#9CA3AF',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentSubject: {
    fontSize: 13,
  },
  dot: {
    fontSize: 12,
  },
  studentGrade: {
    fontSize: 13,
  },
  studentRight: {
    alignItems: 'flex-end',
  },
  studentPoints: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentUserCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  currentUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  currentUserInfo: {
    alignItems: 'flex-start',
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currentUserRank: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentUserStats: {
    alignItems: 'flex-end',
  },
  currentUserPoints: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentUserLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});