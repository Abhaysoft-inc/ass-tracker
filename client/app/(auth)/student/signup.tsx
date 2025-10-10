import { View, Text, TextInput, StyleSheet, Image, ScrollView, Pressable, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../../config/api';

export default function StudentSignupScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [course, setCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [secure, setSecure] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);
    const [batches, setBatches] = useState<any[]>([]);    // Fetch batches from API
    const fetchBatches = async () => {
        try {
            const response = await fetch(`${BASE_URL}/hod/batches`);
            const data = await response.json();
            if (data.success) {
                setBatches(data.data);
            } else {
                Alert.alert('Error', 'Failed to load batches');
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            Alert.alert('Error', 'Network error while loading batches');
        }
    };

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword || !rollNumber || !course) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (!selectedBatch || selectedBatch === '') {
            Alert.alert("Error", "Please select a batch");
            return;
        } setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/auth/student/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password,
                    rollNumber: rollNumber.trim(),
                    phone: phone.trim(),
                    course: course.trim(),
                    batchId: selectedBatch
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    "Success",
                    "Registration successful! Your account is pending verification by HOD.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.push("/student/login")
                        }
                    ]
                );
            } else {
                Alert.alert("Error", data.message || "Registration failed");
            }
        } catch (error) {
            console.log("Signup error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch batches when component mounts
    useEffect(() => {
        fetchBatches();
    }, []); return (
        <ScrollView className="flex-1 bg-white">
            <View className='flex-1 items-center'>
                <Image source={require("../../../assets/images/knit-logo.png")} className='mt-16 object-cover' />
                <Text className='text-3xl font-semibold pt-8'>Student Registration</Text>
                <Text className='text-gray-600 text-center px-6 pt-2'>
                    Create your account to access the attendance system
                </Text>

                <View className='pt-8 w-full px-6'>
                    {/* Name Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Full Name *</Text>
                        <TextInput
                            placeholder='Enter your full name'
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Email *</Text>
                        <TextInput
                            placeholder='student@knit.ac.in'
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Roll Number Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Roll Number *</Text>
                        <TextInput
                            placeholder='24305'
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
                            value={rollNumber}
                            onChangeText={setRollNumber}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* Phone Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
                        <TextInput
                            placeholder='9876543210'
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Course Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Course *</Text>
                        <TextInput
                            placeholder='B.Tech'
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
                            value={course}
                            onChangeText={setCourse}
                        />
                    </View>

                    {/* Batch Selection */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Batch *</Text>
                        <View className="border border-gray-300 rounded-lg bg-white">
                            <Picker
                                selectedValue={selectedBatch}
                                onValueChange={(itemValue) => setSelectedBatch(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select your batch" value="" />
                                {batches.map((batch) => (
                                    <Picker.Item
                                        key={batch.BatchId}
                                        label={`${batch.BatchName} - ${batch.course} (Sem ${batch.currentSemester})`}
                                        value={batch.BatchId.toString()}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Password Input */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">Password *</Text>
                        <View style={styles.container} className='border border-gray-300 rounded-lg bg-white'>
                            <TextInput
                                placeholder="Enter password (min 6 characters)"
                                secureTextEntry={secure}
                                style={styles.input}
                                className='text-base text-black'
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setSecure(!secure)}>
                                <Ionicons
                                    name={secure ? "eye-off" : "eye"}
                                    size={20}
                                    color="#1e40af"
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-medium mb-2">Confirm Password *</Text>
                        <View style={styles.container} className='border border-gray-300 rounded-lg bg-white'>
                            <TextInput
                                placeholder="Confirm your password"
                                secureTextEntry={secureConfirm}
                                style={styles.input}
                                className='text-base text-black'
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <Pressable onPress={() => setSecureConfirm(!secureConfirm)}>
                                <Ionicons
                                    name={secureConfirm ? "eye-off" : "eye"}
                                    size={20}
                                    color="#1e40af"
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Signup Button */}
                    <Pressable
                        style={[styles.button, { backgroundColor: loading ? '#93c5fd' : '#1e40af' }]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.text}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </Text>
                    </Pressable>

                    {/* Login Link */}
                    <View className="flex-row justify-center items-center mt-6 mb-8">
                        <Text className="text-gray-600">Already have an account? </Text>
                        <Pressable onPress={() => router.push("/student/login")}>
                            <Text className="text-blue-600 font-semibold">Login here</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 4,
    },
    text: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    picker: {
        height: 50,
        color: '#000000',
    },
});