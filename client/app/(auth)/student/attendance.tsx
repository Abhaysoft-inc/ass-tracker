import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SubjectAttendance {
    subjectId: number;
    subjectName: string;
    totalClasses: number;
    present: number;
    percentage: string;
}

interface AttendanceData {
    overall: {
        totalClasses: number;
        present: number;
        percentage: string;
    };
    subjectWise: SubjectAttendance[];
}

export default function StudentAttendance() {
    const router = useRouter();
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const token = await SecureStore.getItemAsync('loginToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }

            const response = await fetch(`${BASE_URL}/student/attendance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setAttendanceData(data.data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch attendance');
            }
        } catch (error) {
            console.error('Fetch attendance error:', error);
            Alert.alert('Error', 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getAttendanceTextColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-700';
        if (percentage >= 75) return 'text-yellow-700';
        return 'text-red-700';
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Loading attendance...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}


            <View className="p-6">
                {attendanceData ? (
                    <>
                        {/* Overall Attendance Card */}
                        <View className="mb-8">
                            <Text className="text-xl font-semibold mb-4">Overall Attendance</Text>
                            <View className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm">
                                <View className="items-center">
                                    <Text className="text-6xl font-bold text-blue-600 mb-2">
                                        {attendanceData.overall.percentage}%
                                    </Text>
                                    <Text className="text-gray-600 text-lg mb-4">
                                        {attendanceData.overall.present} / {attendanceData.overall.totalClasses} Classes
                                    </Text>

                                    {/* Progress Bar */}
                                    <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <View
                                            className={`h-full ${getAttendanceColor(parseFloat(attendanceData.overall.percentage))}`}
                                            style={{ width: `${attendanceData.overall.percentage}%` }}
                                        />
                                    </View>

                                    {/* Status Message */}
                                    <View className="mt-4">
                                        {parseFloat(attendanceData.overall.percentage) >= 75 ? (
                                            <View className="bg-green-100 px-4 py-2 rounded-full">
                                                <Text className="text-green-700 font-semibold">✓ Good Standing</Text>
                                            </View>
                                        ) : (
                                            <View className="bg-red-100 px-4 py-2 rounded-full">
                                                <Text className="text-red-700 font-semibold">⚠ Below 75%</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Subject-wise Attendance */}
                        <View>
                            <Text className="text-xl font-semibold mb-4">Subject-wise Attendance</Text>
                            {attendanceData.subjectWise.length === 0 ? (
                                <View className="bg-gray-50 p-6 rounded-lg">
                                    <Text className="text-gray-600 text-center">No attendance records yet</Text>
                                </View>
                            ) : (
                                <View className="space-y-3">
                                    {attendanceData.subjectWise.map((subject) => {
                                        const percentage = parseFloat(subject.percentage);
                                        return (
                                            <View
                                                key={subject.subjectId}
                                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                                            >
                                                <View className="flex-row items-center justify-between mb-3">
                                                    <Text className="text-lg font-semibold text-gray-800 flex-1">
                                                        {subject.subjectName}
                                                    </Text>
                                                    <Text className={`text-lg font-bold ${getAttendanceTextColor(percentage)}`}>
                                                        {subject.percentage}%
                                                    </Text>
                                                </View>

                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-gray-600">
                                                        {subject.present} / {subject.totalClasses} classes
                                                    </Text>
                                                    <View className={`px-3 py-1 rounded-full ${percentage >= 90 ? 'bg-green-100' :
                                                        percentage >= 75 ? 'bg-yellow-100' :
                                                            'bg-red-100'
                                                        }`}>
                                                        <Text className={`text-xs font-semibold ${percentage >= 90 ? 'text-green-700' :
                                                            percentage >= 75 ? 'text-yellow-700' :
                                                                'text-red-700'
                                                            }`}>
                                                            {percentage >= 90 ? 'Excellent' :
                                                                percentage >= 75 ? 'Good' :
                                                                    'Low'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Progress Bar */}
                                                <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <View
                                                        className={`h-full ${getAttendanceColor(percentage)}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* Info Card */}
                        <View className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <View className="flex-row items-start">
                                <Icon name="info" size={20} color="#2563eb" style={{ marginRight: 8, marginTop: 2 }} />
                                <View className="flex-1">
                                    <Text className="text-blue-800 font-semibold mb-1">Attendance Policy</Text>
                                    <Text className="text-blue-700 text-sm">
                                        Minimum 75% attendance is required to appear in exams.
                                        Keep your attendance above 75% to maintain good standing.
                                    </Text>
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