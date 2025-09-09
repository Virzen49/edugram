import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoPositionY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start pulsating dots animation
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start dot animations
    createDotAnimation(dotAnim1, 0).start();
    createDotAnimation(dotAnim2, 200).start();
    createDotAnimation(dotAnim3, 400).start();

    // Phase 1: Initial fade in (0.8s)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: Hold position (1.2s)
      setTimeout(() => {
        // Phase 3: Animate logo to final position (1.2s)
        Animated.parallel([
          // Move logo up to login position
          Animated.timing(logoPositionY, {
            toValue: -height * 0.25, // Move up by 25% of screen height
            duration: 1200,
            useNativeDriver: true,
          }),
          // Scale down logo to match login size
          Animated.timing(logoScale, {
            toValue: 0.75,
            duration: 1200,
            useNativeDriver: true,
          }),
          // Fade out text
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          // Fade out background to prepare for transition
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Navigate to login after animation completes
          router.replace('/(auth)/login');
        });
      }, 1200);
    });
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: backgroundOpacity,
        }
      ]}
    >
      {/* White background with subtle gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: logoPositionY },
              { scale: logoScale },
            ],
          }
        ]}
      >
        {/* Logo with elegant shadows */}
        <View style={styles.logoContainer}>
          <View style={styles.logoShadow} />
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App name and tagline */}
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: textOpacity }
          ]}
        >
          <Text style={styles.appName}>Edugram</Text>
          <Text style={styles.tagline}>Learn • Play • Achieve</Text>
        </Animated.View>
      </Animated.View>

      {/* Elegant loading indicator */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          { opacity: textOpacity }
        ]}
      >
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoShadow: {
    position: 'absolute',
    width: 220,
    height: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 200,
    height: 80,
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
});