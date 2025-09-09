import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = (await AsyncStorage.getItem('role')) || 'student';
      setTimeout(() => {
        if (token) {
          if (role.toLowerCase() === 'teacher' || role.toLowerCase() === 'admin') {
            router.replace('/(teacher)');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/(auth)/login');
        }
      }, 3000);
    };
    bootstrap();
  }, []);

  return (
    <LinearGradient
      colors={['#E5E7EB', '#9CA3AF', '#6B7280']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Glowing sun effect - outer glow */}
        <View style={styles.glowOuter} />
        {/* Glowing sun effect - middle glow */}
        <View style={styles.glowMiddle} />
        {/* Glowing sun effect - inner glow */}
        <View style={styles.glowInner} />
        
        {/* EduGram text with shadow */}
        <Text style={styles.logo}>EduGram</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#FEF3C7',
    opacity: 0.3,
    zIndex: 1,
  },
  glowMiddle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FDE68A',
    opacity: 0.4,
    zIndex: 2,
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FCD34D',
    opacity: 0.5,
    zIndex: 3,
  },
  logo: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#22C55E',
    zIndex: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});