import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Bookmark, Play, Plus, Send } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { lessonId, type } = useLocalSearchParams<{ lessonId: string; type: string }>();
  const [activeTab, setActiveTab] = useState<'Video' | 'Notes' | 'Discussion'>('Video');
  const [playing, setPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [fullTranscript, setFullTranscript] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { theme, t } = useApp();
  const playerRef = useRef<any>(null);

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
    // Get all lessons from the same subject/module
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
    
    // Count completed lessons
    const completed = allLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
    const total = allLessons.length;
    
    return { completed, total };
  };

  // Sample lesson data with YouTube video IDs
  const lessonData = {
    'intro-1-1': {
      title: 'Chemical Reactions',
      subject: 'Chemistry',
      description: 'Explore the fascinating world of chemical reactions with this engaging video. Learn about the key principles, see exciting experiments, and understand how these reactions shape our daily lives.',
      youtubeId: 'QImCld9YubE', // Real chemistry educational video with captions
      transcription: [
        { time: 0, text: "Welcome to our lesson on chemical reactions. Today we'll explore the fundamental concepts that govern how matter transforms." },
        { time: 15, text: "A chemical reaction occurs when chemical bonds are broken and new bonds are formed between atoms." },
        { time: 30, text: "The substances that react are called reactants, and the substances formed are called products." },
        { time: 45, text: "One of the most important principles is the conservation of mass - matter cannot be created or destroyed." },
        { time: 60, text: "Let's look at some examples of different types of chemical reactions." }
      ],
      notesFile: 'sample-notes.html',
      discussions: [
        { id: 1, user: 'Student A', message: 'Great explanation of chemical bonding!', time: '2 hours ago', timestamp: Date.now() - 7200000 },
        { id: 2, user: 'Teacher', message: 'Remember to practice the examples shown in the video.', time: '1 hour ago', timestamp: Date.now() - 3600000 },
      ]
    },
    'atomic-structure': {
      title: 'Atomic Structure',
      subject: 'Chemistry',
      description: 'Dive deep into the structure of atoms. Understand protons, neutrons, electrons, and how they determine the properties of elements.',
      youtubeId: 'yQP4UJhNn0I', // Real atomic structure educational video with captions
      transcription: [
        { time: 0, text: "Atoms are the fundamental building blocks of all matter in the universe." },
        { time: 20, text: "Every atom consists of a nucleus containing protons and neutrons, surrounded by electrons." },
        { time: 40, text: "The number of protons determines the element's identity and is called the atomic number." }
      ],
      notesFile: 'sample-notes.html',
      discussions: []
    },
    'variables-expressions': {
      title: 'Variables & Expressions',
      subject: 'Mathematics',
      description: 'Learn about variables and algebraic expressions. Master the fundamentals of representing unknown quantities and manipulating expressions.',
      youtubeId: 'NybHckSEQBI', // Real algebra educational video with captions
      transcription: [
        { time: 0, text: "Variables are symbols that represent unknown or changing quantities in mathematics." },
        { time: 18, text: "We typically use letters like x, y, and z to represent variables in algebraic expressions." },
        { time: 35, text: "An expression combines variables, numbers, and mathematical operations." }
      ],
      notesFile: 'sample-notes.html',
      discussions: []
    }
  };

  const currentLesson = lessonData[lessonId as keyof typeof lessonData];
  const questProgress = calculateQuestProgress();

  // Memoize updateTranscription to prevent infinite loops
  const updateTranscription = useCallback((time: number) => {
    // Use fetched transcript first, fallback to lesson data
    const transcript = fullTranscript.length > 0 ? fullTranscript : currentLesson?.transcription || [];
    
    if (transcript.length > 0) {
      // Find the current transcript segment based on time
      let currentTranscript = null;
      
      for (let i = 0; i < transcript.length; i++) {
        const item = transcript[i];
        const nextItem = transcript[i + 1];
        
        if (time >= item.time && (!nextItem || time < nextItem.time)) {
          currentTranscript = item;
          break;
        }
      }
      
      if (currentTranscript && currentTranscript.text !== transcription) {
        setTranscription(currentTranscript.text);
        console.log(`[${Math.floor(time)}s] Transcript: ${currentTranscript.text}`);
      }
    }
  }, [fullTranscript, currentLesson?.transcription, transcription]);

  // Manual progress tracking for better transcription sync
  useEffect(() => {
    let interval: any;
    
    if (playing && playerRef.current) {
      interval = setInterval(async () => {
        try {
          const currentTime = await playerRef.current?.getCurrentTime();
          if (currentTime && currentTime !== null) {
            setCurrentTime(currentTime);
            updateTranscription(currentTime);
          }
        } catch (error) {
          console.log('Error getting current time:', error);
        }
      }, 1000); // Update every second
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [playing, updateTranscription]);

  // Generate realistic educational transcript based on video topic
  const generateRealisticTranscript = useCallback(async (videoId: string): Promise<any[]> => {
    // In a real app, this would call YouTube Data API
    // For now, we'll create topic-appropriate transcripts
    
    const transcripts: { [key: string]: any[] } = {
      'QImCld9YubE': [ // Chemistry video
        { time: 0, text: "Welcome to today's lesson on chemical reactions. I'm your instructor, and we'll be exploring the fascinating world of chemistry." },
        { time: 8, text: "Chemical reactions are processes where chemical bonds are broken and new bonds are formed between atoms and molecules." },
        { time: 16, text: "Let's start with the basics. Every chemical reaction has reactants - these are the starting materials." },
        { time: 24, text: "And products - these are the substances formed as a result of the reaction." },
        { time: 32, text: "One of the most important principles in chemistry is the conservation of mass." },
        { time: 40, text: "This law states that matter cannot be created or destroyed in a chemical reaction." },
        { time: 48, text: "The total mass of reactants equals the total mass of products." },
        { time: 56, text: "Now, let's look at different types of chemical reactions." },
        { time: 64, text: "Synthesis reactions occur when two or more simple substances combine to form a more complex substance." },
        { time: 72, text: "The general form is A plus B yields AB." },
        { time: 80, text: "Decomposition reactions are the opposite - one compound breaks down into simpler substances." },
        { time: 88, text: "Single replacement reactions involve one element replacing another in a compound." },
        { time: 96, text: "Double replacement reactions occur when ions in two compounds switch places." },
        { time: 104, text: "Chemical reactions often involve energy changes - they can be exothermic or endothermic." },
        { time: 112, text: "Exothermic reactions release energy, usually in the form of heat." },
        { time: 120, text: "Endothermic reactions absorb energy from their surroundings." }
      ],
      'yQP4UJhNn0I': [ // Atomic structure video
        { time: 0, text: "Today we're going to explore the structure of atoms - the fundamental building blocks of all matter." },
        { time: 8, text: "An atom consists of a dense nucleus at its center, surrounded by electrons in orbitals." },
        { time: 16, text: "The nucleus contains protons, which have a positive charge, and neutrons, which are neutral." },
        { time: 24, text: "Electrons have a negative charge and are found in the electron cloud around the nucleus." },
        { time: 32, text: "The number of protons in an atom's nucleus determines what element it is." },
        { time: 40, text: "This is called the atomic number, and it's unique for each element." },
        { time: 48, text: "For example, hydrogen has one proton, so its atomic number is 1." },
        { time: 56, text: "Carbon has six protons, so its atomic number is 6." },
        { time: 64, text: "In a neutral atom, the number of protons equals the number of electrons." },
        { time: 72, text: "This means the positive and negative charges balance out." },
        { time: 80, text: "The mass of an atom is concentrated in its nucleus." },
        { time: 88, text: "Protons and neutrons have much greater mass than electrons." },
        { time: 96, text: "The atomic mass is the sum of protons and neutrons in the nucleus." }
      ],
      'NybHckSEQBI': [ // Algebra video
        { time: 0, text: "Welcome to algebra! Today we'll learn about variables and expressions." },
        { time: 6, text: "A variable is a symbol, usually a letter, that represents an unknown number." },
        { time: 12, text: "We commonly use letters like x, y, and z as variables." },
        { time: 18, text: "An algebraic expression combines variables, numbers, and mathematical operations." },
        { time: 24, text: "For example, 2x plus 3 is an algebraic expression." },
        { time: 30, text: "Here, x is our variable, 2 is the coefficient, and 3 is a constant." },
        { time: 36, text: "Let's look at more examples: 5y minus 4, or 3a plus 2b." },
        { time: 42, text: "To evaluate an expression, we substitute a value for the variable." },
        { time: 48, text: "If x equals 4, then 2x plus 3 equals 2 times 4 plus 3, which is 11." },
        { time: 54, text: "Remember to follow the order of operations: parentheses, exponents, multiplication and division, then addition and subtraction." },
        { time: 60, text: "This is often remembered by the acronym PEMDAS." },
        { time: 66, text: "Variables allow us to write general rules and solve problems with unknown quantities." }
      ]
    };
    
    return transcripts[videoId] || [];
  }, []);

  // Fetch real YouTube video transcript
  const fetchVideoTranscript = useCallback(async () => {
    if (!currentLesson?.youtubeId) return;
    
    setLoadingTranscript(true);
    try {
      // Note: YouTube Data API requires API key for production
      // For demo purposes, we'll use a simulated transcript that's more realistic
      // In production, you would integrate with YouTube Data API v3
      
      const simulatedTranscript = await generateRealisticTranscript(currentLesson.youtubeId);
      setFullTranscript(simulatedTranscript);
      
      // Set initial transcription
      if (simulatedTranscript.length > 0) {
        setTranscription(simulatedTranscript[0].text);
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      // Fallback to lesson's embedded transcription
      if (currentLesson.transcription) {
        setFullTranscript(currentLesson.transcription);
        setTranscription(currentLesson.transcription[0]?.text || '');
      }
    } finally {
      setLoadingTranscript(false);
    }
  }, [currentLesson?.youtubeId, currentLesson?.transcription, generateRealisticTranscript]);

  const loadDiscussions = useCallback(async () => {
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
  }, [lessonId, currentLesson?.discussions]);

  // Load discussions from storage and fetch video transcript
  useEffect(() => {
    const initializeLesson = async () => {
      if (currentLesson) {
        await loadDiscussions();
        await fetchVideoTranscript();
      }
    };
    
    initializeLesson();
  }, [lessonId, loadDiscussions, fetchVideoTranscript]); // Now these are memoized

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
        user: 'Current User', // Replace with actual user data
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

  const progressPercentage = questProgress.completed > 0 ? (questProgress.completed / questProgress.total) * 100 : 0;

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
            <YoutubePlayer
              ref={playerRef}
              height={220}
              play={playing}
              videoId={currentLesson.youtubeId}
              onChangeState={(state: string) => {
                console.log('YouTube player state changed:', state);
                if (state === 'ended') {
                  setPlaying(false);
                } else if (state === 'playing') {
                  setPlaying(true);
                } else if (state === 'paused') {
                  setPlaying(false);
                }
              }}
              onProgress={(data: any) => {
                const time = data.currentTime || 0;
                setCurrentTime(time);
                updateTranscription(time);
                console.log('Video progress:', time, 'seconds');
              }}
              onReady={() => {
                console.log('YouTube player ready');
                // Initialize transcription
                if (fullTranscript.length > 0) {
                  setTranscription(fullTranscript[0].text);
                }
              }}
              webViewStyle={{ opacity: 0.99 }}
              initialPlayerParams={{
                cc_lang_pref: 'en',
                showClosedCaptions: true,
                controls: 1,
                modestbranding: 1,
                rel: 0,
              }}
            />
          </View>
          
          {/* Real-time Transcription */}
          <View style={[styles.transcriptionContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.transcriptionHeader}>
              <Text style={[styles.transcriptionTitle, { color: theme.text }]}>Live Transcription</Text>
              <View style={styles.transcriptionControls}>
                {loadingTranscript && (
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
                )}
                <TouchableOpacity 
                  style={[styles.playPauseButton, { backgroundColor: theme.primary }]}
                  onPress={() => setPlaying(!playing)}
                >
                  <Play size={12} color="#FFFFFF" fill={playing ? "none" : "#FFFFFF"} />
                </TouchableOpacity>
              </View>
            </View>
            {transcription ? (
              <View>
                <View style={[styles.transcriptionBubble, { backgroundColor: theme.background }]}>
                  <Text style={[styles.transcriptionText, { color: theme.text }]}>
                    {transcription}
                  </Text>
                </View>
                <View style={styles.transcriptionProgress}>
                  <Text style={[styles.progressTime, { color: theme.textSecondary }]}>
                    🎵 {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </Text>
                  <View style={[styles.transcriptIndicator, playing ? styles.transcriptActive : {}, { backgroundColor: theme.primary }]} />
                </View>
              </View>
            ) : (
              <Text style={[styles.transcriptionPlaceholder, { color: theme.textSecondary }]}>
                {loadingTranscript ? '⏳ Fetching video transcript...' : '▶️ Play the video to see live transcription'}
              </Text>
            )}
          </View>
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
              
              {/* Debug: Show transcript timeline */}
              <View style={[styles.debugSection, { backgroundColor: theme.background }]}>
                <Text style={[styles.debugTitle, { color: theme.text }]}>Transcript Timeline (Debug)</Text>
                <ScrollView style={styles.debugScroll} showsVerticalScrollIndicator={false}>
                  {(fullTranscript.length > 0 ? fullTranscript : currentLesson?.transcription || []).map((item, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.debugItem,
                        { backgroundColor: theme.surface },
                        currentTime >= item.time && currentTime < ((fullTranscript[index + 1] || currentLesson?.transcription?.[index + 1])?.time || 999) ? 
                          { borderLeftColor: '#22C55E', borderLeftWidth: 3 } : {}
                      ]}
                    >
                      <Text style={[styles.debugTime, { color: theme.textSecondary }]}>
                        {Math.floor(item.time / 60)}:{String(item.time % 60).padStart(2, '0')}
                      </Text>
                      <Text style={[styles.debugText, { color: theme.text }]}>
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
          
          {activeTab === 'Notes' && (
            <View style={styles.notesContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Course Materials</Text>
              <WebView
                source={{ html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                      <title>Demo PowerPoint Notes</title>
                      <style>
                          body { font-family: Arial, sans-serif; margin: 20px; background: ${theme.background}; color: ${theme.text}; }
                          .slide { border: 1px solid #ccc; margin: 20px 0; padding: 20px; background: ${theme.surface}; border-radius: 8px; }
                          .slide-title { font-size: 20px; font-weight: bold; color: ${theme.text}; margin-bottom: 10px; }
                          .slide-content { font-size: 14px; line-height: 1.6; }
                          .slide-content p { margin: 8px 0; }
                      </style>
                  </head>
                  <body>
                      <h1>Chemical Reactions - Course Notes</h1>
                      
                      <div class="slide">
                          <div class="slide-title">1. Introduction to Chemical Reactions</div>
                          <div class="slide-content">
                              <p>• Chemical reactions involve the breaking and forming of chemical bonds</p>
                              <p>• Reactants are converted into products</p>
                              <p>• Energy changes occur during reactions</p>
                              <p>• Examples: combustion, photosynthesis, digestion</p>
                          </div>
                      </div>

                      <div class="slide">
                          <div class="slide-title">2. Types of Chemical Reactions</div>
                          <div class="slide-content">
                              <p><strong>Synthesis:</strong> A + B → AB</p>
                              <p><strong>Decomposition:</strong> AB → A + B</p>
                              <p><strong>Single Replacement:</strong> A + BC → AC + B</p>
                              <p><strong>Double Replacement:</strong> AB + CD → AD + CB</p>
                              <p><strong>Combustion:</strong> Hydrocarbon + O₂ → CO₂ + H₂O</p>
                          </div>
                      </div>

                      <div class="slide">
                          <div class="slide-title">3. Conservation Laws</div>
                          <div class="slide-content">
                              <p><strong>Law of Conservation of Mass:</strong> Mass cannot be created or destroyed</p>
                              <p><strong>Law of Conservation of Energy:</strong> Energy cannot be created or destroyed</p>
                              <p><strong>Balancing Equations:</strong> Same number of atoms on both sides</p>
                              <p>Example: 2H₂ + O₂ → 2H₂O</p>
                          </div>
                      </div>

                      <div class="slide">
                          <div class="slide-title">4. Practice Examples</div>
                          <div class="slide-content">
                              <p><strong>Synthesis:</strong> H₂ + Cl₂ → 2HCl</p>
                              <p><strong>Decomposition:</strong> 2H₂O → 2H₂ + O₂</p>
                              <p><strong>Combustion:</strong> CH₄ + 2O₂ → CO₂ + 2H₂O</p>
                              <p><strong>Double Replacement:</strong> AgNO₃ + NaCl → AgCl + NaNO₃</p>
                          </div>
                      </div>

                      <div class="slide">
                          <div class="slide-title">5. Key Takeaways</div>
                          <div class="slide-content">
                              <p>• Always balance chemical equations</p>
                              <p>• Identify reaction types to predict products</p>
                              <p>• Consider energy changes (endothermic vs exothermic)</p>
                              <p>• Practice with real-world examples</p>
                          </div>
                      </div>
                  </body>
                  </html>
                ` }}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
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
                  {/* <Text style={styles.addDiscussionText}>Add Discussion</Text> */}
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
    minHeight: 80,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playPauseButton: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  transcriptionBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  transcriptionPlaceholder: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  transcriptionProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTime: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  transcriptIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  transcriptActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
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
  debugSection: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  debugScroll: {
    maxHeight: 150,
  },
  debugItem: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    flexDirection: 'row',
    gap: 8,
  },
  debugTime: {
    fontSize: 10,
    fontFamily: 'monospace',
    minWidth: 40,
  },
  debugText: {
    fontSize: 10,
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
  webView: {
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