import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

export default function AddFaculty() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddFaculty = async () => {
        if (!name || !email || !password || !phone || !department) {
            Alert.alert('Validation', 'Please fill all required fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Validation', 'Please enter a valid email address');
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

            const response = await fetch(`${BASE_URL}/hod/faculty`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password,
                    phone: phone.trim(),
                    department: department.trim()
                })
            });

            const text = await response.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.error('Non-JSON response when adding faculty:', text, parseErr);
                Alert.alert('Error', 'Server returned an unexpected response');
                return;
            }

            if (response.ok && data && data.success) {
                Alert.alert('Success', 'Faculty member added successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                console.error('Failed to add faculty:', { status: response.status, body: data });
                Alert.alert('Error', data?.message || 'Failed to add faculty');
            }
        } catch (error) {
            console.error('Add faculty error', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-6">
                <Text className="text-2xl font-semibold mb-2">Add New Faculty</Text>
                <Text className="text-gray-600 mb-6">Create a new faculty member account</Text>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Full Name *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Dr. John Doe"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Email *</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="faculty@knit.ac.in"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Password *</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 6 characters"
                        secureTextEntry
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Phone *</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Department *</Text>
                    <TextInput
                        value={department}
                        onChangeText={setDepartment}
                        placeholder="e.g., Electrical Engineering"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                <TouchableOpacity
                    className="bg-red-600 py-3 rounded-lg items-center"
                    onPress={handleAddFaculty}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Add Faculty</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
