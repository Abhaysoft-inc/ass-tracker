import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

export default function AddBatch() {
    const router = useRouter();
    const [batchName, setBatchName] = useState('');
    const [course, setCourse] = useState('');
    const [currentSemester, setCurrentSemester] = useState('1');
    const [loading, setLoading] = useState(false);

    const handleCreateBatch = async () => {
        if (!batchName || !course) {
            Alert.alert('Validation', 'Please fill all required fields');
            return;
        }

        const semester = parseInt(currentSemester);
        if (isNaN(semester) || semester < 1 || semester > 8) {
            Alert.alert('Validation', 'Semester must be between 1 and 8');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('hodToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }

            const response = await fetch(`${BASE_URL}/hod/create-batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    BatchName: batchName.trim(),
                    course: course.trim(),
                    currentSemester: semester
                })
            });

            const text = await response.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.error('Non-JSON response when creating batch:', text, parseErr);
                Alert.alert('Error', 'Server returned an unexpected response');
                return;
            }

            if (response.ok && data && data.success) {
                Alert.alert('Success', 'Batch created successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                console.error('Failed to create batch:', { status: response.status, body: data });
                Alert.alert('Error', data?.message || 'Failed to create batch');
            }
        } catch (error) {
            console.error('Create batch error', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-6">
                <Text className="text-2xl font-semibold mb-2">Create New Batch</Text>
                <Text className="text-gray-600 mb-6">Add a new batch to the system</Text>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Batch Name *</Text>
                    <TextInput
                        value={batchName}
                        onChangeText={setBatchName}
                        placeholder="e.g., EE-2024"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Course *</Text>
                    <TextInput
                        value={course}
                        onChangeText={setCourse}
                        placeholder="e.g., B.Tech Electrical Engineering"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Current Semester *</Text>
                    <TextInput
                        value={currentSemester}
                        onChangeText={setCurrentSemester}
                        placeholder="1-8"
                        keyboardType="number-pad"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                    <Text className="text-gray-500 text-sm mt-1">Enter a number between 1 and 8</Text>
                </View>

                <TouchableOpacity
                    className="bg-red-600 py-3 rounded-lg items-center"
                    onPress={handleCreateBatch}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Create Batch</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
