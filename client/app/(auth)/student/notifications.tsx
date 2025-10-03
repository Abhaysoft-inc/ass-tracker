import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Dummy notifications data
const allNotifications = [
    {
        id: 1,
        type: 'assignment',
        title: 'New Assignment Posted',
        description: 'Mathematics Assignment #3 - Calculus has been posted. Due date: March 15th',
        time: '2 hours ago',
        isNew: true,
        icon: 'assignment'
    },
    {
        id: 2,
        type: 'circular',
        title: 'Important Circular',
        description: 'Annual Sports Day event scheduled for March 20th. All students must participate.',
        time: '5 hours ago',
        isNew: true,
        icon: 'announcement'
    },
    {
        id: 3,
        type: 'results',
        title: 'Results Declared',
        description: 'Mid-term examination results for Semester 6 have been published.',
        time: '1 day ago',
        isNew: false,
        icon: 'grade'
    },
    {
        id: 4,
        type: 'event',
        title: 'Workshop Registration',
        description: 'AI & Machine Learning workshop registration is now open. Limited seats available.',
        time: '2 days ago',
        isNew: false,
        icon: 'event'
    },
    {
        id: 5,
        type: 'assignment',
        title: 'Assignment Reminder',
        description: 'Physics Assignment #2 submission deadline is tomorrow at 11:59 PM.',
        time: '2 days ago',
        isNew: false,
        icon: 'assignment'
    },
    {
        id: 6,
        type: 'circular',
        title: 'Library Notice',
        description: 'Library will remain closed on March 18th due to maintenance work.',
        time: '3 days ago',
        isNew: false,
        icon: 'announcement'
    }
];

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'assignment':
            return '#3B82F6'; // Blue
        case 'circular':
            return '#10B981'; // Green
        case 'results':
            return '#F59E0B'; // Amber
        case 'event':
            return '#8B5CF6'; // Purple
        default:
            return '#6B7280'; // Gray
    }
};

export default function StudentNotifications() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">All Notifications</Text>

            {allNotifications.map((notification) => {
                const color = getNotificationColor(notification.type);

                return (
                    <View key={notification.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <View className="flex-row items-start">
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: color + '20' }}
                            >
                                <Text style={{ color }}>📋</Text>
                            </View>

                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="font-semibold text-gray-800 flex-1" numberOfLines={1}>
                                        {notification.title}
                                    </Text>
                                    {notification.isNew && (
                                        <View className="bg-red-500 w-2 h-2 rounded-full ml-2"></View>
                                    )}
                                </View>

                                <Text className="text-gray-600 text-sm mb-2">
                                    {notification.description}
                                </Text>

                                <Text className="text-xs text-gray-400">{notification.time}</Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}