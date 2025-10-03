import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy faculty data
const facultyData = [
    {
        id: 1,
        name: 'Dr. R.K. Singh',
        designation: 'Professor',
        department: 'Electrical Engineering',
        subjects: ['EM&I', 'Power Systems'],
        phone: '9876543210',
        email: 'rk.singh@knit.ac.in',
        experience: '15 years',
    },
    {
        id: 2,
        name: 'Dr. D.K. Pandey',
        designation: 'Associate Professor',
        department: 'Electrical Engineering',
        subjects: ['EMFT', 'Circuit Analysis'],
        phone: '9876543211',
        email: 'dk.pandey@knit.ac.in',
        experience: '12 years',
    },
    {
        id: 3,
        name: 'Dr. A.B. Sharma',
        designation: 'Assistant Professor',
        department: 'Electrical Engineering',
        subjects: ['Physics', 'Mathematics'],
        phone: '9876543212',
        email: 'ab.sharma@knit.ac.in',
        experience: '8 years',
    },
];

export default function FacultyManagement() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaculty = facultyData.filter(faculty =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Search */}
            <View className="px-6 py-4">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="Search faculty..."
                        className="flex-1 ml-3 text-gray-800"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Add Faculty Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Add New Faculty</Text>
                </TouchableOpacity>
            </View>

            {/* Faculty List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Faculty Members ({filteredFaculty.length})</Text>

                {filteredFaculty.map((faculty) => (
                    <View key={faculty.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-semibold text-gray-800">{faculty.name}</Text>
                            <Text className="text-sm text-red-600 font-medium">{faculty.designation}</Text>
                        </View>

                        <Text className="text-sm text-gray-600 mb-2">Department: {faculty.department}</Text>
                        <Text className="text-sm text-gray-600 mb-2">Experience: {faculty.experience}</Text>

                        <View className="mb-2">
                            <Text className="text-sm text-gray-600">Subjects:</Text>
                            <View className="flex-row flex-wrap mt-1">
                                {faculty.subjects.map((subject, idx) => (
                                    <View key={idx} className="bg-red-100 px-2 py-1 rounded mr-2 mb-1">
                                        <Text className="text-red-600 text-xs">{subject}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View className="mb-3">
                            <Text className="text-sm text-gray-600">Phone: {faculty.phone}</Text>
                            <Text className="text-sm text-gray-600">Email: {faculty.email}</Text>
                        </View>

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