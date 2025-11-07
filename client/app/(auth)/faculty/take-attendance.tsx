import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

interface TodayClass {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    batch: {
        BatchId: number;
        BatchName: string;
        course: string;
    };
}

interface Student {
    id: number;
    name: string;
    email: string;
    student: {
        rollNumber: string;
    };
}

export default function TakeAttendance() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>({});
    const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [topic, setTopic] = useState('');
    const [sessionType, setSessionType] = useState<'LECTURE' | 'PRACTICAL' | 'TUTORIAL'>('LECTURE');

    const fetchTodayClasses = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync('facultyToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }

            console.log('Fetching today\'s classes for attendance...');
            const response = await fetch(`${BASE_URL}/faculty/timetable/today`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Today classes for attendance:', data);

            if (data.success) {
                setTodayClasses(data.data);
                console.log('Loaded', data.data.length, 'classes for today');
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch today\'s classes');
            }
        } catch (error) {
            console.error('Fetch today classes error:', error);
            Alert.alert('Error', 'Failed to fetch today\'s classes');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchTodayClasses();
    }, [fetchTodayClasses]);

    useEffect(() => {
        if (selectedClass) {
            const classData = todayClasses.find(c => c.id === selectedClass);
            if (classData) {
                fetchStudents(classData.batch.BatchId, classData.subject.id);
            }
        }
    }, [selectedClass, todayClasses]);

    const fetchStudents = async (batchId: number, subjectId: number) => {
        try {
            const token = await SecureStore.getItemAsync('facultyToken');
            const response = await fetch(
                `${BASE_URL}/faculty/attendance/students?batchId=${batchId}&subjectId=${subjectId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
                // Initialize all as PRESENT
                const initialAttendance: { [key: number]: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' } = {};
                data.data.forEach((student: Student) => {
                    initialAttendance[student.id] = 'PRESENT';
                });
                setAttendanceData(initialAttendance);
            }
        } catch (error) {
            console.error('Fetch students error:', error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAttendance = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAllPresent = () => {
        const updated: { [key: number]: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' } = {};
        students.forEach(student => {
            updated[student.id] = 'PRESENT';
        });
        setAttendanceData(updated);
    };

    const submitAttendance = async () => {
        if (!selectedClass || !topic) {
            Alert.alert('Error', 'Please select a class and enter topic');
            return;
        }

        const classData = todayClasses.find(c => c.id === selectedClass);
        if (!classData) return;

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('facultyToken');
            const attendanceArray = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status
            }));

            const response = await fetch(`${BASE_URL}/faculty/attendance/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    batchId: classData.batch.BatchId,
                    subjectId: classData.subject.id,
                    date: new Date().toISOString().split('T')[0],
                    startTime: classData.startTime,
                    endTime: classData.endTime,
                    topic,
                    sessionType,
                    attendance: attendanceArray
                })
            });

            const data = await response.json();
            if (data.success) {
                const presentCount = attendanceArray.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
                const absentCount = attendanceArray.filter(a => a.status === 'ABSENT').length;

                Alert.alert(
                    'Attendance Submitted',
                    `Class: ${classData.subject.name}\nPresent: ${presentCount}\nAbsent: ${absentCount}`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to submit attendance');
            }
        } catch (error) {
            console.error('Submit attendance error:', error);
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 pt-16 pb-6 px-6">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Icon name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Take Attendance</Text>
                            <Text className="text-green-100 text-sm mt-1">Mark student attendance</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={fetchTodayClasses}
                        className="bg-green-700 p-2 rounded-lg"
                    >
                        <Icon name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center py-10">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="text-gray-600 mt-4">Loading today&apos;s classes...</Text>
                </View>
            ) : (
                <View className="px-6 py-4">
                    {/* Class Selection */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold mb-3">Today&apos;s Classes</Text>
                        {todayClasses.length === 0 ? (
                            <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <Text className="text-yellow-800 font-semibold mb-2">No classes scheduled for today</Text>
                                <Text className="text-yellow-700 text-sm">
                                    Please check your timetable or contact HOD if you believe this is incorrect.
                                </Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row space-x-3">
                                    {todayClasses.map((classItem) => (
                                        <TouchableOpacity
                                            key={classItem.id}
                                            onPress={() => setSelectedClass(classItem.id)}
                                            className={`min-w-64 p-4 rounded-lg border-2 ${selectedClass === classItem.id
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text className={`font-semibold text-base ${selectedClass === classItem.id ? 'text-green-800' : 'text-gray-800'
                                                    }`}>
                                                    {classItem.subject.name}
                                                </Text>
                                                <Icon
                                                    name="schedule"
                                                    size={20}
                                                    color={selectedClass === classItem.id ? '#166534' : '#6b7280'}
                                                />
                                            </View>
                                            <Text className="text-gray-600 text-sm mb-1">
                                                {classItem.batch.BatchName} • {classItem.batch.course}
                                            </Text>
                                            <Text className="text-gray-500 text-sm mb-1">
                                                Code: {classItem.subject.code}
                                            </Text>
                                            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-200">
                                                <Icon name="access-time" size={14} color="#6b7280" />
                                                <Text className="text-gray-600 text-sm ml-1">
                                                    {classItem.startTime} - {classItem.endTime}
                                                </Text>
                                            </View>
                                            {classItem.roomNumber && (
                                                <View className="flex-row items-center mt-1">
                                                    <Icon name="room" size={14} color="#6b7280" />
                                                    <Text className="text-gray-600 text-sm ml-1">
                                                        Room {classItem.roomNumber}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {selectedClass && (
                        <>
                            {/* Session Details */}
                            <View className="mb-4 bg-gray-50 p-4 rounded-lg">
                                <Text className="font-semibold mb-3">Session Details</Text>

                                {/* Show selected class info */}
                                {(() => {
                                    const classData = todayClasses.find(c => c.id === selectedClass);
                                    return classData ? (
                                        <View className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text className="text-gray-700 font-medium">{classData.subject.name}</Text>
                                                <Text className="text-green-600 text-sm">{classData.subject.code}</Text>
                                            </View>
                                            <View className="flex-row items-center mb-1">
                                                <Icon name="access-time" size={16} color="#6b7280" />
                                                <Text className="text-gray-600 text-sm ml-2">
                                                    {classData.startTime} - {classData.endTime}
                                                </Text>
                                            </View>
                                            {classData.roomNumber && (
                                                <View className="flex-row items-center">
                                                    <Icon name="room" size={16} color="#6b7280" />
                                                    <Text className="text-gray-600 text-sm ml-2">
                                                        Room {classData.roomNumber}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ) : null;
                                })()}

                                <TextInput
                                    placeholder="Topic covered *"
                                    value={topic}
                                    onChangeText={setTopic}
                                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3"
                                />

                                <Text className="text-sm text-gray-600 mb-1">Session Type</Text>
                                <View className="flex-row space-x-2">
                                    {['LECTURE', 'PRACTICAL', 'TUTORIAL'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setSessionType(type as any)}
                                            className={`flex-1 py-2 rounded-lg ${sessionType === type ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                        >
                                            <Text className={`text-center font-medium ${sessionType === type ? 'text-white' : 'text-gray-700'
                                                }`}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

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

                            {/* Mark All Present Button */}
                            <TouchableOpacity
                                onPress={markAllPresent}
                                className="bg-green-100 py-3 rounded-lg items-center mb-4"
                            >
                                <Text className="text-green-700 font-semibold">Mark All Present</Text>
                            </TouchableOpacity>

                            {/* Attendance Summary */}
                            <View className="bg-green-50 rounded-lg p-4 mb-4">
                                <Text className="font-semibold text-green-800 mb-2">Attendance Summary</Text>
                                <View className="flex-row justify-between">
                                    <Text className="text-green-700">
                                        Present: {Object.values(attendanceData).filter(status => status === 'PRESENT' || status === 'LATE').length}
                                    </Text>
                                    <Text className="text-red-700">
                                        Absent: {Object.values(attendanceData).filter(status => status === 'ABSENT').length}
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
                                        <View className="mb-3">
                                            <Text className="text-lg font-semibold text-gray-800">{student.name}</Text>
                                            <Text className="text-gray-600">{student.student.rollNumber}</Text>
                                        </View>

                                        <View className="flex-row flex-wrap gap-2">
                                            {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                                <TouchableOpacity
                                                    key={status}
                                                    onPress={() => handleAttendance(student.id, status as any)}
                                                    className={`px-3 py-2 rounded-lg ${attendanceData[student.id] === status
                                                        ? status === 'PRESENT' ? 'bg-green-500'
                                                            : status === 'ABSENT' ? 'bg-red-500'
                                                                : status === 'LATE' ? 'bg-yellow-500'
                                                                    : 'bg-blue-500'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <Text className={`font-medium text-sm ${attendanceData[student.id] === status
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                        }`}>
                                                        {status}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={submitAttendance}
                                disabled={submitting}
                                className={`py-4 rounded-xl items-center mb-4 ${submitting ? 'bg-gray-400' : 'bg-green-600'}`}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-semibold">Submit Attendance</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </ScrollView>
    );
}