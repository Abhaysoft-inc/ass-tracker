import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy subjects data
const subjectsData = [
    {
        id: 1,
        name: 'Electromagnetic Fields and Waves',
        code: 'EE301',
        shortName: 'EM&I',
        credits: 4,
        semester: '6th',
        faculty: 'Dr. R.K. Singh',
        type: 'Core',
    },
    {
        id: 2,
        name: 'Electromagnetic Field Theory',
        code: 'EE302',
        shortName: 'EMFT',
        credits: 3,
        semester: '6th',
        faculty: 'Dr. D.K. Pandey',
        type: 'Core',
    },
    {
        id: 3,
        name: 'Engineering Physics',
        code: 'PH101',
        shortName: 'Physics',
        credits: 3,
        semester: '1st',
        faculty: 'Dr. A.B. Sharma',
        type: 'Core',
    },
    {
        id: 4,
        name: 'Engineering Mathematics',
        code: 'MA101',
        shortName: 'Mathematics',
        credits: 4,
        semester: '1st',
        faculty: 'Dr. S.K. Gupta',
        type: 'Core',
    },
];

export default function SubjectsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('All');

    const semesters = ['All', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    const filteredSubjects = subjectsData.filter(subject =>
        (subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.shortName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedSemester === 'All' || subject.semester === selectedSemester)
    );

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Search and Filter */}
            <View className="px-6 py-4">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="Search subjects..."
                        className="flex-1 ml-3 text-gray-800"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Semester Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {semesters.map((semester, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className={`px-4 py-2 rounded-full mr-3 ${selectedSemester === semester ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                            onPress={() => setSelectedSemester(semester)}
                        >
                            <Text className={selectedSemester === semester ? 'text-white' : 'text-gray-700'}>
                                {semester}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary Cards */}
            <View className="px-6 mb-4">
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{subjectsData.length}</Text>
                        <Text className="text-red-600 text-sm">Total Subjects</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {subjectsData.reduce((sum, subject) => sum + subject.credits, 0)}
                        </Text>
                        <Text className="text-red-600 text-sm">Total Credits</Text>
                    </View>
                </View>
            </View>

            {/* Add Subject Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Add New Subject</Text>
                </TouchableOpacity>
            </View>

            {/* Subjects List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Subjects List ({filteredSubjects.length})</Text>

                {filteredSubjects.map((subject) => (
                    <View key={subject.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-semibold text-gray-800 flex-1">{subject.name}</Text>
                            <View className="bg-red-100 px-2 py-1 rounded">
                                <Text className="text-red-600 text-xs font-medium">{subject.type}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">Code: {subject.code}</Text>
                            <Text className="text-sm text-gray-600">Short: {subject.shortName}</Text>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">Credits: {subject.credits}</Text>
                            <Text className="text-sm text-gray-600">Semester: {subject.semester}</Text>
                        </View>

                        <Text className="text-sm text-gray-600 mb-3">Faculty: {subject.faculty}</Text>

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-blue-600 text-sm">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-green-600 text-sm">Syllabus</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-orange-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-orange-600 text-sm">Assign</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-lg">
                                <Text className="text-red-600 text-sm">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}