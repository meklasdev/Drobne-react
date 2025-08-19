import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { GameMode } from '../../App';

const { width, height } = Dimensions.get('window');

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const droneAnimation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    droneAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedDroneStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: droneAnimation.value * 20,
        },
        {
          rotateZ: `${droneAnimation.value * 5}deg`,
        },
      ],
    };
  });

  const handleButtonPress = (mode: GameMode) => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setTimeout(() => onStartGame(mode), 100);
  };

  const MenuButton = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    gradient 
  }: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    gradient: string[];
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.menuButton}>
      <BlurView intensity={20} style={styles.buttonBlur}>
        <LinearGradient
          colors={gradient}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            <Ionicons name={icon} size={32} color="#fff" />
            <View style={styles.buttonText}>
              <Text style={styles.buttonTitle}>{title}</Text>
              <Text style={styles.buttonSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e']}
        style={styles.background}
      />
      
      {/* Floating particles effect */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                animationDelay: Math.random() * 3000,
              },
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.droneIcon, animatedDroneStyle]}>
          <Ionicons name="airplane" size={60} color="#00d4ff" />
        </Animated.View>
        <Text style={styles.title}>FPV DRONE</Text>
        <Text style={styles.subtitle}>RACING SIMULATOR</Text>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuContainer}>
        <MenuButton
          title="Free Flight"
          subtitle="Explore the world freely"
          icon="infinite"
          onPress={() => handleButtonPress('freefly')}
          gradient={['#667eea', '#764ba2']}
        />
        
        <MenuButton
          title="Route Challenge"
          subtitle="Follow the racing course"
          icon="flag"
          onPress={() => handleButtonPress('route')}
          gradient={['#f093fb', '#f5576c']}
        />
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="game-controller" size={20} color="#00d4ff" />
          <Text style={styles.infoText}>Controller Support</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="phone-portrait" size={20} color="#00d4ff" />
          <Text style={styles.infoText}>Touch Controls</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particlesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#00d4ff',
    borderRadius: 1,
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  droneIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#00d4ff',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 1,
  },
  menuContainer: {
    width: '100%',
    gap: 20,
  },
  menuButton: {
    width: '100%',
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    borderRadius: 16,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    flex: 1,
    marginLeft: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#ffffff99',
    marginTop: 2,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#ffffff99',
    fontSize: 14,
  },
});