import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Dummy syllabus data
const syllabusData = [
    {
        id: 1,
        subject: 'EM&I',
        chapters: [
            { name: 'Chapter 1: Introduction to EM', completed: true },
            { name: 'Chapter 2: Maxwell Equations', completed: true },
            { name: 'Chapter 3: Wave Propagation', completed: false },
            { name: 'Chapter 4: Transmission Lines', completed: false },
        ],
    },
    {
        id: 2,
        subject: 'EMFT',
        chapters: [
            { name: 'Chapter 1: Electric Fields', completed: true },
            { name: 'Chapter 2: Magnetic Fields', completed: true },
            { name: 'Chapter 3: Electromagnetic Induction', completed: false },
        ],
    },
    {
        id: 3,
        subject: 'Physics',
        chapters: [
            { name: 'Chapter 1: Quantum Mechanics', completed: true },
            { name: 'Chapter 2: Atomic Structure', completed: false },
            { name: 'Chapter 3: Nuclear Physics', completed: false },
        ],
    },
];

export default function StudentSyllabus() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">Syllabus</Text>

            {syllabusData.map((subject) => (
                <View key={subject.id} className="mb-6">
                    <Text className="text-xl font-semibold mb-3 text-blue-600">{subject.subject}</Text>

                    {subject.chapters.map((chapter, idx) => (
                        <View key={idx} className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 mb-2">
                            <Text className="flex-1 text-gray-800">{chapter.name}</Text>
                            <View className={`w-4 h-4 rounded-full ${chapter.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}