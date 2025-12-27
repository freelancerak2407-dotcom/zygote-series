import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AuthService from './src/services/authService';
import { colors } from './src/config/theme';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import TracksScreen from './src/screens/TracksScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import TopicsScreen from './src/screens/TopicsScreen';
import TopicDetailScreen from './src/screens/TopicDetailScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.gray[400],
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <View style={{ fontSize: 24 }}>🏠</View>,
                }}
            />
            <Tab.Screen
                name="Tracks"
                component={TracksScreen}
                options={{
                    tabBarLabel: 'Tracks',
                    tabBarIcon: ({ color }) => <View style={{ fontSize: 24 }}>📚</View>,
                }}
            />
            <Tab.Screen
                name="Bookmarks"
                component={BookmarksScreen}
                options={{
                    tabBarLabel: 'Saved',
                    tabBarIcon: ({ color }) => <View style={{ fontSize: 24 }}>🔖</View>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <View style={{ fontSize: 24 }}>👤</View>,
                }}
            />
        </Tab.Navigator>
    );
}

// Auth Navigator
function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        </Stack.Navigator>
    );
}

// Main Navigator
function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary[500],
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Subjects"
                component={SubjectsScreen}
                options={{ title: 'Subjects' }}
            />
            <Stack.Screen
                name="Topics"
                component={TopicsScreen}
                options={{ title: 'Topics' }}
            />
            <Stack.Screen
                name="TopicDetail"
                component={TopicDetailScreen}
                options={{ title: 'Topic' }}
            />
        </Stack.Navigator>
    );
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await AuthService.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
