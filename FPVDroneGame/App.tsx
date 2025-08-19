import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainMenu from './src/components/MainMenu';
import GameScreen from './src/components/GameScreen';
import { GameProvider } from './src/context/GameContext';

const { width, height } = Dimensions.get('window');

export type GameMode = 'menu' | 'freefly' | 'route';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  return (
    <GestureHandlerRootView style={styles.container}>
      <GameProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          {gameMode === 'menu' ? (
            <MainMenu onStartGame={setGameMode} />
          ) : (
            <GameScreen 
              mode={gameMode} 
              onBack={() => setGameMode('menu')} 
            />
          )}
        </View>
      </GameProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});