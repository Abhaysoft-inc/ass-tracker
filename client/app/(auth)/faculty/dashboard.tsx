import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

type TimetableSlot = {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    batch: {
        BatchId: number;
        BatchName: string;
        course: string;
    };
};

type FacultyUser = {
    id: number;
    name: string;
    email: string;
    faculty?: {
        department: string;
    };
};

export default function FacultyDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentClass, setCurrentClass] = useState<TimetableSlot | null>(null);
    const [upcomingClasses, setUpcomingClasses] = useState<TimetableSlot[]>([]);
    const [facultyUser, setFacultyUser] = useState<FacultyUser | null>(null);

    const getToken = async () => await SecureStore.getItemAsync('facultyToken');

    const loadFacultyUser = useCallback(async () => {
        try {
            const userData = await SecureStore.getItemAsync('facultyUser');
            if (userData) {
                setFacultyUser(JSON.parse(userData));
            }
        } catch (error) {
            console.warn('Error loading faculty user:', error);
        }
    }, []);

    const fetchTodayClasses = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            console.log('Fetching today\'s classes with token:', token ? 'Token exists' : 'No token');

            const res = await fetch(`${BASE_URL}/faculty/timetable/today`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            console.log('Today classes response:', JSON.stringify(data, null, 2));

            if (data.success) {
                const classes = data.data || [];
                console.log('Total classes fetched:', classes.length);

                // Determine current and upcoming classes based on time
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                console.log('Current time:', currentTime);

                let current = null;
                const upcoming = [];

                for (const slot of classes) {
                    console.log(`Checking slot: ${slot.subject?.name} - ${slot.startTime} to ${slot.endTime}`);
                    if (slot.startTime <= currentTime && slot.endTime >= currentTime) {
                        current = slot;
                        console.log('Found current class:', slot.subject?.name);
                    } else if (slot.startTime > currentTime) {
                        upcoming.push(slot);
                        console.log('Added to upcoming:', slot.subject?.name);
                    }
                }

                console.log('Current class:', current ? current.subject?.name : 'None');
                console.log('Upcoming classes count:', upcoming.length);

                setCurrentClass(current);
                setUpcomingClasses(upcoming);
            } else {
                console.warn('API returned error:', data.message);
                Alert.alert('Error', data.message || 'Failed to fetch today\'s classes');
            }
        } catch (error) {
            console.error('fetchTodayClasses error:', error);
            Alert.alert('Error', 'Failed to fetch today\'s classes. Check console for details.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFacultyUser();
        fetchTodayClasses();
    }, [loadFacultyUser, fetchTodayClasses]);

    // Prevent back navigation to login screen
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // Return true to prevent default back action
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription?.remove();
        }, [])
    );

    // Quick actions
    const quickActions = [
        {
            name: 'Take Attendance',
            icon: 'check-circle',
            color: '#10B981',
            description: 'Mark attendance for current class'
        },
        {
            name: 'Transfer Class',
            icon: 'swap-horiz',
            color: '#F59E0B',
            description: 'Transfer class to another faculty'
        },
        {
            name: 'Request Past Attendance',
            icon: 'history',
            color: '#3B82F6',
            description: 'Request attendance from previous classes'
        },
    ];

    // Additional faculty features
    const facultyFeatures = [
        {
            name: 'Manage Assignments',
            icon: 'assignment',
            color: '#8B5CF6',
            description: 'Create and manage student assignments'
        },
        {
            name: 'Send Notifications',
            icon: 'notifications',
            color: '#EF4444',
            description: 'Send announcements to students'
        },
        {
            name: 'Grade Management',
            icon: 'grade',
            color: '#F59E0B',
            description: 'Enter and manage student grades'
        },
        {
            name: 'View Students',
            icon: 'people',
            color: '#06B6D4',
            description: 'View enrolled students list'
        },
        {
            name: 'Class Schedule',
            icon: 'schedule',
            color: '#84CC16',
            description: 'View your complete schedule'
        },
        {
            name: 'Exam Papers',
            icon: 'description',
            color: '#F97316',
            description: 'Manage exam papers and tests'
        },
        {
            name: 'Attendance Reports',
            icon: 'assessment',
            color: '#14B8A6',
            description: 'Generate attendance reports'
        },
        {
            name: 'Leave Request',
            icon: 'event-busy',
            color: '#DC2626',
            description: 'Apply for leave or substitute'
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear stored faculty data and token
                            await SecureStore.deleteItemAsync("facultyToken");
                            await SecureStore.deleteItemAsync("facultyUser");
                            console.log("Faculty data and token cleared");

                            // Navigate back to main screen
                            router.dismissAll();
                            router.replace("/");
                        } catch (error) {
                            console.log("Logout error:", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 pt-16 pb-6 px-6">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-white text-3xl font-bold">Faculty Dashboard</Text>
                        <Text className="text-green-100 text-base mt-1">
                            {facultyUser?.name || 'Faculty'} - {facultyUser?.faculty?.department || 'Department'}
                        </Text>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-green-700 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Icon name="logout" size={20} color="white" />
                        <Text className="text-white font-medium ml-2">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Current Class Section */}
            <View className="px-6 py-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-semibold">Current Class</Text>
                    <TouchableOpacity
                        onPress={fetchTodayClasses}
                        className="bg-green-100 px-3 py-2 rounded-lg flex-row items-center"
                    >
                        <Icon name="refresh" size={18} color="#10B981" />
                        <Text className="text-green-600 ml-1 text-sm">Refresh</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#10B981" />
                ) : currentClass ? (
                    <View className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-2xl font-bold text-green-800">{currentClass.subject.name}</Text>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 font-medium">LIVE</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between mb-3">
                            <Text className="text-gray-700">Batch: {currentClass.batch.BatchName}</Text>
                            <Text className="text-gray-700">Room: {currentClass.roomNumber || 'N/A'}</Text>
                        </View>

                        <View className="flex-row justify-between mb-4">
                            <Text className="text-gray-700">Time: {currentClass.startTime} - {currentClass.endTime}</Text>
                            <Text className="text-gray-700">Code: {currentClass.subject.code}</Text>
                        </View>
                    </View>
                ) : (
                    <View className="bg-gray-50 rounded-lg p-6 items-center">
                        <Icon name="event-available" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">No class at this time</Text>
                    </View>
                )}
            </View>

            {/* Quick Actions */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Quick Actions</Text>
                <View className="space-y-3">
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => {
                                if (action.name === 'Take Attendance') {
                                    router.push('/faculty/take-attendance');
                                } else if (action.name === 'Transfer Class') {
                                    router.push('/faculty/transfer-class');
                                } else if (action.name === 'Request Past Attendance') {
                                    router.push('/faculty/request-past-attendance');
                                }
                            }}
                            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex-row items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: action.color + '20' }}
                            >
                                <Icon name={action.icon} size={24} color={action.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800">{action.name}</Text>
                                <Text className="text-sm text-gray-500">{action.description}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Faculty Features Grid */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Faculty Tools</Text>
                <View className="flex-row flex-wrap justify-between">
                    {facultyFeatures.map((feature, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => {
                                if (feature.name === 'Class Schedule') {
                                    router.push('/faculty/schedule');
                                }
                            }}
                            className="w-[48%] bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm"
                        >
                            <View className="items-center">
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                    style={{ backgroundColor: feature.color + '20' }}
                                >
                                    <Icon name={feature.icon} size={24} color={feature.color} />
                                </View>
                                <Text className="font-semibold text-gray-800 text-center mb-1">{feature.name}</Text>
                                <Text className="text-xs text-gray-500 text-center">{feature.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Upcoming Classes */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Upcoming Classes Today</Text>
                {upcomingClasses.length > 0 ? (
                    <View className="space-y-3">
                        {upcomingClasses.map((classItem, idx) => (
                            <View key={idx} className="bg-gray-50 rounded-lg p-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-lg font-semibold text-gray-800">{classItem.subject.name}</Text>
                                    <Text className="text-green-600 font-medium">{classItem.startTime} - {classItem.endTime}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Batch: {classItem.batch.BatchName}</Text>
                                    <Text className="text-gray-600">Room: {classItem.roomNumber || 'N/A'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="bg-gray-50 rounded-lg p-6 items-center">
                        <Icon name="event-available" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">No more classes today</Text>
                    </View>
                )}
            </View>

            {/* Footer */}
            <View className="px-6 py-4 mt-6">
                <Text className="text-center text-gray-500 text-sm">
                    Department of Electrical Engineering
                </Text>
                <Text className="text-center text-gray-400 text-xs mt-1">
                    &copy; 2025 Team Phool 🌼
                </Text>
            </View>
        </ScrollView>
    );
}