import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bookmark, Plus, Send } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { lessonId, type } = useLocalSearchParams<{ lessonId: string; type: string }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Discussion'>('Video');
  const [transcription, setTranscription] = useState('');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme, t } = useApp();

  // Load completed lessons on component mount
  useEffect(() => {
    loadCompletedLessons();
  }, []);

  const loadCompletedLessons = async () => {
    try {
      const completed = await AsyncStorage.getItem('completedLessons');
      if (completed) {
        setCompletedLessons(JSON.parse(completed));
      }
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };

  // Calculate dynamic quest progress
  const calculateQuestProgress = () => {
    const allLessons = [
      'intro-1-1',
      'quiz-basics-1-2', 
      'quiz-2',
      'atomic-structure',
      'practice-test',
      'algebra-intro-1-1',
      'algebra-quiz-1',
      'variables-expressions',
      'algebra-practice-quiz'
    ];
    
    const completed = allLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
    const total = allLessons.length;
    
    return { completed, total };
  };

  // Sample lesson data with YouTube video URLs for web
  const lessonData = {
    'intro-1-1': {
      title: 'Chemical Reactions',
      subject: 'Chemistry',
      description: 'Explore the fascinating world of chemical reactions with this engaging video. Learn about the key principles, see exciting experiments, and understand how these reactions shape our daily lives.',
      youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual educational video
      transcription: [
        { time: 0, text: "Welcome to our lesson on chemical reactions. Today we'll explore the fundamental concepts that govern how matter transforms." },
        { time: 15, text: "A chemical reaction occurs when chemical bonds are broken and new bonds are formed between atoms." },
        { time: 30, text: "The substances that react are called reactants, and the substances formed are called products." },
        { time: 45, text: "One of the most important principles is the conservation of mass - matter cannot be created or destroyed." },
        { time: 60, text: "Let's look at some examples of different types of chemical reactions." }
      ],
      discussions: [
        { id: 1, user: 'Student A', message: 'Great explanation of chemical bonding!', time: '2 hours ago', timestamp: Date.now() - 7200000 },
        { id: 2, user: 'Teacher', message: 'Remember to practice the examples shown in the video.', time: '1 hour ago', timestamp: Date.now() - 3600000 },
      ]
    },
    'atomic-structure': {
      title: 'Atomic Structure',
      subject: 'Chemistry',
      description: 'Dive deep into the structure of atoms. Understand protons, neutrons, electrons, and how they determine the properties of elements.',
      youtubeUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      transcription: [
        { time: 0, text: "Atoms are the fundamental building blocks of all matter in the universe." },
        { time: 20, text: "Every atom consists of a nucleus containing protons and neutrons, surrounded by electrons." },
        { time: 40, text: "The number of protons determines the element's identity and is called the atomic number." }
      ],
      discussions: []
    },
    'variables-expressions': {
      title: 'Variables & Expressions',
      subject: 'Mathematics',
      description: 'Learn about variables and algebraic expressions. Master the fundamentals of representing unknown quantities and manipulating expressions.',
      youtubeUrl: 'https://www.youtube.com/embed/Me-eXrLwFvg',
      transcription: [
        { time: 0, text: "Variables are symbols that represent unknown or changing quantities in mathematics." },
        { time: 18, text: "We typically use letters like x, y, and z to represent variables in algebraic expressions." },
        { time: 35, text: "An expression combines variables, numbers, and mathematical operations." }
      ],
      discussions: []
    }
  };

  const currentLesson = lessonData[lessonId as keyof typeof lessonData];
  const questProgress = calculateQuestProgress();
  const progressPercentage = questProgress.completed > 0 ? (questProgress.completed / questProgress.total) * 100 : 0;

  // Load discussions from storage
  useEffect(() => {
    loadDiscussions();
    // Show initial transcription
    if (currentLesson?.transcription && currentLesson.transcription.length > 0) {
      setTranscription(currentLesson.transcription[0].text);
    }
  }, [lessonId]);

  const loadDiscussions = async () => {
    try {
      const stored = await AsyncStorage.getItem(`discussions_${lessonId}`);
      if (stored) {
        const storedDiscussions = JSON.parse(stored);
        setDiscussions([...currentLesson?.discussions || [], ...storedDiscussions]);
      } else {
        setDiscussions(currentLesson?.discussions || []);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
      setDiscussions(currentLesson?.discussions || []);
    }
  };

  const saveDiscussions = async (newDiscussions: any[]) => {
    try {
      await AsyncStorage.setItem(`discussions_${lessonId}`, JSON.stringify(newDiscussions));
    } catch (error) {
      console.error('Error saving discussions:', error);
    }
  };

  const addDiscussion = async () => {
    if (newDiscussion.trim()) {
      const discussion = {
        id: Date.now(),
        user: 'Current User',
        message: newDiscussion.trim(),
        time: 'Just now',
        timestamp: Date.now()
      };
      
      const userDiscussions = discussions.filter(d => !currentLesson?.discussions?.some(cd => cd.id === d.id));
      const updatedUserDiscussions = [...userDiscussions, discussion];
      
      setDiscussions([...currentLesson?.discussions || [], ...updatedUserDiscussions]);
      await saveDiscussions(updatedUserDiscussions);
      setNewDiscussion('');
    }
  };

  if (!currentLesson) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Lesson not found</Text>
        </View>
      </View>
    );
  }



  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{currentLesson.title}</Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Bookmark size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={[styles.progressSection, { backgroundColor: theme.surface }]}>
        <Text style={[styles.progressTitle, { color: theme.text }]}>Quest Progress</Text>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {questProgress.completed}/{questProgress.total}
        </Text>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={[styles.questProgressSubtext, { color: theme.textSecondary }]}>
          {questProgress.completed === 0 ? 'Start your learning journey!' : 
           questProgress.completed === questProgress.total ? 'Quest completed! 🎉' :
           `${questProgress.total - questProgress.completed} lessons remaining`}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoContainer}>
            <iframe
              width="100%"
              height="220"
              src={currentLesson.youtubeUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: 12 }}
            />
          </View>
          
          {/* Real-time Transcription */}
          {transcription && (
            <View style={[styles.transcriptionContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.transcriptionTitle, { color: theme.text }]}>Live Transcription</Text>
              <Text style={[styles.transcriptionText, { color: theme.textSecondary }]}>
                {transcription}
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          {['Video', 'Notes', 'Discussion'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab ? '#10B981' : theme.textSecondary },
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={[styles.tabContent, { backgroundColor: theme.surface }]}>
          {activeTab === 'Video' && (
            <View style={styles.videoTabContent}>
              <Text style={[styles.descriptionText, { color: theme.text }]}>
                {currentLesson.description}
              </Text>
            </View>
          )}
          
          {activeTab === 'Notes' && (
            <View style={styles.notesContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Course Materials</Text>
              <View style={[styles.notesWebContent, { backgroundColor: theme.background }]}>
                <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                  <h1>Chemical Reactions - Course Notes</h1>
                  
                  <div style={{ border: '1px solid #ccc', margin: '20px 0', padding: '20px', borderRadius: '8px' }}>
                    <h3>1. Introduction to Chemical Reactions</h3>
                    <p>• Chemical reactions involve the breaking and forming of chemical bonds</p>
                    <p>• Reactants are converted into products</p>
                    <p>• Energy changes occur during reactions</p>
                  </div>

                  <div style={{ border: '1px solid #ccc', margin: '20px 0', padding: '20px', borderRadius: '8px' }}>
                    <h3>2. Types of Chemical Reactions</h3>
                    <p><strong>Synthesis:</strong> A + B → AB</p>
                    <p><strong>Decomposition:</strong> AB → A + B</p>
                    <p><strong>Single Replacement:</strong> A + BC → AC + B</p>
                    <p><strong>Double Replacement:</strong> AB + CD → AD + CB</p>
                  </div>

                  <div style={{ border: '1px solid #ccc', margin: '20px 0', padding: '20px', borderRadius: '8px' }}>
                    <h3>3. Conservation Laws</h3>
                    <p><strong>Law of Conservation of Mass:</strong> Mass cannot be created or destroyed</p>
                    <p><strong>Law of Conservation of Energy:</strong> Energy cannot be created or destroyed</p>
                    <p><strong>Balancing Equations:</strong> Same number of atoms on both sides</p>
                  </div>
                </div>
              </View>
            </View>
          )}
          
          {activeTab === 'Discussion' && (
            <View style={styles.discussionContent}>
              <View style={styles.discussionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Discussion</Text>
                <TouchableOpacity 
                  style={[styles.addDiscussionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setNewDiscussion('')}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addDiscussionText}>Add Discussion</Text>
                </TouchableOpacity>
              </View>
              
              {/* Add Discussion Input */}
              <View style={[styles.discussionInput, { backgroundColor: theme.surface }]}>
                <TextInput
                  style={[styles.discussionTextInput, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Share your thoughts or ask a question..."
                  placeholderTextColor={theme.textSecondary}
                  value={newDiscussion}
                  onChangeText={setNewDiscussion}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, { backgroundColor: theme.primary }]}
                  onPress={addDiscussion}
                  disabled={!newDiscussion.trim()}
                >
                  <Send size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.discussionList}>
                {discussions.length > 0 ? (
                  discussions
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map((discussion, index) => (
                    <View key={discussion.id || index} style={[styles.discussionItem, { backgroundColor: theme.background }]}>
                      <Text style={[styles.discussionUser, { color: theme.primary }]}>{discussion.user}</Text>
                      <Text style={[styles.discussionMessage, { color: theme.text }]}>{discussion.message}</Text>
                      <Text style={[styles.discussionTime, { color: theme.textSecondary }]}>{discussion.time}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyDiscussion}>
                    <Text style={[styles.emptyDiscussionText, { color: theme.textSecondary }]}>
                      💬 No discussions yet. Be the first to start a conversation!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookmarkButton: {
    padding: 4,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  questProgressSubtext: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  videoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  transcriptionContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  videoTabContent: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesWebContent: {
    flex: 1,
    height: 400,
    borderRadius: 8,
  },
  discussionContent: {
    flex: 1,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addDiscussionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addDiscussionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  discussionInput: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  discussionTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussionList: {
    flex: 1,
  },
  discussionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  discussionUser: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  discussionMessage: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  discussionTime: {
    fontSize: 12,
  },
  emptyDiscussion: {
    padding: 40,
    alignItems: 'center',
  },
  emptyDiscussionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
});