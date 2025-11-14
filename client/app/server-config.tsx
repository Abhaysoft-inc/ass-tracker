import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { getServerUrl, setServerUrl, validateServerUrl, testServerConnection } from '../config/serverConfig';

export default function ServerConfig() {
    const router = useRouter();
    const [serverUrl, setServerUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    const checkExistingConfig = useCallback(async () => {
        try {
            const savedUrl = await SecureStore.getItemAsync('serverUrl');
            if (savedUrl) {
                // Test existing configuration
                const connectionTest = await testServerConnection(savedUrl);
                if (connectionTest.success) {
                    // Server URL works, go to main screen
                    router.replace('/');
                    return;
                } else {
                    // Show current URL but allow reconfiguration
                    setServerUrl(savedUrl);
                }
            }
            // If no saved URL, stay on config screen to allow user to set one
        } catch (error) {
            console.error('Error checking config:', error);
        } finally {
            setChecking(false);
        }
    }, [router]);

    useEffect(() => {
        checkExistingConfig();
    }, [checkExistingConfig]);

    const handleSave = async () => {
        if (!serverUrl.trim()) {
            Alert.alert('Error', 'Please enter a server URL');
            return;
        }

        const trimmedUrl = serverUrl.trim();

        if (!validateServerUrl(trimmedUrl)) {
            Alert.alert(
                'Invalid URL',
                'Please enter a valid URL in format: IP:PORT or domain:PORT\nExample: 192.168.1.100:3000'
            );
            return;
        }

        setLoading(true);

        // Test connection
        const connectionResult = await testServerConnection(trimmedUrl);

        if (!connectionResult.success) {
            Alert.alert(
                'Connection Failed',
                `Unable to connect to the server.\nError: ${connectionResult.error}\n\nPlease check the URL and try again.`,
                [
                    {
                        text: 'Try Anyway',
                        onPress: async () => {
                            await saveAndProceed(trimmedUrl);
                        },
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ]
            );
            setLoading(false);
            return;
        }

        await saveAndProceed(trimmedUrl);
    };

    const saveAndProceed = async (url: string) => {
        try {
            await setServerUrl(url);
            Alert.alert(
                'Success',
                'Server configuration saved successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/'),
                    },
                ]
            );
        } catch (error) {
            console.error('Error saving config:', error);
            Alert.alert('Error', 'Failed to save server configuration');
        } finally {
            setLoading(false);
        }
    };

    const fillExample = () => {
        setServerUrl('172.20.47.62:3000');
    };

    if (checking) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Checking configuration...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-blue-600">
            <View className="flex-1 justify-center px-6">
                {/* Header */}
                <View className="items-center mb-12">
                    <View className="bg-white p-6 rounded-full mb-6 shadow-lg">
                        <Icon name="settings-ethernet" size={64} color="#3b82f6" />
                    </View>
                    <Text className="text-white text-3xl font-bold text-center">
                        Server Configuration
                    </Text>
                    <Text className="text-blue-100 text-center mt-2 text-base">
                        Enter your server details to get started
                    </Text>
                </View>

                {/* Configuration Card */}
                <View className="bg-white rounded-2xl p-6 shadow-2xl">
                    <Text className="text-gray-700 font-semibold mb-2 text-base">
                        Server URL
                    </Text>
                    <Text className="text-gray-500 text-sm mb-4">
                        Enter the backend server address with port
                    </Text>

                    <TextInput
                        placeholder="http://192.168.1.100:3000"
                        value={serverUrl}
                        onChangeText={setServerUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 mb-4 text-base"
                    />

                    <TouchableOpacity
                        onPress={fillExample}
                        className="mb-4"
                    >
                        <Text className="text-blue-600 text-sm text-center">
                            Use example URL
                        </Text>
                    </TouchableOpacity>

                    {/* Info Box */}
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <View className="flex-row items-start">
                            <Icon name="info" size={20} color="#3b82f6" style={{ marginRight: 8, marginTop: 2 }} />
                            <View className="flex-1">
                                <Text className="text-blue-800 font-semibold mb-1">
                                    How to find your server URL?
                                </Text>
                                <Text className="text-blue-700 text-sm">
                                    • Get the IP address from your server{'\n'}
                                    • Default port is usually 3000{'\n'}
                                    • Format: http://IP_ADDRESS:PORT{'\n'}
                                    • Example: http://192.168.1.100:3000
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className={`rounded-lg py-4 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        {loading ? (
                            <View className="flex-row justify-center items-center">
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white font-semibold text-base ml-2">
                                    Connecting...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-semibold text-base">
                                Save & Continue
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="items-center mt-8">
                    <Text className="text-blue-100 text-sm">
                        © 2025 Team Phool 🌼 • All rights reserved
                    </Text>
                </View>
            </View>
        </View>
    );
}
