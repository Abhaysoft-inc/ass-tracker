import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function TransferClass() {
    const router = useRouter();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [reason, setReason] = useState('');

    // Sample current classes
    const currentClasses = [
        {
            id: '1',
            subject: 'Internship Assessment',
            batch: 'EE-2024',
            time: '09:30 - 11:10 AM',
            room: 'EE Seminar Hall',
            date: 'Today'
        },
        {
            id: '2',
            subject: 'EMFT',
            batch: 'EE-2022',
            time: '12:20 - 01:10 PM',
            room: 'EE-102',
            date: 'Today'
        },
        {
            id: '3',
            subject: 'Physics Lab',
            batch: 'EE-2023',
            time: '02:00 - 03:00 PM',
            room: 'Lab-1',
            date: 'Tomorrow'
        },
    ];

    // Available faculty members
    const availableFaculty = [
        { id: '1', name: 'Dr. Rajesh Kumar', department: 'Electrical Engineering', available: true },
        { id: '2', name: 'Prof. Sunita Sharma', department: 'Electrical Engineering', available: true },
        { id: '3', name: 'Dr. Amit Singh', department: 'Electrical Engineering', available: false },
        { id: '4', name: 'Prof. Priya Patel', department: 'Electrical Engineering', available: true },
        { id: '5', name: 'Dr. Vikram Joshi', department: 'Electronics Engineering', available: true },
    ];

    const availableFacultyOnly = availableFaculty.filter(faculty => faculty.available);

    const handleTransfer = () => {
        if (!selectedClass || !selectedFaculty || !reason.trim()) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const classData = currentClasses.find(c => c.id === selectedClass);
        const facultyData = availableFaculty.find(f => f.id === selectedFaculty);

        Alert.alert(
            'Transfer Request Submitted',
            `Class: ${classData?.subject}\nTransfer to: ${facultyData?.name}\nReason: ${reason}`,
            [
                { text: 'OK', onPress: () => router.back() }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 pt-16 pb-6 px-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Icon name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Transfer Class</Text>
                        <Text className="text-green-100 text-sm mt-1">Transfer your class to another faculty</Text>
                    </View>
                </View>
            </View>

            <View className="px-6 py-4">
                {/* Select Class to Transfer */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-3">Select Class to Transfer</Text>
                    <View className="space-y-3">
                        {currentClasses.map((classItem) => (
                            <TouchableOpacity
                                key={classItem.id}
                                onPress={() => setSelectedClass(classItem.id)}
                                className={`p-4 rounded-lg border-2 ${selectedClass === classItem.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className={`text-lg font-semibold ${selectedClass === classItem.id ? 'text-green-800' : 'text-gray-800'
                                        }`}>
                                        {classItem.subject}
                                    </Text>
                                    <View className={`px-2 py-1 rounded-full ${classItem.date === 'Today' ? 'bg-orange-100' : 'bg-blue-100'
                                        }`}>
                                        <Text className={`text-xs font-medium ${classItem.date === 'Today' ? 'text-orange-700' : 'text-blue-700'
                                            }`}>
                                            {classItem.date}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">{classItem.batch}</Text>
                                    <Text className="text-gray-600">{classItem.time}</Text>
                                </View>
                                <Text className="text-gray-500 text-sm mt-1">Room: {classItem.room}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Select Faculty */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-3">
                        Select Faculty ({availableFacultyOnly.length} available)
                    </Text>
                    <View className="space-y-3">
                        {availableFacultyOnly.map((faculty) => (
                            <TouchableOpacity
                                key={faculty.id}
                                onPress={() => setSelectedFaculty(faculty.id)}
                                className={`p-4 rounded-lg border-2 flex-row items-center ${selectedFaculty === faculty.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                                    <Icon name="person" size={24} color="#10B981" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-lg font-semibold ${selectedFaculty === faculty.id ? 'text-green-800' : 'text-gray-800'
                                        }`}>
                                        {faculty.name}
                                    </Text>
                                    <Text className="text-gray-600">{faculty.department}</Text>
                                </View>
                                <View className="w-3 h-3 bg-green-500 rounded-full" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reason for Transfer */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-3">Reason for Transfer *</Text>
                    <TextInput
                        placeholder="Please provide reason for class transfer..."
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                        className="bg-gray-100 rounded-lg p-4 text-gray-800 text-base"
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

                {/* Transfer Guidelines */}
                <View className="bg-blue-50 rounded-lg p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <Icon name="info" size={20} color="#3B82F6" />
                        <Text className="text-blue-800 font-semibold ml-2">Transfer Guidelines</Text>
                    </View>
                    <Text className="text-blue-700 text-sm">
                        • Transfer requests should be made at least 30 minutes before class{'\n'}
                        • Both faculty and students will be notified of the transfer{'\n'}
                        • The receiving faculty must accept the transfer request{'\n'}
                        • Emergency transfers can be processed immediately
                    </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleTransfer}
                    className="bg-green-600 py-4 rounded-xl items-center mb-4"
                >
                    <Text className="text-white text-lg font-semibold">Submit Transfer Request</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}