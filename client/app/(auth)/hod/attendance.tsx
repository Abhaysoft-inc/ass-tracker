import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

interface AttendanceStats {
    totalSessions: number;
    todaySessions: number;
    overallPercentage: string;
    totalRecords: number;
    presentRecords: number;
    lowAttendanceCount: number;
    lowAttendanceStudents: Array<{
        id: number;
        name: string;
        rollNumber: string;
        totalClasses: number;
        present: number;
        percentage: string;
    }>;
}

export default function AttendanceReports() {
    const router = useRouter();
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendanceStats();
    }, []);

    const fetchAttendanceStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('hodToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }

            const response = await fetch(`${BASE_URL}/hod/attendance/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
            Alert.alert('Error', 'Failed to fetch attendance statistics');
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return '#10B981'; // Green
        if (percentage >= 75) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#dc2626" />
                <Text className="text-gray-600 mt-4">Loading attendance statistics...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
           

            <View className="p-6">
                {stats ? (
                    <>
                        {/* Overall Stats Cards */}
                        <View className="flex-row flex-wrap justify-between mb-6">
                            <View className="bg-blue-50 rounded-lg p-4 mb-4 w-[48%]">
                                <Icon name="school" size={24} color="#3b82f6" />
                                <Text className="text-3xl font-bold text-blue-600 mt-2">
                                    {stats.totalSessions}
                                </Text>
                                <Text className="text-blue-600 text-sm">Total Sessions</Text>
                            </View>

                            <View className="bg-green-50 rounded-lg p-4 mb-4 w-[48%]">
                                <Icon name="today" size={24} color="#10b981" />
                                <Text className="text-3xl font-bold text-green-600 mt-2">
                                    {stats.todaySessions}
                                </Text>
                                <Text className="text-green-600 text-sm">Today's Sessions</Text>
                            </View>

                            <View className="bg-purple-50 rounded-lg p-4 mb-4 w-[48%]">
                                <Icon name="assessment" size={24} color="#8b5cf6" />
                                <Text className="text-3xl font-bold text-purple-600 mt-2">
                                    {stats.overallPercentage}%
                                </Text>
                                <Text className="text-purple-600 text-sm">Overall Attendance</Text>
                            </View>

                            <View className="bg-red-50 rounded-lg p-4 mb-4 w-[48%]">
                                <Icon name="warning" size={24} color="#ef4444" />
                                <Text className="text-3xl font-bold text-red-600 mt-2">
                                    {stats.lowAttendanceCount}
                                </Text>
                                <Text className="text-red-600 text-sm">Low Attendance</Text>
                            </View>
                        </View>

                        {/* Low Attendance Students Alert */}
                        {stats.lowAttendanceStudents.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-lg font-semibold">Students Below 75%</Text>
                                    <View className="bg-red-100 px-3 py-1 rounded-full">
                                        <Text className="text-red-600 text-xs font-semibold">CRITICAL</Text>
                                    </View>
                                </View>

                                <View className="bg-red-50 rounded-lg border border-red-200 p-4">
                                    {stats.lowAttendanceStudents.map((student, idx) => (
                                        <View
                                            key={student.id}
                                            className={`flex-row items-center justify-between py-3 ${idx !== stats.lowAttendanceStudents.length - 1 ? 'border-b border-red-100' : ''
                                                }`}
                                        >
                                            <View className="flex-1">
                                                <Text className="font-semibold text-gray-800">{student.name}</Text>
                                                <Text className="text-sm text-gray-600">{student.rollNumber}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-red-600 font-bold">{student.percentage}%</Text>
                                                <Text className="text-xs text-gray-600">
                                                    {student.present}/{student.totalClasses} classes
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Attendance Records Summary */}
                        <View className="bg-gray-50 rounded-lg p-4 mb-6">
                            <Text className="text-lg font-semibold mb-3">Records Summary</Text>
                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-800">{stats.totalRecords}</Text>
                                    <Text className="text-sm text-gray-600">Total Records</Text>
                                </View>
                                <View>
                                    <Text className="text-2xl font-bold text-green-600">{stats.presentRecords}</Text>
                                    <Text className="text-sm text-gray-600">Present</Text>
                                </View>
                                <View>
                                    <Text className="text-2xl font-bold text-red-600">
                                        {stats.totalRecords - stats.presentRecords}
                                    </Text>
                                    <Text className="text-sm text-gray-600">Absent</Text>
                                </View>
                            </View>
                        </View>

                        {/* Info Card */}
                        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <View className="flex-row items-start">
                                <Icon name="info" size={20} color="#3b82f6" style={{ marginRight: 8, marginTop: 2 }} />
                                <View className="flex-1">
                                    <Text className="text-blue-800 font-semibold mb-1">Quick Actions</Text>
                                    <Text className="text-blue-700 text-sm mb-3">
                                        View detailed attendance by clicking the options below.
                                    </Text>

                                    <TouchableOpacity
                                        className="bg-blue-600 py-2 px-4 rounded-lg mb-2"
                                        onPress={() => router.push('/(auth)/hod/batches')}
                                    >
                                        <Text className="text-white text-center font-semibold">View Batch Attendance</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="bg-blue-600 py-2 px-4 rounded-lg"
                                        onPress={() => router.push('/(auth)/hod/students')}
                                    >
                                        <Text className="text-white text-center font-semibold">View Student Attendance</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <View className="bg-gray-50 p-6 rounded-lg">
                        <Text className="text-gray-600 text-center">No attendance data available</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}