import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function TakeAttendance() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [attendanceData, setAttendanceData] = useState({});

    // Sample class data
    const classes = [
        { id: '1', subject: 'Internship Assessment', batch: 'EE-2024', time: '09:30 - 11:10 AM', room: 'EE Seminar Hall' },
        { id: '2', subject: 'EMFT', batch: 'EE-2022', time: '12:20 - 01:10 PM', room: 'EE-102' },
        { id: '3', subject: 'Physics Lab', batch: 'EE-2023', time: '02:00 - 03:00 PM', room: 'Lab-1' },
    ];

    // Sample students data
    const students = [
        { id: '1', name: 'Abhay Vishwakarma', rollNo: 'EE2024001', batch: 'EE-2024' },
        { id: '2', name: 'Priya Sharma', rollNo: 'EE2024002', batch: 'EE-2024' },
        { id: '3', name: 'Rohit Kumar', rollNo: 'EE2024003', batch: 'EE-2024' },
        { id: '4', name: 'Sneha Patel', rollNo: 'EE2024004', batch: 'EE-2024' },
        { id: '5', name: 'Arjun Singh', rollNo: 'EE2024005', batch: 'EE-2024' },
        { id: '6', name: 'Kavya Reddy', rollNo: 'EE2024006', batch: 'EE-2024' },
        { id: '7', name: 'Vikram Joshi', rollNo: 'EE2024007', batch: 'EE-2024' },
        { id: '8', name: 'Anita Das', rollNo: 'EE2024008', batch: 'EE-2024' },
    ];

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAttendance = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const submitAttendance = () => {
        if (!selectedClass) {
            Alert.alert('Error', 'Please select a class first');
            return;
        }

        const presentCount = Object.values(attendanceData).filter(status => status === 'present').length;
        const absentCount = Object.values(attendanceData).filter(status => status === 'absent').length;

        Alert.alert(
            'Attendance Submitted',
            `Class: ${classes.find(c => c.id === selectedClass)?.subject}\nPresent: ${presentCount}\nAbsent: ${absentCount}`,
            [{ text: 'OK', onPress: () => router.back() }]
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
                        <Text className="text-white text-2xl font-bold">Take Attendance</Text>
                        <Text className="text-green-100 text-sm mt-1">Mark student attendance</Text>
                    </View>
                </View>
            </View>

            <View className="px-6 py-4">
                {/* Class Selection */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-3">Select Class</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row space-x-3">
                            {classes.map((classItem) => (
                                <TouchableOpacity
                                    key={classItem.id}
                                    onPress={() => setSelectedClass(classItem.id)}
                                    className={`min-w-64 p-4 rounded-lg border-2 ${selectedClass === classItem.id
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <Text className={`font-semibold ${selectedClass === classItem.id ? 'text-green-800' : 'text-gray-800'
                                        }`}>
                                        {classItem.subject}
                                    </Text>
                                    <Text className="text-gray-600 text-sm mt-1">
                                        {classItem.batch} • {classItem.time}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">Room: {classItem.room}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {selectedClass && (
                    <>
                        {/* Search Bar */}
                        <View className="mb-4">
                            <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
                                <Icon name="search" size={20} color="#6B7280" />
                                <TextInput
                                    placeholder="Search students by name or roll number"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    className="flex-1 ml-3 text-gray-800"
                                />
                            </View>
                        </View>

                        {/* Attendance Summary */}
                        <View className="bg-green-50 rounded-lg p-4 mb-4">
                            <Text className="font-semibold text-green-800 mb-2">Attendance Summary</Text>
                            <View className="flex-row justify-between">
                                <Text className="text-green-700">
                                    Present: {Object.values(attendanceData).filter(status => status === 'present').length}
                                </Text>
                                <Text className="text-red-700">
                                    Absent: {Object.values(attendanceData).filter(status => status === 'absent').length}
                                </Text>
                                <Text className="text-gray-700">
                                    Total: {filteredStudents.length}
                                </Text>
                            </View>
                        </View>

                        {/* Students List */}
                        <Text className="text-lg font-semibold mb-3">Students ({filteredStudents.length})</Text>
                        <View className="space-y-3 mb-6">
                            {filteredStudents.map((student) => (
                                <View key={student.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-800">{student.name}</Text>
                                            <Text className="text-gray-600">{student.rollNo}</Text>
                                        </View>

                                        <View className="flex-row space-x-2">
                                            <TouchableOpacity
                                                onPress={() => handleAttendance(student.id, 'present')}
                                                className={`px-4 py-2 rounded-lg ${attendanceData[student.id] === 'present'
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-200'
                                                    }`}
                                            >
                                                <Text className={`font-medium ${attendanceData[student.id] === 'present'
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                    }`}>
                                                    Present
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleAttendance(student.id, 'absent')}
                                                className={`px-4 py-2 rounded-lg ${attendanceData[student.id] === 'absent'
                                                        ? 'bg-red-500'
                                                        : 'bg-gray-200'
                                                    }`}
                                            >
                                                <Text className={`font-medium ${attendanceData[student.id] === 'absent'
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                    }`}>
                                                    Absent
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={submitAttendance}
                            className="bg-green-600 py-4 rounded-xl items-center mb-4"
                        >
                            <Text className="text-white text-lg font-semibold">Submit Attendance</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
}