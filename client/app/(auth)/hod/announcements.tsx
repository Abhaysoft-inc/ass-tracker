import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../../config/api';
import * as SecureStore from 'expo-secure-store';

interface Batch {
    BatchId: number;
    BatchName: string;
    course: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    department: string | null;
    batchId: number | null;
    createdAt: string;
    batch?: {
        BatchName: string;
        course: string;
    };
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);

    const fetchBatches = async () => {
        setLoadingBatches(true);
        try {
            const token = await SecureStore.getItemAsync('hodToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }

            const response = await fetch(`${BASE_URL}/hod/batches`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const text = await response.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.error('Non-JSON response when fetching batches:', text, parseErr);
                return;
            }

            if (response.ok && data && data.success) {
                setBatches(data.data || []);
            } else {
                console.error('Failed to fetch batches:', { status: response.status, body: data });
            }
        } catch (error) {
            console.log('Error fetching batches:', error);
        }
        setLoadingBatches(false);
    };

    const fetchAnnouncements = async () => {
        try {
            const token = await SecureStore.getItemAsync('hodToken');
            if (!token) return;

            const response = await fetch(`${BASE_URL}/hod/announcements`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data.announcements || []);
            }
        } catch (error) {
            console.log('Error fetching announcements:', error);
        }
    };

    const createAnnouncement = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
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

            const response = await fetch(`${BASE_URL}/hod/announcements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    batchId: selectedBatch && selectedBatch !== 'all' ? selectedBatch : null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Announcement created successfully!');
                setTitle('');
                setContent('');
                setSelectedBatch('');
                fetchAnnouncements(); // Refresh the list
            } else {
                Alert.alert('Error', data.error || 'Failed to create announcement');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
            console.log('Create announcement error:', error);
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        fetchBatches();
        fetchAnnouncements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>


            {/* Create Announcement Form */}
            <View className="px-6 py-6">
                <Text className="text-xl font-semibold mb-4">Create New Announcement</Text>

                {/* Title Input */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Title *</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter announcement title"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                        maxLength={100}
                    />
                </View>

                {/* Content Input */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Content *</Text>
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Enter announcement content"
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                        textAlignVertical="top"
                        maxLength={500}
                    />
                </View>

                {/* Batch Selection */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Target Batch</Text>
                    <View className="border border-gray-300 rounded-lg">
                        {loadingBatches ? (
                            <View className="p-4">
                                <ActivityIndicator color="#DC2626" />
                            </View>
                        ) : (
                            <Picker
                                selectedValue={selectedBatch}
                                onValueChange={(itemValue) => setSelectedBatch(itemValue)}
                                style={{ height: 50 }}
                            >
                                <Picker.Item label="All Batches" value="all" />
                                {batches.map((batch) => (
                                    <Picker.Item
                                        key={batch.BatchId}
                                        label={`${batch.BatchName} (${batch.course})`}
                                        value={batch.BatchId.toString()}
                                    />
                                ))}
                            </Picker>
                        )}
                    </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    onPress={createAnnouncement}
                    disabled={loading}
                    className={`py-3 rounded-lg flex-row justify-center items-center ${loading ? 'bg-gray-400' : 'bg-red-600'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Icon name="campaign" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Create Announcement</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Recent Announcements */}
            <View className="px-6 pb-6">
                <Text className="text-xl font-semibold mb-4">Recent Announcements</Text>

                {announcements.length === 0 ? (
                    <View className="bg-gray-50 rounded-lg p-6 items-center">
                        <Icon name="announcement" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">No announcements yet</Text>
                    </View>
                ) : (
                    announcements.map((announcement) => (
                        <View key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
                            <View className="flex-row items-start justify-between mb-2">
                                <Text className="font-semibold text-gray-800 flex-1" numberOfLines={1}>
                                    {announcement.title}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {formatDate(announcement.createdAt)}
                                </Text>
                            </View>

                            <Text className="text-gray-600 mb-3" numberOfLines={3}>
                                {announcement.content}
                            </Text>

                            <View className="flex-row items-center">
                                <View className="bg-red-100 px-2 py-1 rounded">
                                    <Text className="text-red-600 text-xs font-medium">
                                        {announcement.batch ? `${announcement.batch.BatchName}` : 'All Batches'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}