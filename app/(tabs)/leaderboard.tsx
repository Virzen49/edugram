import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { Search, Trophy, Award, TrendingUp, Crown, Medal, Star } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaderboardScreen() {
  const { theme, t } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([
    { id: 1, name: 'Ethan Carter', points: 1300, rank: 1, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Chemistry', grade: '12', streak: 7, badges: 12, trend: 'up' },
    { id: 2, name: 'Sophia Lee', points: 1250, rank: 2, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Mathematics', grade: '12', streak: 5, badges: 10, trend: 'up' },
    { id: 3, name: 'Noah Clark', points: 1150, rank: 3, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Chemistry', grade: '11', streak: 4, badges: 8, trend: 'down' },
    { id: 4, name: 'Olivia Davis', points: 1050, rank: 4, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Mathematics', grade: '12', streak: 6, badges: 9, trend: 'up' },
    { id: 5, name: 'Liam Walker', points: 1000, rank: 5, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Chemistry', grade: '11', streak: 3, badges: 7, trend: 'same' },
    { id: 6, name: 'Ava Hall', points: 950, rank: 6, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Mathematics', grade: '12', streak: 2, badges: 6, trend: 'up' },
    { id: 7, name: 'Lucas Young', points: 900, rank: 7, avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Chemistry', grade: '10', streak: 1, badges: 5, trend: 'down' },
    { id: 8, name: 'Mia King', points: 850, rank: 8, avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Mathematics', grade: '11', streak: 4, badges: 4, trend: 'up' },
    { id: 9, name: 'James Wilson', points: 800, rank: 9, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Chemistry', grade: '10', streak: 2, badges: 3, trend: 'same' },
    { id: 10, name: 'Emma Brown', points: 750, rank: 10, avatar: 'https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=400', subject: 'Mathematics', grade: '11', streak: 5, badges: 5, trend: 'up' },
  ]);
  const [currentUser] = useState({ name: 'You', points: 650, rank: 15, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' });
  
  const tabs = ['All', 'Chemistry', 'Mathematics', 'Grade 12', 'Grade 11'];

  useEffect(() => {
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setStudents(prevStudents => 
        prevStudents.map(student => ({
          ...student,
          points: student.points + Math.floor(Math.random() * 10) - 3, // Random point changes
        })).sort((a, b) => b.points - a.points).map((student, index) => ({
          ...student,
          rank: index + 1
        }))
      );
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Chemistry' || activeTab === 'Mathematics') return matchesSearch && student.subject === activeTab;
    if (activeTab.startsWith('Grade')) return matchesSearch && student.grade === activeTab.split(' ')[1];
    return matchesSearch;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Award size={24} color="#CD7F32" />;
    return <Text style={[styles.rankNumber, { color: theme.text }]}>#{rank}</Text>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} color="#10B981" />;
    if (trend === 'down') return <TrendingUp size={16} color="#EF4444" style={{ transform: [{ rotate: '180deg' }] }} />;
    return <View style={styles.trendSame} />;
  };

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
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Track your progress & compete with peers</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={[styles.statCard, { backgroundColor: '#10B98120' }]}>
            <Trophy size={20} color="#10B981" />
            <Text style={[styles.statNumber, { color: '#10B981' }]}>#{currentUser.rank}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Your Rank</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#3B82F620' }]}>
            <Star size={20} color="#3B82F6" />
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{currentUser.points}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Points</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput 
            placeholder="Search for a student"
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
        <Text style={[styles.podiumTitle, { color: theme.text }]}>🏆 Top Performers</Text>
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
        <Text style={[styles.sectionTitle, { color: theme.text }]}>All Rankings</Text>
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
                  <Text style={[styles.studentGrade, { color: theme.textSecondary }]}>Grade {student.grade}</Text>
                </View>
              </View>
            </View>
            <View style={styles.studentRight}>
              <Text style={[styles.studentPoints, { color: theme.primary }]}>{student.points}</Text>
              <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>points</Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: '#F59E0B' }]}>{student.streak}d</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current User Card */}
      <View style={[styles.currentUserCard, { backgroundColor: '#10B98120' }]}>
        <View style={styles.currentUserContent}>
          <Image source={{ uri: currentUser.avatar }} style={styles.currentUserAvatar} />
          <View style={styles.currentUserInfo}>
            <Text style={[styles.currentUserName, { color: '#10B981' }]}>{currentUser.name}</Text>
            <Text style={[styles.currentUserRank, { color: '#059669' }]}>Rank #{currentUser.rank}</Text>
          </View>
        </View>
        <View style={styles.currentUserStats}>
          <Text style={[styles.currentUserPoints, { color: '#10B981' }]}>{currentUser.points}</Text>
          <Text style={[styles.currentUserLabel, { color: '#059669' }]}>points</Text>
        </View>
      </View>
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
    alignItems: 'end',
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