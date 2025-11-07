import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

export default function AddStudent() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [course, setCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${BASE_URL}/hod/public/batches`);
            const text = await res.text();
            let data: any = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.warn('Non-JSON response when fetching batches:', text, parseErr);
                return;
            }

            if (res.ok && data && data.success) {
                setBatches(data.data);
            } else {
                console.warn('Failed to fetch batches', { status: res.status, body: data });
            }
        } catch (error) {
            console.error('Error fetching batches', error);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleAddStudent = async () => {
        if (!name || !email || !password || !rollNumber || !course) {
            Alert.alert('Validation', 'Please fill all required fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters');
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

            const res = await fetch(`${BASE_URL}/hod/add-student`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password,
                    rollNumber: rollNumber.trim(),
                    phone: phone.trim(),
                    course: course.trim(),
                    batchId: selectedBatch ? selectedBatch : null
                })
            });

            const text = await res.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.error('Non-JSON response when adding student:', text, parseErr);
                Alert.alert('Error', 'Server returned an unexpected response');
                return;
            }

            if (res.ok && data && data.success) {
                Alert.alert('Success', 'Student added successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                console.error('Failed to add student:', { status: res.status, body: data });
                Alert.alert('Error', data?.message || 'Failed to add student');
            }
        } catch (error) {
            console.error('Add student error', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-6">
                <Text className="text-2xl font-semibold mb-2">Add New Student</Text>
                <Text className="text-gray-600 mb-4">Create a new student account and assign to a batch.</Text>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Full name *</Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Full name" className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Email *</Text>
                    <TextInput value={email} onChangeText={setEmail} placeholder="email@domain" autoCapitalize="none" keyboardType="email-address" className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Password *</Text>
                    <TextInput value={password} onChangeText={setPassword} placeholder="password" secureTextEntry className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Roll Number *</Text>
                    <TextInput value={rollNumber} onChangeText={setRollNumber} placeholder="Roll number" className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Phone</Text>
                    <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-3">
                    <Text className="text-gray-700 mb-1">Course *</Text>
                    <TextInput value={course} onChangeText={setCourse} placeholder="B.Tech" className="border border-gray-300 rounded-lg px-3 py-2" />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Batch</Text>
                    <View className="border border-gray-300 rounded-lg bg-white">
                        <Picker selectedValue={selectedBatch} onValueChange={(v) => setSelectedBatch(v)}>
                            <Picker.Item label="Select batch (optional)" value="" />
                            {batches.map((b) => (
                                <Picker.Item key={b.BatchId} label={`${b.BatchName} - ${b.course} (Sem ${b.currentSemester})`} value={b.BatchId.toString()} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity className="bg-red-600 py-3 rounded-lg items-center" onPress={handleAddStudent} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Create Student</Text>}
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}
