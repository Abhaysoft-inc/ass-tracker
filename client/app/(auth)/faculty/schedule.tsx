import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

type TimetableSlot = {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    batch: {
        BatchId: number;
        BatchName: string;
        course: string;
    };
};

export default function FacultySchedule() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<TimetableSlot[]>([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const getToken = async () => await SecureStore.getItemAsync('facultyToken');

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            console.log('Fetching faculty schedule with token:', token ? 'Token exists' : 'No token');

            const res = await fetch(`${BASE_URL}/faculty/timetable/my-schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            console.log('Schedule response:', JSON.stringify(data, null, 2));

            if (data.success) {
                setSchedule(data.data || []);
                console.log('Total slots in schedule:', data.data?.length || 0);
            } else {
                console.warn('API returned error:', data.message);
                Alert.alert('Error', data.message || 'Failed to fetch schedule');
            }
        } catch (error) {
            console.error('fetchSchedule error:', error);
            Alert.alert('Error', 'Failed to fetch schedule. Check console for details.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const groupedByDay = () => {
        const grouped: { [key: number]: TimetableSlot[] } = {};
        for (let i = 1; i <= 7; i++) {
            grouped[i] = [];
        }
        schedule.forEach(slot => {
            if (slot.dayOfWeek) {
                grouped[slot.dayOfWeek].push(slot);
            }
        });
        return grouped;
    };

    const daySlots = groupedByDay();

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-5 bg-green-600 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold">My Class Schedule</Text>
                    <Text className="text-green-100 text-sm">Weekly timetable</Text>
                </View>
                <TouchableOpacity
                    onPress={fetchSchedule}
                    className="bg-green-700 px-3 py-2 rounded-lg"
                >
                    <Icon name="refresh" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text className="text-gray-500 mt-4">Loading schedule...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 py-4">
                    {/* Summary */}
                    <View className="bg-green-50 rounded-lg p-4 mb-4">
                        <Text className="text-lg font-bold text-green-800 mb-2">Schedule Summary</Text>
                        <Text className="text-gray-700">Total Classes: {schedule.length}</Text>
                        <Text className="text-gray-700">
                            Active Days: {Object.values(daySlots).filter(slots => slots.length > 0).length}
                        </Text>
                    </View>

                    {/* Weekly Schedule */}
                    {days.map((day, idx) => (
                        <View key={idx} className="mb-6">
                            <View className="flex-row items-center mb-3">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="font-bold text-green-600 text-lg px-3">{day}</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>

                            {daySlots[idx + 1]?.length > 0 ? (
                                daySlots[idx + 1].map((slot, i) => (
                                    <View
                                        key={slot.id}
                                        className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm"
                                    >
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-lg font-semibold text-gray-800 flex-1">
                                                {slot.subject.name}
                                            </Text>
                                            <View className="bg-green-100 px-2 py-1 rounded">
                                                <Text className="text-green-700 text-xs font-medium">
                                                    {slot.subject.code}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center mb-2">
                                            <Icon name="access-time" size={16} color="#6B7280" />
                                            <Text className="text-gray-600 ml-2">
                                                {slot.startTime} - {slot.endTime}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center mb-2">
                                            <Icon name="group" size={16} color="#6B7280" />
                                            <Text className="text-gray-600 ml-2">
                                                {slot.batch.BatchName} ({slot.batch.course})
                                            </Text>
                                        </View>

                                        {slot.roomNumber && (
                                            <View className="flex-row items-center">
                                                <Icon name="room" size={16} color="#6B7280" />
                                                <Text className="text-gray-600 ml-2">
                                                    Room: {slot.roomNumber}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View className="bg-gray-50 rounded-lg p-4 items-center">
                                    <Icon name="event-busy" size={32} color="#9CA3AF" />
                                    <Text className="text-gray-500 mt-2">No classes scheduled</Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {schedule.length === 0 && (
                        <View className="items-center justify-center py-12">
                            <Icon name="calendar-today" size={64} color="#D1D5DB" />
                            <Text className="text-gray-500 mt-4 text-lg">No schedule found</Text>
                            <Text className="text-gray-400 text-sm mt-2">
                                Your timetable will appear here once assigned
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
