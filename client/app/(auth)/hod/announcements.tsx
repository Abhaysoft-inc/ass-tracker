import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy announcements data
const announcementsData = [
    {
        id: 1,
        title: 'Mid-term Examination Schedule',
        content: 'The mid-term examinations for all batches will commence from October 20th, 2025. Please check the detailed schedule on the notice board.',
        target: 'All Students',
        date: '2025-10-01',
        priority: 'High',
        status: 'Active',
    },
    {
        id: 2,
        title: 'Faculty Meeting - October 2025',
        content: 'Monthly faculty meeting scheduled for October 5th, 2025 at 2:00 PM in the conference room. Attendance is mandatory.',
        target: 'Faculty',
        date: '2025-10-02',
        priority: 'Medium',
        status: 'Active',
    },
    {
        id: 3,
        title: 'Workshop on AI & Machine Learning',
        content: 'A workshop on AI & ML will be conducted for final year students. Registration is open and limited to 50 participants.',
        target: 'EE-2021',
        date: '2025-09-28',
        priority: 'Medium',
        status: 'Completed',
    },
];

export default function AnnouncementsManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('All');

    const targets = ['All', 'All Students', 'Faculty', 'EE-2021', 'EE-2022', 'EE-2023', 'EE-2024'];
    const priorities = ['High', 'Medium', 'Low'];

    const filteredAnnouncements = announcementsData.filter(announcement =>
        (announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedTarget === 'All' || announcement.target === selectedTarget)
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'Active' ? '#10B981' : '#6B7280';
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Search and Filter */}
            <View className="px-6 py-4">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        placeholder="Search announcements..."
                        className="flex-1 ml-3 text-gray-800"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Target Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {targets.map((target, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className={`px-4 py-2 rounded-full mr-3 ${selectedTarget === target ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                            onPress={() => setSelectedTarget(target)}
                        >
                            <Text className={selectedTarget === target ? 'text-white' : 'text-gray-700'}>
                                {target}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary Cards */}
            <View className="px-6 mb-4">
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{announcementsData.length}</Text>
                        <Text className="text-red-600 text-sm">Total</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {announcementsData.filter(a => a.status === 'Active').length}
                        </Text>
                        <Text className="text-red-600 text-sm">Active</Text>
                    </View>
                </View>
            </View>

            {/* Create Announcement Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Create Announcement</Text>
                </TouchableOpacity>
            </View>

            {/* Announcements List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Announcements ({filteredAnnouncements.length})</Text>

                {filteredAnnouncements.map((announcement) => {
                    const priorityColor = getPriorityColor(announcement.priority);
                    const statusColor = getStatusColor(announcement.status);

                    return (
                        <View key={announcement.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-lg font-semibold text-gray-800 flex-1">{announcement.title}</Text>
                                <View className="flex-row">
                                    <View className="px-2 py-1 rounded mr-2" style={{ backgroundColor: priorityColor + '20' }}>
                                        <Text className="text-xs font-medium" style={{ color: priorityColor }}>
                                            {announcement.priority}
                                        </Text>
                                    </View>
                                    <View className="px-2 py-1 rounded" style={{ backgroundColor: statusColor + '20' }}>
                                        <Text className="text-xs font-medium" style={{ color: statusColor }}>
                                            {announcement.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Text className="text-gray-600 text-sm mb-2">{announcement.content}</Text>

                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-500 text-xs">Target: {announcement.target}</Text>
                                <Text className="text-gray-500 text-xs">Date: {announcement.date}</Text>
                            </View>

                            <View className="flex-row justify-end space-x-2">
                                <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                    <Text className="text-blue-600 text-sm">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2">
                                    <Text className="text-green-600 text-sm">Send</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-orange-100 px-3 py-2 rounded-lg mr-2">
                                    <Text className="text-orange-600 text-sm">Schedule</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-lg">
                                    <Text className="text-red-600 text-sm">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}