import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ArrowLeft, Share, Trophy, Award, Target, Calendar, TrendingUp, Star, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/contexts/AppContext';
import { getProfile } from '../api/auth';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    badges: 0,
    points: 0,
    completed: 0,
    rank: 0,
    level: 1,
    weeklyProgress: 0,
    streak: 0
  });
  const { theme, t } = useApp();

  // Calculate user level based on points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 200) + 1;
  };

  // Calculate progress to next level
  const calculateLevelProgress = (points: number) => {
    const currentLevelPoints = (calculateLevel(points) - 1) * 200;
    const nextLevelPoints = calculateLevel(points) * 200;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  // Get profile data from backend
  const getProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Fetch user profile
        const res = await getProfile()
        setProfile(res.data);
        
        // Fetch user stats/progress from backend if available
        try {
          const statsResponse = await fetch(`http://10.103.211.237:3000/api/user/stats`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('User stats:', statsData);
            setUserStats({
              badges: statsData.badges || 0,
              points: statsData.points || 0,
              completed: statsData.completed || 0,
              rank: statsData.rank || 99,
              level: calculateLevel(statsData.points || 0),
              weeklyProgress: statsData.weeklyProgress || 0,
              streak: statsData.streak || 0
            });
          } else {
            // If stats API doesn't exist, initialize with zeros
            console.log('Stats API not available, using default values');
            setUserStats({
              badges: 0,
              points: 0,
              completed: 0,
              rank: 99,
              level: 1,
              weeklyProgress: 0,
              streak: 0
            });
          }
        } catch (statsError) {
          console.log('Stats API error, using default values:', statsError);
          // Use default values if stats API is not available
          setUserStats({
            badges: 0,
            points: 0,
            completed: 0,
            rank: 99,
            level: 1,
            weeklyProgress: 0,
            streak: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default values on error
      setUserStats({
        badges: 0,
        points: 0,
        completed: 0,
        rank: 99,
        level: 1,
        weeklyProgress: 0,
        streak: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  // Dynamic achievements based on user progress
  const getAchievements = () => {
    const achievements = [];
    
    // Only show achievements if user has actually earned them
    if (userStats.completed >= 10) {
      achievements.push({
        name: 'Study Champion',
        description: 'Completed 10+ lessons',
        icon: '📚',
        color: '#10B981',
        earned: true
      });
    }
    
    if (userStats.completed >= 5) {
      achievements.push({
        name: 'Quick Learner',
        description: 'Completed 5+ lessons',
        icon: '⚡',
        color: '#3B82F6',
        earned: true
      });
    }
    
    if (userStats.streak >= 7) {
      achievements.push({
        name: 'Week Warrior',
        description: 'Maintained 7-day learning streak',
        icon: '🔥',
        color: '#F59E0B',
        earned: true
      });
    }
    
    if (userStats.points >= 1000) {
      achievements.push({
        name: 'Point Master',
        description: 'Earned 1000+ points',
        icon: '💎',
        color: '#8B5CF6',
        earned: true
      });
    }
    
    // Show locked achievements only if user hasn't earned them yet
    if (userStats.completed < 10) {
      achievements.push({
        name: 'Study Champion',
        description: `Complete ${10 - userStats.completed} more lessons to unlock`,
        icon: '📚',
        color: '#6B7280',
        earned: false
      });
    }
    
    if (userStats.streak < 7) {
      achievements.push({
        name: 'Week Warrior',
        description: `Maintain ${7 - userStats.streak} more days to unlock`,
        icon: '🔥',
        color: '#6B7280',
        earned: false
      });
    }
    
    return achievements;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile')}</Text>
        <View style={styles.rankContainer}>
          <Trophy size={16} color="#F59E0B" />
          <Text style={[styles.rank, { color: '#F59E0B' }]}>Rank #{userStats.rank}</Text>
        </View>
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: profile?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.avatar}
          />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userStats.level}</Text>
          </View>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile?.user?.name || profile?.name || profile?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={[styles.school, { color: theme.textSecondary }]}>
          {profile?.student?.[0]?.school_name || 'School'} • Grade {profile?.student?.[0]?.grade || 'N/A'}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {profile?.email || profile?.user?.email || 'Loading email...'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Award size={20} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.badges}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('badges')}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Star size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.points.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('points')}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
              <BookOpen size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.completed}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('completed')}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelProgressContainer}>
          <Text style={[styles.levelProgressTitle, { color: theme.text }]}>Level {userStats.level} Progress</Text>
          <View style={[styles.levelProgressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[styles.levelProgressFill, { width: `${calculateLevelProgress(userStats.points)}%` }]} 
            />
          </View>
          <Text style={[styles.levelProgressText, { color: theme.textSecondary }]}>
            {userStats.points > 0 ? `${200 - (userStats.points % 200)} XP to Level ${userStats.level + 1}` : 'Start learning to gain XP!'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Stats</Text>
        <View style={styles.quickStatsContainer}>
          <View style={[styles.quickStatCard, { backgroundColor: theme.surface }]}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={[styles.quickStatNumber, { color: theme.text }]}>{userStats.streak}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: theme.surface }]}>
            <Target size={24} color="#3B82F6" />
            <Text style={[styles.quickStatNumber, { color: theme.text }]}>{userStats.weeklyProgress}%</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Weekly Goal</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('achievements')}</Text>
        <View style={styles.achievementsContainer}>
          {getAchievements().map((achievement, index) => (
            <View key={index} style={[styles.achievementCard, { backgroundColor: theme.surface, opacity: achievement.earned ? 1 : 0.6 }]}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, { color: theme.text }]}>{achievement.name}</Text>
                <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>{achievement.description}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: achievement.earned ? achievement.color : '#6B7280' }]}>
                {achievement.earned ? (
                  <Text style={styles.badgeText}>✓</Text>
                ) : (
                  <Text style={styles.badgeText}>🔒</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('weeklyProgress')}</Text>
        <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
          <View style={styles.progressHeader}>
            <Calendar size={20} color="#10B981" />
            <Text style={[styles.progressTitle, { color: theme.text }]}>This Week's Learning</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${userStats.weeklyProgress}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {t('weeklyGoalCompleted', { percent: userStats.weeklyProgress })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#10B981',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#10B981',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  school: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  levelProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  levelProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  quickStatCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  progressCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
});