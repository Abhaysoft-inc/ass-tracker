import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { assignmentAPI, authAPI, Assignment } from '../../../services/api';

export default function StudentAssignments() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthAndLoadAssignments();
    }, []);

    const checkAuthAndLoadAssignments = async () => {
        try {
            const authStatus = await authAPI.checkAuthToken();
            if (!authStatus.hasToken) {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to view your assignments.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/student/login')
                        }
                    ]
                );
                return;
            }
            await loadAssignments();
        } catch (error) {
            console.error('Error checking authentication:', error);
            setLoading(false);
        }
    };

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const data = await assignmentAPI.getStudentAssignments();
            // Ensure data is an array before setting
            setAssignments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading assignments:', error);
            Alert.alert('Error', 'Failed to load assignments. Please try again.');
            // Set empty array on error to prevent map errors
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const getStatusColor = (assignment: Assignment) => {
        if (assignment.submissions && assignment.submissions.length > 0) {
            return 'text-green-600';
        }
        if (isOverdue(assignment.dueDate)) {
            return 'text-red-500';
        }
        return 'text-orange-500';
    };

    const getStatusText = (assignment: Assignment) => {
        if (assignment.submissions && assignment.submissions.length > 0) {
            const submission = assignment.submissions[0];
            return submission.status === 'GRADED' ? `Graded (${submission.marksObtained}/${assignment.totalMarks})` : 'Submitted';
        }
        if (isOverdue(assignment.dueDate)) {
            return 'Overdue';
        }
        return 'Pending';
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="mt-4 text-gray-600">Loading assignments...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">My Assignments</Text>

            {!assignments || assignments.length === 0 ? (
                <View className="items-center justify-center mt-20">
                    <Text className="text-gray-500">No assignments available</Text>
                </View>
            ) : (
                assignments.map((assignment) => (
                    <View
                        key={assignment.id}
                        className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-200"
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-lg font-semibold flex-1">{assignment.title}</Text>
                            <Text className="text-sm text-gray-600">({assignment.totalMarks} marks)</Text>
                        </View>

                        <Text className="text-base text-gray-700 mb-1">{assignment.subject.name}</Text>
                        <Text className="text-sm text-gray-600 mb-2">{assignment.description}</Text>
                        <Text className="text-sm text-gray-600 mb-3">Faculty: {assignment.faculty.name}</Text>

                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs text-gray-500">Due: {formatDate(assignment.dueDate)}</Text>
                            <Text className={`text-xs font-bold ${getStatusColor(assignment)}`}>
                                {getStatusText(assignment)}
                            </Text>
                        </View>

                        {/* Submission feedback if graded */}
                        {assignment.submissions && assignment.submissions.length > 0 && assignment.submissions[0].feedback && (
                            <View className="bg-blue-50 p-3 rounded-lg mt-2">
                                <Text className="text-sm font-medium text-blue-800 mb-1">Feedback:</Text>
                                <Text className="text-sm text-blue-700">{assignment.submissions[0].feedback}</Text>
                            </View>
                        )}

                        {/* Submit button for pending assignments */}
                        {(!assignment.submissions || assignment.submissions.length === 0) && !isOverdue(assignment.dueDate) && (
                            <TouchableOpacity
                                className="bg-red-600 py-2 px-4 rounded-lg mt-3"
                                onPress={() => {/* Navigate to submission screen */ }}
                            >
                                <Text className="text-white text-center font-medium">Submit Assignment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );
}
