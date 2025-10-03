import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Dummy circulars data
const circulars = [
    {
        id: 1,
        title: 'Annual Sports Day - 2025',
        content: 'All students are required to participate in the Annual Sports Day event scheduled for March 20th, 2025. Registration is mandatory.',
        date: '2025-03-10',
        category: 'Events',
    },
    {
        id: 2,
        title: 'Library Maintenance Notice',
        content: 'The library will remain closed on March 18th due to scheduled maintenance work. Students are advised to plan accordingly.',
        date: '2025-03-15',
        category: 'Facilities',
    },
    {
        id: 3,
        title: 'Examination Schedule Update',
        content: 'The mid-term examination schedule has been updated. Please check the updated timetable on the notice board.',
        date: '2025-03-12',
        category: 'Academic',
    },
    {
        id: 4,
        title: 'Workshop on AI & ML',
        content: 'Department is organizing a workshop on Artificial Intelligence and Machine Learning. Limited seats available. Register now!',
        date: '2025-03-08',
        category: 'Academic',
    },
];

export default function StudentCirculars() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">Circulars</Text>

            {circulars.map((circular) => (
                <View key={circular.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-semibold text-gray-800 flex-1">
                            {circular.title}
                        </Text>
                        <Text className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {circular.category}
                        </Text>
                    </View>

                    <Text className="text-gray-600 text-sm mb-3">
                        {circular.content}
                    </Text>

                    <Text className="text-xs text-gray-400">
                        Date: {circular.date}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}