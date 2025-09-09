import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';



export default function HomeScreen() {
  const [profile, setProfile] = useState<any>();

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

setProfile(data.user);

}

} catch (error) {

console.error('Error fetching profile:', error);

}

};

useEffect(() => {

getProfileData();

}, []);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Home</Text>
          <Text style={styles.welcomeText}>Welcome back, {profile?.email}!</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
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
        <Text style={styles.sectionTitle}>Subjects</Text>
        <View style={styles.subjectsGrid}>
          <TouchableOpacity style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>⚛️</Text>
            </View>
            <Text style={styles.subjectName}>Chemistry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>📐</Text>
            </View>
            <Text style={styles.subjectName}>Mathematics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>⚗️</Text>
            </View>
            <Text style={styles.subjectName}>Physics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>💻</Text>
            </View>
            <Text style={styles.subjectName}>Computer Science</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>XP & Leaderboard</Text>
          <Text style={styles.progressSubtitle}>Level 5</Text>
          <Text style={styles.progressXP}>1200 XP | Rank 12 in Class</Text>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
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