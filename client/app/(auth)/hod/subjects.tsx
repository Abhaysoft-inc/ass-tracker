import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

type Subject = {
    SubjectID: number;
    SubjectName: string;
    SubjectCode: string;
    department: string;
    semester: number;
    credits: number;
    totalSessions?: number;
    assignments?: any[];
};

export default function SubjectsManagement() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // Form state
    const [subjectForm, setSubjectForm] = useState({
        name: '',
        code: '',
        department: '',
        semester: '',
        credits: '3'
    });

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const departments = ['Electrical'];

    const getToken = async () => await SecureStore.getItemAsync('hodToken');

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            let url = `${BASE_URL}/hod/subjects?`;
            if (selectedDepartment) url += `department=${selectedDepartment}&`;
            if (selectedSemester) url += `semester=${selectedSemester}&`;
            if (searchQuery) url += `search=${searchQuery}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSubjects(data.data || []);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch subjects');
            }
        } catch (e) {
            console.warn('fetchSubjects error:', e);
            Alert.alert('Error', 'Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    }, [selectedDepartment, selectedSemester, searchQuery]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const resetForm = () => {
        setSubjectForm({
            name: '',
            code: '',
            department: '',
            semester: '',
            credits: '3'
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setSubjectForm({
            name: subject.SubjectName,
            code: subject.SubjectCode,
            department: subject.department,
            semester: String(subject.semester),
            credits: String(subject.credits)
        });
        setShowEditModal(true);
    };

    const createSubject = async () => {
        if (!subjectForm.name || !subjectForm.code || !subjectForm.department || !subjectForm.semester) {
            return Alert.alert('Validation', 'Please fill all required fields');
        }

        try {
            const token = await getToken();
            const payload = {
                name: subjectForm.name,
                code: subjectForm.code,
                department: subjectForm.department,
                semester: parseInt(subjectForm.semester),
                credits: parseInt(subjectForm.credits)
            };

            const res = await fetch(`${BASE_URL}/hod/subjects`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                resetForm();
                fetchSubjects();
                Alert.alert('Success', 'Subject created successfully');
            } else {
                Alert.alert('Error', data.message || 'Failed to create subject');
            }
        } catch (e) {
            console.warn('createSubject error:', e);
            Alert.alert('Error', 'Failed to create subject');
        }
    };

    const updateSubject = async () => {
        if (!editingSubject) return;
        if (!subjectForm.name || !subjectForm.code || !subjectForm.department || !subjectForm.semester) {
            return Alert.alert('Validation', 'Please fill all required fields');
        }

        try {
            const token = await getToken();
            const payload = {
                name: subjectForm.name,
                code: subjectForm.code,
                department: subjectForm.department,
                semester: parseInt(subjectForm.semester),
                credits: parseInt(subjectForm.credits)
            };

            const res = await fetch(`${BASE_URL}/hod/subject/${editingSubject.SubjectID}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setShowEditModal(false);
                setEditingSubject(null);
                resetForm();
                fetchSubjects();
                Alert.alert('Success', 'Subject updated successfully');
            } else {
                Alert.alert('Error', data.message || 'Failed to update subject');
            }
        } catch (e) {
            console.warn('updateSubject error:', e);
            Alert.alert('Error', 'Failed to update subject');
        }
    };

    const deleteSubject = async (subjectId: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this subject? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();
                            const res = await fetch(`${BASE_URL}/hod/subject/${subjectId}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            const data = await res.json();
                            if (data.success) {
                                fetchSubjects();
                                Alert.alert('Success', 'Subject deleted successfully');
                            } else {
                                Alert.alert('Error', data.message || 'Failed to delete subject');
                            }
                        } catch (e) {
                            console.warn('deleteSubject error:', e);
                            Alert.alert('Error', 'Failed to delete subject');
                        }
                    }
                }
            ]
        );
    };

    const filteredSubjects = subjects;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);

    return (
        <View className="flex-1 bg-white">


            <ScrollView className="flex-1">
                {/* Search and Filter */}
                <View className="px-6 py-4">
                    <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
                        <Icon name="search" size={20} color="#666" />
                        <TextInput
                            placeholder="Search subjects..."
                            className="flex-1 ml-3 text-gray-800"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Department Filter */}
                    <Text className="font-semibold mb-2">Department</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        <TouchableOpacity
                            className={`px-4 py-2 rounded-full mr-3 ${selectedDepartment === null ? 'bg-blue-600' : 'bg-gray-200'}`}
                            onPress={() => setSelectedDepartment(null)}
                        >
                            <Text className={selectedDepartment === null ? 'text-white' : 'text-gray-700'}>All</Text>
                        </TouchableOpacity>
                        {departments.map((dept, idx) => (
                            <TouchableOpacity
                                key={idx}
                                className={`px-4 py-2 rounded-full mr-3 ${selectedDepartment === dept ? 'bg-blue-600' : 'bg-gray-200'}`}
                                onPress={() => setSelectedDepartment(dept)}
                            >
                                <Text className={selectedDepartment === dept ? 'text-white' : 'text-gray-700'}>{dept}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Semester Filter */}
                    <Text className="font-semibold mb-2">Semester</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        <TouchableOpacity
                            className={`px-4 py-2 rounded-full mr-3 ${selectedSemester === null ? 'bg-blue-600' : 'bg-gray-200'}`}
                            onPress={() => setSelectedSemester(null)}
                        >
                            <Text className={selectedSemester === null ? 'text-white' : 'text-gray-700'}>All</Text>
                        </TouchableOpacity>
                        {semesters.map((sem) => (
                            <TouchableOpacity
                                key={sem}
                                className={`px-4 py-2 rounded-full mr-3 ${selectedSemester === sem ? 'bg-blue-600' : 'bg-gray-200'}`}
                                onPress={() => setSelectedSemester(sem)}
                            >
                                <Text className={selectedSemester === sem ? 'text-white' : 'text-gray-700'}>Sem {sem}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Summary Cards */}
                <View className="px-6 mb-4">
                    <View className="flex-row justify-between">
                        <View className="flex-1 bg-blue-50 rounded-lg p-4 mr-2">
                            <Text className="text-2xl font-bold text-blue-600">{subjects.length}</Text>
                            <Text className="text-blue-600 text-sm">Total Subjects</Text>
                        </View>
                        <View className="flex-1 bg-blue-50 rounded-lg p-4 ml-2">
                            <Text className="text-2xl font-bold text-blue-600">{totalCredits}</Text>
                            <Text className="text-blue-600 text-sm">Total Credits</Text>
                        </View>
                    </View>
                </View>

                {/* Add Subject Button */}
                <View className="px-6 mb-4">
                    <TouchableOpacity onPress={openAddModal} className="bg-blue-600 rounded-lg py-3 px-4 flex-row items-center justify-center">
                        <Icon name="add" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">Add New Subject</Text>
                    </TouchableOpacity>
                </View>

                {/* Subjects List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" className="mt-8" />
                ) : (
                    <View className="px-6">
                        <Text className="text-lg font-semibold mb-4">Subjects List ({filteredSubjects.length})</Text>

                        {filteredSubjects.map((subject) => (
                            <View key={subject.SubjectID} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-lg font-semibold text-gray-800 flex-1">{subject.SubjectName}</Text>
                                </View>

                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600">Code: {subject.SubjectCode}</Text>
                                    <Text className="text-sm text-gray-600">Credits: {subject.credits}</Text>
                                </View>

                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-sm text-gray-600">Semester: {subject.semester}</Text>
                                    <Text className="text-sm text-gray-600">Dept: {subject.department}</Text>
                                </View>

                                {subject.totalSessions !== undefined && (
                                    <Text className="text-xs text-gray-500 mb-3">Total Sessions: {subject.totalSessions}</Text>
                                )}

                                <View className="flex-row justify-end">
                                    <TouchableOpacity
                                        onPress={() => openEditModal(subject)}
                                        className="bg-blue-100 px-3 py-2 rounded-lg mr-2"
                                    >
                                        <Text className="text-blue-600 text-sm">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => deleteSubject(subject.SubjectID)}
                                        className="bg-red-100 px-3 py-2 rounded-lg"
                                    >
                                        <Text className="text-red-600 text-sm">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {filteredSubjects.length === 0 && (
                            <Text className="text-center text-gray-500 mt-8">No subjects found</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Add Subject Modal */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <ScrollView className="bg-white rounded-t-3xl p-4">
                        <Text className="text-lg font-bold mb-3">Add New Subject</Text>

                        <TextInput
                            placeholder="Subject Name"
                            value={subjectForm.name}
                            onChangeText={t => setSubjectForm(f => ({ ...f, name: t }))}
                            className="border p-2 rounded mb-2"
                        />

                        <TextInput
                            placeholder="Subject Code (e.g., CS301)"
                            value={subjectForm.code}
                            onChangeText={t => setSubjectForm(f => ({ ...f, code: t }))}
                            className="border p-2 rounded mb-2"
                        />

                        <Text className="text-sm font-semibold mt-2">Department</Text>
                        <ScrollView horizontal className="mb-2">
                            {departments.map((dept, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSubjectForm(f => ({ ...f, department: dept }))}
                                    className={`mr-2 px-3 py-2 rounded ${subjectForm.department === dept ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <Text className={subjectForm.department === dept ? 'text-white' : 'text-gray-800'}>{dept}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-sm font-semibold mt-2">Semester</Text>
                        <ScrollView horizontal className="mb-2">
                            {semesters.map((sem) => (
                                <TouchableOpacity
                                    key={sem}
                                    onPress={() => setSubjectForm(f => ({ ...f, semester: String(sem) }))}
                                    className={`mr-2 px-3 py-2 rounded ${subjectForm.semester === String(sem) ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <Text className={subjectForm.semester === String(sem) ? 'text-white' : 'text-gray-800'}>{sem}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TextInput
                            placeholder="Credits (default: 3)"
                            value={subjectForm.credits}
                            onChangeText={t => setSubjectForm(f => ({ ...f, credits: t }))}
                            keyboardType="numeric"
                            className="border p-2 rounded mb-2"
                        />

                        <View className="flex-row justify-end mt-4">
                            <TouchableOpacity onPress={() => setShowAddModal(false)} className="px-3 py-2 mr-2 bg-gray-300 rounded">
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={createSubject} className="px-3 py-2 bg-blue-600 rounded">
                                <Text className="text-white">Create</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Edit Subject Modal */}
            <Modal visible={showEditModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <ScrollView className="bg-white rounded-t-3xl p-4">
                        <Text className="text-lg font-bold mb-3">Edit Subject</Text>

                        <TextInput
                            placeholder="Subject Name"
                            value={subjectForm.name}
                            onChangeText={t => setSubjectForm(f => ({ ...f, name: t }))}
                            className="border p-2 rounded mb-2"
                        />

                        <TextInput
                            placeholder="Subject Code (e.g., CS301)"
                            value={subjectForm.code}
                            onChangeText={t => setSubjectForm(f => ({ ...f, code: t }))}
                            className="border p-2 rounded mb-2"
                        />

                        <Text className="text-sm font-semibold mt-2">Department</Text>
                        <ScrollView horizontal className="mb-2">
                            {departments.map((dept, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSubjectForm(f => ({ ...f, department: dept }))}
                                    className={`mr-2 px-3 py-2 rounded ${subjectForm.department === dept ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <Text className={subjectForm.department === dept ? 'text-white' : 'text-gray-800'}>{dept}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-sm font-semibold mt-2">Semester</Text>
                        <ScrollView horizontal className="mb-2">
                            {semesters.map((sem) => (
                                <TouchableOpacity
                                    key={sem}
                                    onPress={() => setSubjectForm(f => ({ ...f, semester: String(sem) }))}
                                    className={`mr-2 px-3 py-2 rounded ${subjectForm.semester === String(sem) ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <Text className={subjectForm.semester === String(sem) ? 'text-white' : 'text-gray-800'}>{sem}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TextInput
                            placeholder="Credits (default: 3)"
                            value={subjectForm.credits}
                            onChangeText={t => setSubjectForm(f => ({ ...f, credits: t }))}
                            keyboardType="numeric"
                            className="border p-2 rounded mb-2"
                        />

                        <View className="flex-row justify-end mt-4">
                            <TouchableOpacity onPress={() => { setShowEditModal(false); setEditingSubject(null); }} className="px-3 py-2 mr-2 bg-gray-300 rounded">
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={updateSubject} className="px-3 py-2 bg-blue-600 rounded">
                                <Text className="text-white">Update</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}