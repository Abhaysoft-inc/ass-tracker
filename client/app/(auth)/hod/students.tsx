import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy students data
const studentsData = [
    {
        id: 1,
        name: 'Abhay Vishwakarma',
        rollNo: 'EE2021001',
        batch: 'EE-2021',
        semester: '6th',
        phone: '9876543210',
        email: 'abhay@student.knit.ac.in',
        attendance: '85%',
    },
    {
        id: 2,
        name: 'Rahul Sharma',
        rollNo: 'EE2021002',
        batch: 'EE-2021',
        semester: '6th',
        phone: '9876543211',
        email: 'rahul@student.knit.ac.in',
        attendance: '92%',
    },
    {
        id: 3,
        name: 'Priya Singh',
        rollNo: 'EE2021003',
        batch: 'EE-2021',
        semester: '6th',
        phone: '9876543212',
        email: 'priya@student.knit.ac.in',
        attendance: '78%',
    },
];

export default function StudentsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');

    const batches = ['All', 'EE-2021', 'EE-2022', 'EE-2023', 'EE-2024'];

    const filteredStudents = studentsData.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Search and Filter */}
            <View className="px-6 py-4">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="Search students..."
                        className="flex-1 ml-3 text-gray-800"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Batch Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {batches.map((batch, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className={`px-4 py-2 rounded-full mr-3 ${selectedBatch === batch ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                            onPress={() => setSelectedBatch(batch)}
                        >
                            <Text className={selectedBatch === batch ? 'text-white' : 'text-gray-700'}>
                                {batch}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Add Student Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Add New Student</Text>
                </TouchableOpacity>
            </View>

            {/* Students List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Students List ({filteredStudents.length})</Text>

                {filteredStudents.map((student) => (
                    <View key={student.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-semibold text-gray-800">{student.name}</Text>
                            <Text className="text-sm text-red-600 font-medium">{student.rollNo}</Text>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">Batch: {student.batch}</Text>
                            <Text className="text-sm text-gray-600">Semester: {student.semester}</Text>
                        </View>

                        <View className="flex-row justify-between mb-3">
                            <Text className="text-sm text-gray-600">Phone: {student.phone}</Text>
                            <Text className="text-sm text-gray-600">Attendance: {student.attendance}</Text>
                        </View>

                        <Text className="text-sm text-gray-600 mb-3">{student.email}</Text>

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-blue-600 text-sm">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-green-600 text-sm">View</Text>
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