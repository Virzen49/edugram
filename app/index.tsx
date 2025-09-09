import { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Splash screen delay - 3 seconds then go to login
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#404040']}
      style={styles.container}
    >
      {/* Animated background glow */}
      <Animated.View 
        style={[
          styles.backgroundGlow,
          {
            opacity: glowAnim,
            transform: [{
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.2],
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 223, 0, 0.4)', 'rgba(255, 193, 7, 0.3)', 'rgba(255, 152, 0, 0.2)', 'transparent']}
          style={styles.sunGradient}
        />
      </Animated.View>

      {/* Blur overlay for sophistication */}
      <BlurView intensity={20} style={styles.blurOverlay}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)', 'transparent']}
          style={styles.overlayGradient}
        />
      </BlurView>

      {/* Main content with animations */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Logo with enhanced shadows */}
          <View style={styles.logoWrapper}>
            <Image 
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            {/* Multiple shadow layers for depth */}
            <View style={styles.logoShadow1} />
            <View style={styles.logoShadow2} />
            <View style={styles.logoShadow3} />
          </View>

          {/* Subtle animation particles */}
          <Animated.View 
            style={[
              styles.particle1,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                })
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.particle2,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                })
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.particle3,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                })
              }
            ]}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    alignSelf: 'center',
    top: height * 0.15,
  },
  sunGradient: {
    flex: 1,
    borderRadius: width * 0.75,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 320,
    height: 128,
    zIndex: 15,
  },
  logoShadow1: {
    position: 'absolute',
    width: 330,
    height: 138,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    zIndex: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoShadow2: {
    position: 'absolute',
    width: 340,
    height: 148,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 25,
    zIndex: 11,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  logoShadow3: {
    position: 'absolute',
    width: 350,
    height: 158,
    backgroundColor: 'rgba(255, 140, 0, 0.03)',
    borderRadius: 30,
    zIndex: 10,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 6,
  },
  particle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    top: -60,
    left: -80,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFA500',
    borderRadius: 3,
    top: -40,
    right: -70,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  particle3: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFE55C',
    borderRadius: 2,
    bottom: -50,
    left: 60,
    shadowColor: '#FFE55C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 3,
  },
});