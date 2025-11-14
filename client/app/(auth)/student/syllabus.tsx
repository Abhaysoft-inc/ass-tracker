import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { syllabusAPI, authAPI, SyllabusSubject } from '../../../services/api';

export default function StudentSyllabus() {
    const router = useRouter();
    const [syllabusData, setSyllabusData] = useState<{
        batch: any;
        subjects: SyllabusSubject[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());

    useEffect(() => {
        checkAuthAndLoadSyllabus();
    }, []);

    const checkAuthAndLoadSyllabus = async () => {
        try {
            const authStatus = await authAPI.checkAuthToken();
            if (!authStatus.hasToken) {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to view your syllabus.',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/student/login')
                        }
                    ]
                );
                return;
            }
            await loadSyllabus();
        } catch (error) {
            console.error('Error checking authentication:', error);
            setLoading(false);
        }
    };

    const loadSyllabus = async () => {
        try {
            setLoading(true);
            const data = await syllabusAPI.getStudentSyllabus();
            setSyllabusData(data);
        } catch (error) {
            console.error('Error loading syllabus:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load syllabus';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectId: number) => {
        const newExpanded = new Set(expandedSubjects);
        if (newExpanded.has(subjectId)) {
            newExpanded.delete(subjectId);
        } else {
            newExpanded.add(subjectId);
        }
        setExpandedSubjects(newExpanded);
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getUnitStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500';
            case 'IN_PROGRESS': return 'bg-yellow-500';
            default: return 'bg-gray-300';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="mt-4 text-gray-600">Loading syllabus...</Text>
            </View>
        );
    }

    if (!syllabusData) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-6">
                <Text className="text-gray-500 text-center">No syllabus data available</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-2 text-center">Syllabus</Text>

            {syllabusData.batch && (
                <View className="bg-blue-50 p-4 rounded-lg mb-6">
                    <Text className="text-lg font-semibold text-blue-800">{syllabusData.batch.BatchName}</Text>
                    <Text className="text-blue-600">Course: {syllabusData.batch.course}</Text>
                    <Text className="text-blue-600">Semester: {syllabusData.batch.currentSemester}</Text>
                </View>
            )}

            {syllabusData.subjects.map((subject) => (
                <View key={subject.id} className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <TouchableOpacity
                        className="p-4 bg-gray-50"
                        onPress={() => toggleSubject(subject.id)}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-xl font-semibold text-gray-800">{subject.name}</Text>
                                <Text className="text-sm text-gray-600">{subject.code}</Text>

                                {/* Faculty info */}
                                {subject.facultyBatchSubjects.length > 0 && (
                                    <Text className="text-sm text-gray-600 mt-1">
                                        Faculty: {subject.facultyBatchSubjects[0].faculty.name}
                                    </Text>
                                )}
                            </View>

                            <View className="items-center ml-4">
                                <View className="flex-row items-center mb-2">
                                    <View className={`w-3 h-3 rounded-full ${getProgressColor(subject.overallProgress)} mr-2`} />
                                    <Text className="text-sm font-medium">{subject.overallProgress}%</Text>
                                </View>
                                <Icon
                                    name={expandedSubjects.has(subject.id) ? "expand-less" : "expand-more"}
                                    size={24}
                                    color="#666"
                                />
                            </View>
                        </View>

                        {/* Progress bar */}
                        <View className="mt-3">
                            <View className="w-full bg-gray-200 rounded-full h-2">
                                <View
                                    className={`h-2 rounded-full ${getProgressColor(subject.overallProgress)}`}
                                    style={{ width: `${subject.overallProgress}%` }}
                                />
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                {subject.completedUnits}/{subject.totalUnits} units completed
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Expanded units */}
                    {expandedSubjects.has(subject.id) && (
                        <View className="border-t border-gray-200">
                            {subject.syllabusUnits.map((unit) => {
                                const unitProgress = unit.progress[0];
                                const completedTopics = unit.topics.filter(topic =>
                                    topic.progress.some(p => p.status === 'COMPLETED')
                                ).length;

                                return (
                                    <View key={unit.id} className="p-4 border-b border-gray-100 last:border-b-0">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="font-medium text-gray-800 flex-1">
                                                Unit {unit.unitNumber}: {unit.title}
                                            </Text>
                                            <View className={`w-3 h-3 rounded-full ${getUnitStatusColor(unitProgress?.status || 'NOT_STARTED')}`} />
                                        </View>

                                        {unit.description && (
                                            <Text className="text-sm text-gray-600 mb-2">{unit.description}</Text>
                                        )}

                                        {unitProgress && (
                                            <View className="mb-2">
                                                <Text className="text-xs text-gray-500">
                                                    Progress: {unitProgress.completionPercent}%
                                                    {unitProgress.notes && ` • ${unitProgress.notes}`}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Topics */}
                                        <View className="mt-2">
                                            <Text className="text-xs text-gray-500 mb-2">
                                                Topics: {completedTopics}/{unit.topics.length} completed
                                            </Text>
                                            {unit.topics.map((topic) => {
                                                const topicProgress = topic.progress[0];
                                                const isCompleted = topicProgress?.status === 'COMPLETED';

                                                return (
                                                    <View key={topic.id} className="flex-row items-center py-1">
                                                        <View className={`w-2 h-2 rounded-full mr-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                        <Text className={`text-sm flex-1 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                                                            {topic.topicNumber}. {topic.title}
                                                        </Text>
                                                        {topic.estimatedHours && (
                                                            <Text className="text-xs text-gray-500">
                                                                {topic.estimatedHours}h
                                                            </Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}