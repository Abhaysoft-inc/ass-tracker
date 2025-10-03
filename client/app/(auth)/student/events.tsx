import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Dummy events data
const events = [
    {
        id: 1,
        title: 'Annual Sports Day',
        description: 'Join us for the Annual Sports Day with various athletic competitions and fun activities.',
        date: '2025-03-20',
        time: '9:00 AM - 5:00 PM',
        venue: 'College Sports Ground',
        category: 'Sports',
    },
    {
        id: 2,
        title: 'AI & Machine Learning Workshop',
        description: 'Learn about the latest trends in AI and ML from industry experts.',
        date: '2025-03-25',
        time: '10:00 AM - 4:00 PM',
        venue: 'Seminar Hall',
        category: 'Academic',
    },
    {
        id: 3,
        title: 'Cultural Fest - Technomania',
        description: 'Annual cultural festival with music, dance, drama and various competitions.',
        date: '2025-04-15',
        time: '6:00 PM - 11:00 PM',
        venue: 'Main Auditorium',
        category: 'Cultural',
    },
    {
        id: 4,
        title: 'Career Guidance Seminar',
        description: 'Get insights about career opportunities in Electrical Engineering.',
        date: '2025-04-02',
        time: '2:00 PM - 4:00 PM',
        venue: 'Conference Room',
        category: 'Career',
    },
];

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'Sports':
            return 'bg-green-100 text-green-800';
        case 'Academic':
            return 'bg-blue-100 text-blue-800';
        case 'Cultural':
            return 'bg-purple-100 text-purple-800';
        case 'Career':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function StudentEvents() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">Upcoming Events</Text>

            {events.map((event) => (
                <View key={event.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-semibold text-gray-800 flex-1">
                            {event.title}
                        </Text>
                        <Text className={`text-xs px-2 py-1 rounded ${getCategoryColor(event.category)}`}>
                            {event.category}
                        </Text>
                    </View>

                    <Text className="text-gray-600 text-sm mb-3">
                        {event.description}
                    </Text>

                    <View className="space-y-1">
                        <View className="flex-row">
                            <Text className="text-xs text-gray-500 w-16">Date:</Text>
                            <Text className="text-xs text-gray-700">{event.date}</Text>
                        </View>
                        <View className="flex-row">
                            <Text className="text-xs text-gray-500 w-16">Time:</Text>
                            <Text className="text-xs text-gray-700">{event.time}</Text>
                        </View>
                        <View className="flex-row">
                            <Text className="text-xs text-gray-500 w-16">Venue:</Text>
                            <Text className="text-xs text-gray-700">{event.venue}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}