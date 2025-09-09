import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Type, Grid3X3 } from 'lucide-react-native';

export default function GameScreen() {
  const router = useRouter();
  const { type, subject } = useLocalSearchParams<{
    type: string;
    subject: string;
  }>();
  const { theme } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {type === 'hangman' ? 'Hangman' : 'Sudoku'} - {subject}
        </Text>
      </View>

      {/* Game Content */}
      <View style={styles.content}>
        <View style={[styles.gameCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.gameIconContainer, { backgroundColor: type === 'hangman' ? '#8B5CF620' : '#3B82F620' }]}>
            {type === 'hangman' ? (
              <Type size={48} color="#8B5CF6" />
            ) : (
              <Grid3X3 size={48} color="#3B82F6" />
            )}
          </View>
          <Text style={[styles.gameTitle, { color: theme.text }]}>
            {type === 'hangman' ? 'Hangman Game' : 'Sudoku Puzzle'}
          </Text>
          <Text style={[styles.gameSubtitle, { color: theme.textSecondary }]}>
            Subject: {subject?.charAt(0).toUpperCase() + subject?.slice(1)}
          </Text>
          <Text style={[styles.comingSoon, { color: theme.textSecondary }]}>
            🚀 Game logic will be implemented soon!
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {type === 'hangman' 
              ? `Get ready to guess ${subject} related words and terms!`
              : `Solve ${subject} themed number puzzles and challenges!`
            }
          </Text>
        </View>
      </View>
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
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCard: {
    width: '100%',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gameIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});