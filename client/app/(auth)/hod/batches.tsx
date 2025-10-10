import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../../config/api';

export default function BatchesManagement() {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch batches from API
    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/hod/batches`);
            const data = await response.json();

            if (response.ok && data.success) {
                setBatches(data.data);
            } else {
                Alert.alert('Error', 'Failed to fetch batches');
                console.error('Failed to fetch batches:', data.message);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load batches when component mounts
    useEffect(() => {
        fetchBatches();
    }, []);
    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#DC2626" />
                <Text className="text-gray-600 mt-4">Loading batches...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Summary Cards */}
            <View className="px-6 py-4">
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{batches.length}</Text>
                        <Text className="text-red-600 text-sm">Total Batches</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {batches.reduce((sum: number, batch: any) => sum + batch.students.length, 0)}
                        </Text>
                        <Text className="text-red-600 text-sm">Total Students</Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="px-6 mb-4">
                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        className="flex-1 bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
                        onPress={() => {/* TODO: Add batch creation functionality */ }}
                    >
                        <Icon name="add" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Add New Batch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-red-100 rounded-lg py-3 px-4 flex-row items-center justify-center"
                        onPress={fetchBatches}
                    >
                        <Icon name="refresh" size={20} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Batches List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Active Batches</Text>

                {batches.length === 0 ? (
                    <View className="bg-gray-50 rounded-lg p-8 items-center">
                        <Icon name="school" size={48} color="#9CA3AF" />
                        <Text className="text-gray-600 text-lg font-medium mt-4">No Batches Found</Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Create your first batch to start managing students
                        </Text>
                    </View>
                ) : (
                    batches.map((batch: any) => {
                        const totalStudents = batch.students.length;
                        const activeStudents = batch.students.filter((student: any) => student.user).length;
                        const activeRate = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : '0.0';

                        return (
                            <View key={batch.BatchId} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-xl font-bold text-gray-800">{batch.BatchName}</Text>
                                    <View className="bg-red-100 px-3 py-1 rounded-full">
                                        <Text className="text-red-600 text-sm font-medium">
                                            {batch.currentSemester}
                                            {batch.currentSemester === 1 ? 'st' :
                                                batch.currentSemester === 2 ? 'nd' :
                                                    batch.currentSemester === 3 ? 'rd' : 'th'} Semester
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-gray-600 mb-2">Course: {batch.course}</Text>
                                <Text className="text-gray-600 mb-3">
                                    Created: {new Date(batch.createdAt).toLocaleDateString()}
                                </Text>

                                <View className="flex-row justify-between mb-4">
                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-gray-800">{totalStudents}</Text>
                                        <Text className="text-xs text-gray-500">Total Students</Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-green-600">{activeStudents}</Text>
                                        <Text className="text-xs text-gray-500">Active Students</Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-blue-600">{activeRate}%</Text>
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
                                        <Text className="text-orange-600 text-sm">Update Semester</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}