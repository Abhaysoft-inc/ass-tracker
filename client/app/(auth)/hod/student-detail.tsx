import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { BASE_URL } from '../../../config/api';

export default function StudentDetail() {
    const { id } = useLocalSearchParams();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Prevent back button
    useFocusEffect(
        React.useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
            return () => backHandler.remove();
        }, [])
    );

    const fetchStudentDetails = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/hod/students/${id}`);
            const data = await response.json();
            if (data.success) {
                setStudent(data.data);
            } else {
                console.error('Failed to fetch student details:', data.message);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchStudentDetails();
    }, [fetchStudentDetails]);

    const handleVerifyStudent = async () => {
        try {
            const response = await fetch(`${BASE_URL}/hod/students/${id}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setStudent((prev: any) => ({
                    ...prev,
                    student: {
                        ...prev.student,
                        isVerified: true
                    }
                }));
            } else {
                console.error('Failed to verify student:', data.message);
            }
        } catch (error) {
            console.error('Error verifying student:', error);
        }
    };

    return (
        <View className="flex-1 bg-red-50">

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text className="text-gray-600 mt-4">Loading student details...</Text>
                </View>
            ) : student ? (
                <ScrollView className="flex-1 p-6">
                    {/* Basic Info Card */}
                    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-red-100">
                        <View className="items-center mb-4">
                            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-3">
                                <Icon name="person" size={40} color="#DC2626" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800 text-center">
                                {student.name}
                            </Text>
                            <Text className="text-red-600 text-center mt-1">
                                {student.email}
                            </Text>
                        </View>

                        {/* Status Badge */}
                        <View className="items-center mb-6">
                            <View className={`px-4 py-2 rounded-full ${student.student?.isVerified
                                ? 'bg-green-100 border border-green-200'
                                : 'bg-yellow-100 border border-yellow-200'
                                }`}>
                                <Text className={`font-medium ${student.student?.isVerified
                                    ? 'text-green-700'
                                    : 'text-yellow-700'
                                    }`}>
                                    {student.student?.isVerified ? 'Verified Student' : 'Pending Verification'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Student Details Card */}
                    {student.student && (
                        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-red-100">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Academic Details</Text>

                            <View className="space-y-4">
                                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium">Roll Number</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {student.student.rollNumber}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium">Course</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {student.student.course}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium">Batch</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {student.student.batch?.BatchName || 'N/A'}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium">Current Semester</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {student.student.batch?.currentSemester ?
                                            `${student.student.batch.currentSemester}${student.student.batch.currentSemester === 1 ? 'st' :
                                                student.student.batch.currentSemester === 2 ? 'nd' :
                                                    student.student.batch.currentSemester === 3 ? 'rd' : 'th'
                                            } Semester` : 'N/A'
                                        }
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                    <Text className="text-gray-600 font-medium">Phone</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {student.student.phone || 'N/A'}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-3">
                                    <Text className="text-gray-600 font-medium">Created At</Text>
                                    <Text className="font-semibold text-gray-800">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View>
                        <TouchableOpacity
                            className="bg-blue-600 py-4 rounded-xl items-center shadow-sm"
                            style={{ marginBottom: 15 }}
                        >
                            <View className="flex-row items-center">
                                <Icon name="edit" size={20} color="white" />
                                <Text className="text-white font-bold ml-2">Edit Student Information</Text>
                            </View>
                        </TouchableOpacity>

                        {student.student && !student.student.isVerified && (
                            <TouchableOpacity
                                className="bg-green-600 py-4 rounded-xl items-center shadow-sm"
                                style={{ marginBottom: 15 }}
                                onPress={handleVerifyStudent}
                            >
                                <View className="flex-row items-center">
                                    <Icon name="verified" size={20} color="white" />
                                    <Text className="text-white font-bold ml-2">Verify Student</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="bg-red-600 py-4 rounded-xl items-center shadow-sm"
                            style={{ marginBottom: 15 }}
                        >
                            <View className="flex-row items-center">
                                <Icon name="delete" size={20} color="white" />
                                <Text className="text-white font-bold ml-2">Remove Student</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Icon name="error" size={64} color="#DC2626" />
                    <Text className="text-xl font-bold text-gray-800 mt-4">Student Not Found</Text>
                    <Text className="text-gray-600 text-center mt-2 px-6">
                        The student you&apos;re looking for could not be found.
                    </Text>
                    <TouchableOpacity
                        className="bg-red-600 py-3 px-6 rounded-xl mt-4"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}