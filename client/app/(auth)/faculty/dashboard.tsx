import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function FacultyDashboard() {
    // Current class data
    const currentClass = {
        subject: 'Internship Assessment',
        batch: 'EE-2024',
        time: '09:30 - 11:10 AM',
        room: 'EE Seminar Hall',
        studentsPresent: 45,
        totalStudents: 90,
    };

    // Quick actions
    const quickActions = [
        {
            name: 'Take Attendance',
            icon: 'check-circle',
            color: '#10B981',
            description: 'Mark attendance for current class'
        },
        {
            name: 'Transfer Class',
            icon: 'swap-horiz',
            color: '#F59E0B',
            description: 'Transfer class to another faculty'
        },
        {
            name: 'Request Past Attendance',
            icon: 'history',
            color: '#3B82F6',
            description: 'Request attendance from previous classes'
        },
    ];

    // Additional faculty features
    const facultyFeatures = [
        {
            name: 'Manage Assignments',
            icon: 'assignment',
            color: '#8B5CF6',
            description: 'Create and manage student assignments'
        },
        {
            name: 'Send Notifications',
            icon: 'notifications',
            color: '#EF4444',
            description: 'Send announcements to students'
        },
        {
            name: 'Grade Management',
            icon: 'grade',
            color: '#F59E0B',
            description: 'Enter and manage student grades'
        },
        {
            name: 'View Students',
            icon: 'people',
            color: '#06B6D4',
            description: 'View enrolled students list'
        },
        {
            name: 'Class Schedule',
            icon: 'schedule',
            color: '#84CC16',
            description: 'View your complete schedule'
        },
        {
            name: 'Exam Papers',
            icon: 'description',
            color: '#F97316',
            description: 'Manage exam papers and tests'
        },
        {
            name: 'Attendance Reports',
            icon: 'assessment',
            color: '#14B8A6',
            description: 'Generate attendance reports'
        },
        {
            name: 'Leave Request',
            icon: 'event-busy',
            color: '#DC2626',
            description: 'Apply for leave or substitute'
        },
    ];

    // Today's remaining schedule
    const upcomingClasses = [
        { time: '12:20 - 01:10 PM', subject: 'EMFT', batch: 'EE-2022', room: 'EE-102' },
        { time: '02:00 - 03:00 PM', subject: 'Physics Lab', batch: 'EE-2023', room: 'Lab-1' },
    ];

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 pt-16 pb-6 px-6">
                <Text className="text-white text-3xl font-bold">Faculty Dashboard</Text>
                <Text className="text-green-100 text-base mt-1">P.N. Verma - Electrical Engineering</Text>
            </View>

            {/* Current Class Section */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Current Class</Text>
                <View className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-2xl font-bold text-green-800">{currentClass.subject}</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-700 font-medium">LIVE</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-700">Batch: {currentClass.batch}</Text>
                        <Text className="text-gray-700">Room: {currentClass.room}</Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-700">Time: {currentClass.time}</Text>
                        <Text className="text-gray-700">
                            Total Students: {currentClass.totalStudents}
                        </Text>
                    </View>

                    {/* Attendance Progress Bar */}
                    {/* <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2">Attendance Progress</Text>
                        <View className="w-full bg-gray-200 rounded-full h-3">
                            <View
                                className="bg-green-500 h-3 rounded-full"
                                style={{ width: `${(currentClass.studentsPresent / currentClass.totalStudents) * 100}%` }}
                            />
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                            {Math.round((currentClass.studentsPresent / currentClass.totalStudents) * 100)}% Present
                        </Text>
                    </View> */}
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Quick Actions</Text>
                <View className="space-y-3">
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex-row items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: action.color + '20' }}
                            >
                                <Icon name={action.icon} size={24} color={action.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800">{action.name}</Text>
                                <Text className="text-sm text-gray-500">{action.description}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Faculty Features Grid */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Faculty Tools</Text>
                <View className="flex-row flex-wrap justify-between">
                    {facultyFeatures.map((feature, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className="w-[48%] bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm"
                        >
                            <View className="items-center">
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                    style={{ backgroundColor: feature.color + '20' }}
                                >
                                    <Icon name={feature.icon} size={24} color={feature.color} />
                                </View>
                                <Text className="font-semibold text-gray-800 text-center mb-1">{feature.name}</Text>
                                <Text className="text-xs text-gray-500 text-center">{feature.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Upcoming Classes */}
            <View className="px-6 py-4">
                <Text className="text-xl font-semibold mb-4">Upcoming Classes Today</Text>
                {upcomingClasses.length > 0 ? (
                    <View className="space-y-3">
                        {upcomingClasses.map((classItem, idx) => (
                            <View key={idx} className="bg-gray-50 rounded-lg p-4">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-lg font-semibold text-gray-800">{classItem.subject}</Text>
                                    <Text className="text-green-600 font-medium">{classItem.time}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Batch: {classItem.batch}</Text>
                                    <Text className="text-gray-600">Room: {classItem.room}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="bg-gray-50 rounded-lg p-6 items-center">
                        <Icon name="event-available" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">No more classes today</Text>
                    </View>
                )}
            </View>

            {/* Footer */}
            <View className="px-6 py-4 mt-6">
                <Text className="text-center text-gray-500 text-sm">
                    Department of Electrical Engineering
                </Text>
                <Text className="text-center text-gray-400 text-xs mt-1">
                    &copy; 2025 Team AAS
                </Text>
            </View>
        </ScrollView>
    );
}