import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { notificationAPI, authAPI, Notification } from '../../../services/api';

export default function StudentNotifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [circulars, setCirculars] = useState<Notification[]>([]);
    const [events, setEvents] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'all' | 'circulars' | 'events'>('all');

    useEffect(() => {
        checkAuthAndLoadNotifications();
    }, []);

    const checkAuthAndLoadNotifications = async () => {
        try {
            const authStatus = await authAPI.checkAuthToken();
            if (!authStatus.hasToken) {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to view your notifications.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/student/login')
                        }
                    ]
                );
                return;
            }
            await loadNotifications();
        } catch (error) {
            console.error('Error checking authentication:', error);
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [notificationsData, circularsData, eventsData] = await Promise.all([
                notificationAPI.getStudentNotifications(),
                notificationAPI.getStudentCirculars(),
                notificationAPI.getStudentEvents(),
            ]);

            // Ensure all data are arrays before setting
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
            setCirculars(Array.isArray(circularsData) ? circularsData : []);
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (error) {
            console.error('Error loading notifications:', error);
            Alert.alert('Error', 'Failed to load notifications. Please try again.');
            // Set empty arrays on error to prevent crashes
            setNotifications([]);
            setCirculars([]);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationIds: number[]) => {
        try {
            await notificationAPI.markAsRead(notificationIds);
            // Refresh notifications
            loadNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'assignment':
                return '#3B82F6'; // Blue
            case 'circular':
                return '#10B981'; // Green
            case 'result':
                return '#F59E0B'; // Amber
            case 'event':
                return '#8B5CF6'; // Purple
            default:
                return '#6B7280'; // Gray
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'assignment': return '📋';
            case 'circular': return '📢';
            case 'result': return '📊';
            case 'event': return '🎉';
            default: return '📝';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return date.toLocaleDateString();
    };

    const getCurrentNotifications = () => {
        switch (selectedTab) {
            case 'circulars': return circulars;
            case 'events': return events;
            default: return [...notifications, ...circulars, ...events].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="mt-4 text-gray-600">Loading notifications...</Text>
            </View>
        );
    }

    const currentNotifications = getCurrentNotifications();

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">Notifications</Text>

            {/* Tab selector */}
            <View className="flex-row mb-6 bg-gray-100 rounded-lg p-1">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'circulars', label: 'Circulars' },
                    { key: 'events', label: 'Events' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        className={`flex-1 py-2 px-4 rounded-lg ${selectedTab === tab.key ? 'bg-red-600' : 'bg-transparent'}`}
                        onPress={() => setSelectedTab(tab.key as any)}
                    >
                        <Text className={`text-center font-medium ${selectedTab === tab.key ? 'text-white' : 'text-gray-600'}`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {currentNotifications.length === 0 ? (
                <View className="items-center justify-center mt-20">
                    <Text className="text-gray-500">No notifications available</Text>
                </View>
            ) : (
                currentNotifications.map((notification) => {
                    const color = getNotificationColor(notification.type);

                    return (
                        <TouchableOpacity
                            key={notification.id}
                            className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            onPress={() => {
                                if (!notification.isRead) {
                                    markAsRead([notification.id]);
                                }
                            }}
                        >
                            <View className="flex-row items-start">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: color + '20' }}
                                >
                                    <Text style={{ color }}>
                                        {getNotificationIcon(notification.type)}
                                    </Text>
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="font-semibold text-gray-800 flex-1" numberOfLines={1}>
                                            {notification.title}
                                        </Text>
                                        {!notification.isRead && (
                                            <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />
                                        )}
                                    </View>

                                    <Text className="text-sm text-gray-600 mb-2" numberOfLines={3}>
                                        {notification.message}
                                    </Text>

                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xs text-gray-400">
                                            {formatDate(notification.createdAt)}
                                        </Text>

                                        {notification.sender && (
                                            <Text className="text-xs text-gray-500">
                                                From: {notification.sender.name}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })
            )}
        </ScrollView>
    );
}