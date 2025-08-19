import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FreeFlightScreen from '../screens/FreeFlightScreen';
import TracksScreen from '../screens/TracksScreen';

const Stack = createNativeStackNavigator();

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: '#0a0a0a',
	},
};

export default function AppNavigator() {
	return (
		<NavigationContainer theme={theme}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="FreeFlight" component={FreeFlightScreen} />
				<Stack.Screen name="Tracks" component={TracksScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}