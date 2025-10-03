import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy reports data
const reportsData = [
    {
        id: 1,
        title: 'Monthly Attendance Report',
        description: 'Complete attendance analysis for all batches',
        type: 'Attendance',
        period: 'September 2025',
        generatedOn: '2025-10-01',
        status: 'Ready',
    },
    {
        id: 2,
        title: 'Academic Performance Report',
        description: 'Student performance analysis and statistics',
        type: 'Academic',
        period: 'Mid-term 2025',
        generatedOn: '2025-09-28',
        status: 'Ready',
    },
    {
        id: 3,
        title: 'Faculty Workload Report',
        description: 'Faculty teaching load and assignment distribution',
        type: 'Faculty',
        period: 'Current Semester',
        generatedOn: '2025-09-25',
        status: 'Ready',
    },
];

const quickReports = [
    { name: 'Daily Attendance', icon: 'today', description: 'Today\'s attendance summary' },
    { name: 'Weekly Summary', icon: 'date-range', description: 'Weekly performance overview' },
    { name: 'Assignment Status', icon: 'assignment', description: 'Current assignment submissions' },
    { name: 'Student List', icon: 'people', description: 'Complete student directory' },
    { name: 'Faculty Report', icon: 'school', description: 'Faculty information report' },
    { name: 'Batch Analysis', icon: 'group', description: 'Batch-wise statistics' },
];

export default function ReportsGeneration() {
    const [selectedType, setSelectedType] = useState('All');

    const reportTypes = ['All', 'Attendance', 'Academic', 'Faculty', 'Administrative'];

    const filteredReports = selectedType === 'All'
        ? reportsData
        : reportsData.filter(report => report.type === selectedType);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Attendance': return '#3B82F6';
            case 'Academic': return '#10B981';
            case 'Faculty': return '#F59E0B';
            case 'Administrative': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Quick Reports */}
            <View className="px-6 py-4">
                <Text className="text-lg font-semibold mb-4">Quick Reports</Text>
                <View className="flex-row flex-wrap justify-between">
                    {quickReports.map((report, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className="w-[48%] bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"
                        >
                            <View className="items-center">
                                <View className="bg-red-100 rounded-full p-3 mb-2">
                                    <Icon name={report.icon} size={24} color="#DC2626" />
                                </View>
                                <Text className="font-semibold text-gray-800 text-center mb-1">{report.name}</Text>
                                <Text className="text-xs text-gray-500 text-center">{report.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Report Type Filter */}
            <View className="px-6 py-4">
                <Text className="text-lg font-semibold mb-3">Report History</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {reportTypes.map((type, idx) => (
                        <TouchableOpacity
                            key={idx}
                            className={`px-4 py-2 rounded-full mr-3 ${selectedType === type ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text className={selectedType === type ? 'text-white' : 'text-gray-700'}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary Cards */}
            <View className="px-6 mb-4">
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-red-50 rounded-lg p-4 mr-2">
                        <Text className="text-2xl font-bold text-red-600">{reportsData.length}</Text>
                        <Text className="text-red-600 text-sm">Total Reports</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-lg p-4 ml-2">
                        <Text className="text-2xl font-bold text-red-600">
                            {reportsData.filter(r => r.status === 'Ready').length}
                        </Text>
                        <Text className="text-red-600 text-sm">Ready</Text>
                    </View>
                </View>
            </View>

            {/* Custom Report Button */}
            <View className="px-6 mb-4">
                <TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                    <Icon name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Generate Custom Report</Text>
                </TouchableOpacity>
            </View>

            {/* Reports List */}
            <View className="px-6">
                <Text className="text-lg font-semibold mb-4">Generated Reports ({filteredReports.length})</Text>

                {filteredReports.map((report) => {
                    const typeColor = getTypeColor(report.type);

                    return (
                        <View key={report.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-lg font-semibold text-gray-800 flex-1">{report.title}</Text>
                                <View className="px-2 py-1 rounded" style={{ backgroundColor: typeColor + '20' }}>
                                    <Text className="text-xs font-medium" style={{ color: typeColor }}>
                                        {report.type}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-600 text-sm mb-2">{report.description}</Text>

                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-500 text-xs">Period: {report.period}</Text>
                                <Text className="text-gray-500 text-xs">Generated: {report.generatedOn}</Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                    <Text className="text-green-600 text-sm font-medium">{report.status}</Text>
                                </View>

                                <View className="flex-row space-x-2">
                                    <TouchableOpacity className="bg-blue-100 px-3 py-2 rounded-lg mr-2">
                                        <Text className="text-blue-600 text-sm">View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2">
                                        <Text className="text-green-600 text-sm">Download</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-orange-100 px-3 py-2 rounded-lg">
                                        <Text className="text-orange-600 text-sm">Share</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}