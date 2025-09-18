import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Dummy assignments data
const assignments = [
    {
        id: 1,
        subject: 'EM&I',
        title: 'Assignment #1',
        description: 'Solve problems 1-10 from Chapter 3.',
        dueDate: '2025-09-20',
        status: 'Pending',
    },
    {
        id: 2,
        subject: 'Physics',
        title: 'Lab Report',
        description: 'Submit the lab report for Experiment 5.',
        dueDate: '2025-09-22',
        status: 'Submitted',
    },
    {
        id: 3,
        subject: 'Mathematics',
        title: 'Assignment #2',
        description: 'Integration techniques worksheet.',
        dueDate: '2025-09-25',
        status: 'Pending',
    },
];

export default function StudentAssignments() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">My Assignments</Text>
            {assignments.length === 0 ? (
                <View className="items-center justify-center mt-20">
                    <Text className="text-gray-500">No assignments available</Text>
                </View>
            ) : (
                assignments.map((assignment) => (
                    <View
                        key={assignment.id}
                        className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-200"
                    >
                        <Text className="text-lg font-semibold mb-1">{assignment.title}</Text>
                        <Text className="text-base text-gray-700 mb-1">{assignment.subject}</Text>
                        <Text className="text-sm text-gray-600 mb-2">{assignment.description}</Text>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xs text-gray-500">Due: {assignment.dueDate}</Text>
                            <Text
                                className={`text-xs font-bold ${assignment.status === 'Pending' ? 'text-red-500' : 'text-green-600'}`}
                            >
                                {assignment.status}
                            </Text>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
