import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy batches data
const batchesData = [
    {
        id: 1,
        name: 'EE-2021',
        year: '2021-2025',
        semester: '6th',
        totalStudents: 60,
        activeStudents: 58,
        classTeacher: 'Dr. R.K. Singh',
    },
    {
        id: 2,
        name: 'EE-2022',
        year: '2022-2026',
        semester: '4th',
        totalStudents: 65,
        activeStudents: 64,
        classTeacher: 'Dr. D.K. Pandey',
    },
    {
        id: 3,
        name: 'EE-2023',
        year: '2023-2027',
        semester: '2nd',
        totalStudents: 70,
        activeStudents: 69,
        classTeacher: 'Dr. A.B. Sharma',
    },
    {
        id: 4,
        name: 'EE-2024',
        year: '2024-2028',
        semester: '3rd',
        totalStudents: 90,
        activeStudents: 88,
        classTeacher: 'Dr. D.K.P',
    },
];

export default function BatchesManagement() {
    return (
        <ScrollView className="flex-1 bg-white">
            {/* Summary Cards */}
            <View className="px-6 py-4">
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{batchesData.length}</Text>
                        <Text className="text-red-600 text-sm">Total Batches</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {batchesData.reduce((sum, batch) => sum + batch.totalStudents, 0)}
                        </Text>
                        <Text className="text-red-600 text-sm">Total Students</Text>
                    </View>
                </View>
            </View>

            {/* Add Batch Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Add New Batch</Text>
                </TouchableOpacity>
            </View>

            {/* Batches List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Active Batches</Text>

                {batchesData.map((batch) => (
                    <View key={batch.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xl font-bold text-gray-800">{batch.name}</Text>
                            <View className="bg-red-100 px-3 py-1 rounded-full">
                                <Text className="text-red-600 text-sm font-medium">{batch.semester} Semester</Text>
                            </View>
                        </View>

                        <Text className="text-gray-600 mb-2">Academic Year: {batch.year}</Text>
                        <Text className="text-gray-600 mb-3">Class Co-ordinator: {batch.classTeacher}</Text>

                        <View className="flex-row justify-between mb-4">
                            <View className="items-center">
                                <Text className="text-lg font-bold text-gray-800">{batch.totalStudents}</Text>
                                <Text className="text-xs text-gray-500">Total Students</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-green-600">{batch.activeStudents}</Text>
                                <Text className="text-xs text-gray-500">Active Students</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-blue-600">
                                    {((batch.activeStudents / batch.totalStudents) * 100).toFixed(1)}%
                                </Text>
                                <Text className="text-xs text-gray-500">Active Rate</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-end space-x-2">
                            <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-blue-600 text-sm">View Students</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2">
                                <Text className="text-green-600 text-sm">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-orange-100 px-3 py-2 rounded-lg">
                                <Text className="text-orange-600 text-sm">Timetable</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}