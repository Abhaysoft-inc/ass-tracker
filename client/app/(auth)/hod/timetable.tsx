import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy timetable data
const timetableData = [
    {
        batch: 'EE-2021',
        semester: '6th',
        schedule: {
            Monday: [
                { time: '9:00-10:00', subject: 'EM&I', faculty: 'Dr. R.K. Singh', room: 'EE-101' },
                { time: '10:00-11:00', subject: 'EMFT', faculty: 'Dr. D.K. Pandey', room: 'EE-102' },
                { time: '11:30-12:30', subject: 'Lab', faculty: 'Dr. A.B. Sharma', room: 'Lab-1' },
            ],
            Tuesday: [
                { time: '9:00-10:00', subject: 'Physics', faculty: 'Dr. A.B. Sharma', room: 'PH-201' },
                { time: '10:00-11:00', subject: 'Mathematics', faculty: 'Dr. S.K. Gupta', room: 'MA-101' },
            ],
            Wednesday: [
                { time: '9:00-10:00', subject: 'EM&I', faculty: 'Dr. R.K. Singh', room: 'EE-101' },
                { time: '11:30-12:30', subject: 'EMFT Lab', faculty: 'Dr. D.K. Pandey', room: 'Lab-2' },
            ],
        }
    },
    {
        batch: 'EE-2022',
        semester: '4th',
        schedule: {
            Monday: [
                { time: '9:00-10:00', subject: 'Circuit Analysis', faculty: 'Dr. M.K. Verma', room: 'EE-103' },
                { time: '10:00-11:00', subject: 'Digital Electronics', faculty: 'Dr. P.K. Singh', room: 'EE-104' },
            ],
            Tuesday: [
                { time: '9:00-10:00', subject: 'Signals & Systems', faculty: 'Dr. N.K. Jha', room: 'EE-105' },
                { time: '11:30-12:30', subject: 'Lab', faculty: 'Dr. M.K. Verma', room: 'Lab-3' },
            ],
        }
    },
];

export default function TimetableManagement() {
    const [selectedBatch, setSelectedBatch] = useState('EE-2021');

    const batches = ['EE-2021', 'EE-2022', 'EE-2023', 'EE-2024'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const currentBatchData = timetableData.find(batch => batch.batch === selectedBatch);

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Batch Selector */}
            <View className="px-6 py-4">
                <Text className="text-lg font-semibold mb-3">Select Batch</Text>
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

            {/* Action Buttons */}
            <View className="px-6 mb-4">
                <View className="flex-row justify-between">
                    <TouchableOpacity className="flex-1 bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center mr-2">
                        <Icon name="add" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Add Class</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg py-3 px-4 flex-row items-center justify-center ml-2">
                        <Icon name="file-download" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Export</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Current Batch Info */}
            {currentBatchData && (
                <View className="px-6 mb-4">
                    <View className="bg-red-50 rounded-lg p-4">
                        <Text className="text-lg font-semibold text-red-600">
                            {currentBatchData.batch} - {currentBatchData.semester} Semester
                        </Text>
                    </View>
                </View>
            )}

            {/* Timetable */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Weekly Schedule</Text>

                {days.map((day) => (
                    <View key={day} className="mb-4">
                        <View className="bg-gray-100 p-3 rounded-t-lg">
                            <Text className="font-semibold text-gray-800">{day}</Text>
                        </View>

                        <View className="bg-white border border-gray-200 rounded-b-lg">
                            {currentBatchData?.schedule[day] ? (
                                currentBatchData.schedule[day].map((classItem, idx) => (
                                    <View key={idx} className="p-3 border-b border-gray-100 last:border-b-0">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="font-semibold text-gray-800">{classItem.subject}</Text>
                                            <Text className="text-red-600 font-medium">{classItem.time}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-600 text-sm">Faculty: {classItem.faculty}</Text>
                                            <Text className="text-gray-600 text-sm">Room: {classItem.room}</Text>
                                        </View>

                                        <View className="flex-row justify-end mt-2">
                                            <TouchableOpacity className="bg-blue-100 px-2 py-1 rounded mr-2">
                                                <Text className="text-blue-600 text-xs">Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity className="bg-red-100 px-2 py-1 rounded">
                                                <Text className="text-red-600 text-xs">Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="p-4 items-center">
                                    <Text className="text-gray-500">No classes scheduled</Text>
                                    <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-lg mt-2">
                                        <Text className="text-red-600 text-sm">Add Class</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}