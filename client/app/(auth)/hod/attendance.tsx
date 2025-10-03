import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy attendance data
const attendanceData = [
    {
        batch: 'EE-2021',
        semester: '6th',
        subjects: [
            { name: 'EM&I', attendance: 85, total: 40 },
            { name: 'EMFT', attendance: 78, total: 40 },
            { name: 'Physics', attendance: 92, total: 40 },
        ],
        overallAttendance: 85,
    },
    {
        batch: 'EE-2022',
        semester: '4th',
        subjects: [
            { name: 'Circuit Analysis', attendance: 88, total: 35 },
            { name: 'Digital Electronics', attendance: 82, total: 35 },
            { name: 'Signals & Systems', attendance: 90, total: 35 },
        ],
        overallAttendance: 87,
    },
];

export default function AttendanceReports() {
    const [selectedBatch, setSelectedBatch] = useState('All');

    const batches = ['All', 'EE-2021', 'EE-2022', 'EE-2023', 'EE-2024'];

    const filteredData = selectedBatch === 'All'
        ? attendanceData
        : attendanceData.filter(data => data.batch === selectedBatch);

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return '#10B981'; // Green
        if (percentage >= 75) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Batch Filter */}
            <View className="px-6 py-4">
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

            {/* Overall Stats */}
            <View className="px-6 mb-4">
                <View className="bg-red-50 rounded-lg p-4">
                    <Text className="text-lg font-semibold text-red-600 mb-2">Overall Statistics</Text>
                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-red-600">
                                {Math.round(filteredData.reduce((sum, batch) => sum + batch.overallAttendance, 0) / filteredData.length)}%
                            </Text>
                            <Text className="text-red-600 text-sm">Average Attendance</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-red-600">{filteredData.length}</Text>
                            <Text className="text-red-600 text-sm">Active Batches</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Export Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="file-download" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Export Report</Text>
                </TouchableOpacity>
            </View>

            {/* Attendance Reports */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Batch-wise Attendance</Text>

                {filteredData.map((batchData, idx) => (
                    <View key={idx} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xl font-bold text-gray-800">{batchData.batch}</Text>
                            <View className="bg-red-100 px-3 py-1 rounded-full">
                                <Text className="text-red-600 text-sm font-medium">{batchData.semester} Semester</Text>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-lg font-semibold mb-2">Overall Attendance</Text>
                            <View className="flex-row items-center">
                                <View className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                                    <View
                                        className="h-4 rounded-full"
                                        style={{
                                            width: `${batchData.overallAttendance}%`,
                                            backgroundColor: getAttendanceColor(batchData.overallAttendance)
                                        }}
                                    />
                                </View>
                                <Text className="font-bold" style={{ color: getAttendanceColor(batchData.overallAttendance) }}>
                                    {batchData.overallAttendance}%
                                </Text>
                            </View>
                        </View>

                        <Text className="text-base font-semibold mb-2">Subject-wise Attendance</Text>
                        {batchData.subjects.map((subject, subjectIdx) => {
                            const percentage = Math.round((subject.attendance / subject.total) * 100);
                            return (
                                <View key={subjectIdx} className="flex-row items-center justify-between mb-2">
                                    <Text className="text-gray-700 flex-1">{subject.name}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-600 text-sm mr-2">
                                            {subject.attendance}/{subject.total}
                                        </Text>
                                        <Text className="font-bold" style={{ color: getAttendanceColor(percentage) }}>
                                            {percentage}%
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        <View className="flex-row justify-end mt-3">
                            <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-blue-600 text-sm">View Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg">
                                <Text className="text-green-600 text-sm">Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}