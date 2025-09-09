import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const students = [
    { name: 'Ethan Carter', points: 1300, rank: 1, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Sophia Lee', points: 1250, rank: 2, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Noah Clark', points: 1150, rank: 3, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Olivia Davis', points: 1050, rank: 4, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Liam Walker', points: 1000, rank: 5, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Ava Hall', points: 950, rank: 6, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Lucas Young', points: 900, rank: 7, avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Mia King', points: 850, rank: 8, avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const tabs = ['All', 'Subject', 'Grade'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput 
            placeholder="Search for a student"
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.tab, index === 0 && styles.activeTab]}
          >
            <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.leaderboardContainer}>
        {students.map((student, index) => (
          <View key={index} style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <Image source={{ uri: student.avatar }} style={styles.avatar} />
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentPoints}>{student.points} points</Text>
              </View>
            </View>
            <View style={styles.rankContainer}>
              {student.rank <= 3 && (
                <Text style={styles.trophy}>
                  {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                </Text>
              )}
              <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.currentUserCard}>
        <Text style={styles.currentUserText}>You - Rank 15</Text>
        <Text style={styles.currentUserPoints}>650 points</Text>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#E91E63',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  studentPoints: {
    fontSize: 14,
    color: '#6B7280',
  },
  rankContainer: {
    alignItems: 'center',
    gap: 8,
  },
  trophy: {
    fontSize: 24,
  },
  viewProfileButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  currentUserCard: {
    backgroundColor: '#FEF3C7',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 100,
  },
  currentUserText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  currentUserPoints: {
    fontSize: 16,
    color: '#A16207',
  },
});