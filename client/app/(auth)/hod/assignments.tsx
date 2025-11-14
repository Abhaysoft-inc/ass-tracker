import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { assignmentAPI, authAPI, Assignment } from '../../../services/api';

export default function AssignmentsMonitoring() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const statuses = ['All', 'PUBLISHED', 'DRAFT', 'CLOSED'];

    useEffect(() => {
        checkAuthAndLoadAssignments();
    }, []);

    const checkAuthAndLoadAssignments = async () => {
        try {
            const authStatus = await authAPI.checkAuthToken();
            if (!authStatus.hasToken) {
                Alert.alert(
                    'Authentication Required',
                    'Please log in as HOD to view assignments.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/hod/login')
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
            const data = await assignmentAPI.getHODAssignments();
            // Ensure data is an array before setting
            setAssignments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading assignments:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load assignments';
            if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
                Alert.alert(
                    'Access Denied',
                    'You do not have permission to view assignments. Please ensure you are logged in as HOD.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/hod/login')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to load assignments. Please try again.');
            }
            // Set empty array on error to prevent map errors
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = (assignments || []).filter(assignment =>
        (assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.subject.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedStatus === 'All' || assignment.status === selectedStatus)
    );

    const getSubmissionRate = (submitted: number, total: number) => {
        return total > 0 ? Math.round((submitted / total) * 100) : 0;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return '#F59E0B';
            case 'CLOSED': return '#10B981';
            case 'DRAFT': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'Active';
            case 'CLOSED': return 'Closed';
            case 'DRAFT': return 'Draft';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
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
        <ScrollView className="flex-1 bg-white">
            {/* Search and Filter */}
            <View className="px-6 py-4">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="Search assignments..."
                        className="flex-1 ml-3 text-gray-800"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Status Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {statuses.map((status, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className={`px-4 py-2 rounded-full mr-3 ${selectedStatus === status ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text className={selectedStatus === status ? 'text-white' : 'text-gray-700'}>
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary Cards */}
            <View className="px-6 mb-4">
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{assignments.length}</Text>
                        <Text className="text-red-600 text-sm">Total Assignments</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {assignments.filter(a => a.status === 'PUBLISHED').length}
                        </Text>
                        <Text className="text-red-600 text-sm">Active</Text>
                    </View>
                </View>
            </View>

            {/* Assignments List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Assignments ({filteredAssignments.length})</Text>

                {filteredAssignments.map((assignment) => {
                    const submissionRate = getSubmissionRate(assignment.submissionCount || 0, assignment.totalStudents || 0);
                    const statusColor = getStatusColor(assignment.status);

                    return (
                        <View key={assignment.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-lg font-semibold text-gray-800 flex-1">{assignment.title}</Text>
                                <View className="px-2 py-1 rounded" style={{ backgroundColor: statusColor + '20' }}>
                                    <Text className="text-xs font-medium" style={{ color: statusColor }}>
                                        {getStatusLabel(assignment.status)}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-gray-600">Subject: {assignment.subject.name}</Text>
                                <Text className="text-sm text-gray-600">Batch: {assignment.batch.BatchName}</Text>
                            </View>

                            <Text className="text-sm text-gray-600 mb-2">Faculty: {assignment.faculty.name}</Text>
                            <Text className="text-sm text-gray-600 mb-2">Total Marks: {assignment.totalMarks}</Text>
                            <Text className="text-sm text-gray-600 mb-3">Due Date: {formatDate(assignment.dueDate)}</Text>

                            {/* Submission Progress */}
                            {assignment.status === 'PUBLISHED' && (
                                <View className="mb-3">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-sm text-gray-600">Submissions</Text>
                                        <Text className="text-sm font-medium text-gray-800">
                                            {assignment.submissionCount || 0}/{assignment.totalStudents || 0} ({submissionRate}%)
                                        </Text>
                                    </View>
                                    <View className="w-full bg-gray-200 rounded-full h-2">
                                        <View
                                            className="h-2 rounded-full bg-red-600"
                                            style={{ width: `${submissionRate}%` }}
                                        />
                                    </View>
                                </View>
                            )}

                            <View className="flex-row justify-end space-x-2">
                                <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                    <Text className="text-blue-600 text-sm">View Details</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-green-100 px-3 py-2 rounded-lg mr-2"
                                    onPress={() => {/* Navigate to submissions */ }}
                                >
                                    <Text className="text-green-600 text-sm">Submissions</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-orange-100 px-3 py-2 rounded-lg">
                                    <Text className="text-orange-600 text-sm">Remind</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}