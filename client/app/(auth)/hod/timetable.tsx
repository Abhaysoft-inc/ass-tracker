import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

type TimetableVersion = {
    id: number;
    name: string;
    academicYear?: string;
    semester?: number;
    validFrom?: string;
    validTo?: string;
};

type Batch = { BatchId: number; BatchName: string };
type Subject = { SubjectID: number; SubjectName: string };
type Faculty = { id: number; name: string; email?: string };

type TimetableSlot = {
    id?: number;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    subjectId?: number;
    batchId?: number;
    facultyId?: number;
    roomNumber?: string | null;
    sessionType?: string;
    subject?: Subject;
    batch?: Batch;
    faculty?: Faculty;
};

export default function TimetableManagement() {
    const [versions, setVersions] = useState<TimetableVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<TimetableVersion | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

    const [versionForm, setVersionForm] = useState({ name: '', academicYear: '', semester: '', validFrom: '', validTo: '' });
    const [slotForm, setSlotForm] = useState({ dayOfWeek: '1', startTime: '', endTime: '', subjectId: '', batchId: '', facultyId: '', roomNumber: '', sessionType: 'LECTURE' });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const getToken = async () => await SecureStore.getItemAsync('hodToken');

    const fetchVersions = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/hod/timetable/versions`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setVersions(data.data || []);
                if (!selectedVersion && data.data?.length) setSelectedVersion(data.data[0]);
            }
        } catch (e) {
            console.warn('fetchVersions', e);
            Alert.alert('Error', 'Could not load versions');
        }
    }, [selectedVersion]);

    const fetchBatches = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/hod/timetable/batches`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setBatches(data.data || []);
        } catch (e) { console.warn(e); }
    }, []);

    const fetchSubjects = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/hod/timetable/subjects`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSubjects(data.data || []);
        } catch (e) { console.warn(e); }
    }, []);

    const fetchFaculty = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/hod/timetable/faculty`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setFaculty(data.data || []);
        } catch (e) { console.warn(e); }
    }, []);

    const fetchSlots = useCallback(async (versionId?: number, batchId?: number | null) => {
        if (!versionId) return setSlots([]);
        setLoading(true);
        try {
            const token = await getToken();
            const q = batchId ? `?batchId=${batchId}` : '';
            const res = await fetch(`${BASE_URL}/hod/timetable/version/${versionId}/slots${q}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSlots(data.data || []);
        } catch (e) { console.warn(e); Alert.alert('Error', 'Could not load slots'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchVersions(); fetchBatches(); fetchSubjects(); fetchFaculty(); }, [fetchVersions, fetchBatches, fetchSubjects, fetchFaculty]);
    useEffect(() => { if (selectedVersion) fetchSlots(selectedVersion.id, selectedBatch); else setSlots([]); }, [selectedVersion, selectedBatch, fetchSlots]);

    // Version CRUD
    async function createVersion() {
        if (!versionForm.name || !versionForm.academicYear || !versionForm.semester || !versionForm.validFrom) {
            return Alert.alert('Validation', 'Please fill all required fields (name, academic year, semester, valid from)');
        }
        try {
            const token = await getToken();
            const payload = {
                name: versionForm.name,
                academicYear: versionForm.academicYear,
                semester: parseInt(versionForm.semester),
                validFrom: versionForm.validFrom,
                validTo: versionForm.validTo || undefined
            };
            const res = await fetch(`${BASE_URL}/hod/timetable/version`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setShowVersionModal(false);
                fetchVersions();
                setVersionForm({ name: '', academicYear: '', semester: '', validFrom: '', validTo: '' });
                Alert.alert('Success', 'Version created successfully');
            }
            else Alert.alert('Error', data.message || 'Failed to create version');
        } catch (e) {
            console.warn('createVersion error:', e);
            Alert.alert('Error', 'Failed to create version');
        }
    }

    // Slot CRUD
    async function saveSlot() {
        if (!selectedVersion) return Alert.alert('Error', 'Select a version first');
        if (!slotForm.startTime || !slotForm.endTime || !slotForm.subjectId || !slotForm.batchId || !slotForm.facultyId) {
            return Alert.alert('Validation', 'Please fill all required fields (time, subject, batch, faculty)');
        }
        try {
            const token = await getToken();
            if (editingSlot?.id) {
                // Update existing slot
                const payload = {
                    dayOfWeek: parseInt(slotForm.dayOfWeek),
                    startTime: slotForm.startTime,
                    endTime: slotForm.endTime,
                    subjectId: parseInt(slotForm.subjectId),
                    batchId: parseInt(slotForm.batchId),
                    facultyId: parseInt(slotForm.facultyId),
                    roomNumber: slotForm.roomNumber || null,
                    sessionType: slotForm.sessionType
                };
                const res = await fetch(`${BASE_URL}/hod/timetable/slot/${editingSlot.id}`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    setShowSlotModal(false);
                    setEditingSlot(null);
                    fetchSlots(selectedVersion.id, selectedBatch);
                    Alert.alert('Success', 'Slot updated successfully');
                }
                else Alert.alert('Error', data.message || 'Failed to update');
            } else {
                // Create new slot
                const slotPayload = {
                    dayOfWeek: parseInt(slotForm.dayOfWeek),
                    startTime: slotForm.startTime,
                    endTime: slotForm.endTime,
                    subjectId: parseInt(slotForm.subjectId),
                    batchId: parseInt(slotForm.batchId),
                    facultyId: parseInt(slotForm.facultyId),
                    roomNumber: slotForm.roomNumber || null,
                    sessionType: slotForm.sessionType
                };
                const res = await fetch(`${BASE_URL}/hod/timetable/version/${selectedVersion.id}/slots`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slots: [slotPayload] })
                });
                const data = await res.json();
                if (data.success) {
                    setShowSlotModal(false);
                    fetchSlots(selectedVersion.id, selectedBatch);
                    Alert.alert('Success', 'Slot created successfully');
                }
                else Alert.alert('Error', data.message || 'Failed to create slot');
            }
        } catch (e) {
            console.warn('saveSlot error:', e);
            Alert.alert('Error', 'Save failed');
        }
    }

    async function removeSlot(slotId?: number) {
        if (!slotId) return;
        Alert.alert('Confirm', 'Delete this slot?', [{ text: 'Cancel' }, {
            text: 'Delete', style: 'destructive', onPress: async () => {
                try { const token = await getToken(); await fetch(`${BASE_URL}/hod/timetable/slot/${slotId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchSlots(selectedVersion?.id, selectedBatch); }
                catch (e) { console.warn(e); Alert.alert('Error', 'Delete failed'); }
            }
        }]);
    }

    function openNewSlotModal() { setEditingSlot(null); setSlotForm({ dayOfWeek: '1', startTime: '', endTime: '', subjectId: '', batchId: selectedBatch ? String(selectedBatch) : '', facultyId: '', roomNumber: '', sessionType: 'LECTURE' }); setShowSlotModal(true); }
    function openEditSlot(slot: TimetableSlot) { setEditingSlot(slot); setSlotForm({ dayOfWeek: String(slot.dayOfWeek ?? 1), startTime: slot.startTime ?? '', endTime: slot.endTime ?? '', subjectId: String(slot.subjectId ?? ''), batchId: String(slot.batchId ?? ''), facultyId: String(slot.facultyId ?? ''), roomNumber: slot.roomNumber ?? '', sessionType: slot.sessionType ?? 'LECTURE' }); setShowSlotModal(true); }

    const groupedByDay = () => {
        const grouped: { [k: number]: TimetableSlot[] } = {};
        for (let i = 1; i <= 7; i++) grouped[i] = [];
        slots.forEach((s) => { if (s?.dayOfWeek) grouped[s.dayOfWeek] = [...(grouped[s.dayOfWeek] || []), s]; });
        return grouped;
    };

    const daySlots = groupedByDay();

    return (
        <View className="flex-1 bg-white">
            

            <View className="p-4">
                <View className="mb-3">
                    <Text className="font-semibold">Versions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                        {versions.map(v => (
                            <TouchableOpacity key={v.id} onPress={() => setSelectedVersion(v)} className={`mr-2 px-3 py-2 rounded ${selectedVersion?.id === v.id ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                <Text className={selectedVersion?.id === v.id ? 'text-white' : 'text-gray-800'}>{v.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setShowVersionModal(true)} className="px-3 py-2 bg-green-600 rounded ml-2">
                            <Text className="text-white">+ New</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View className="mb-3">
                    <Text className="font-semibold">Batches</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                        <TouchableOpacity key={'all'} onPress={() => setSelectedBatch(null)} className={`mr-2 px-3 py-2 rounded ${selectedBatch === null ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={selectedBatch === null ? 'text-white' : 'text-gray-800'}>All</Text></TouchableOpacity>
                        {batches.map(b => (
                            <TouchableOpacity key={b.BatchId} onPress={() => setSelectedBatch(b.BatchId)} className={`mr-2 px-3 py-2 rounded ${selectedBatch === b.BatchId ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                <Text className={selectedBatch === b.BatchId ? 'text-white' : 'text-gray-800'}>{b.BatchName}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-semibold">Weekly Schedule</Text>
                    <View className="flex-row">
                        <TouchableOpacity onPress={openNewSlotModal} className="bg-green-600 px-3 py-2 rounded mr-2"><Icon name="add" size={18} color="#fff" /><Text className="text-white"> Add Slot</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => selectedVersion && fetchSlots(selectedVersion.id, selectedBatch)} className="bg-blue-600 px-3 py-2 rounded"><Text className="text-white">Refresh</Text></TouchableOpacity>
                    </View>
                </View>

                {loading ? <ActivityIndicator size="large" color="#2563eb" /> : (
                    <ScrollView>
                        {days.map((d, idx) => (
                            <View key={d} className="mb-4">
                                <Text className="font-semibold text-blue-600 mb-2">{d}</Text>
                                {(daySlots[idx + 1] || []).length === 0 ? (
                                    <Text className="text-gray-500">No classes</Text>
                                ) : (
                                    (daySlots[idx + 1] || []).map((s, i) => (
                                        <View key={s.id ?? `s-${idx}-${i}`} className="p-3 bg-gray-50 rounded mb-2 flex-row justify-between items-center">
                                            <View>
                                                <Text className="font-semibold">{s.subject?.SubjectName ?? '—'}</Text>
                                                <Text className="text-sm text-gray-600">{s.startTime ?? ''} - {s.endTime ?? ''}</Text>
                                                <Text className="text-xs text-gray-500">{s.batch?.BatchName ?? ''} • {s.faculty?.name ?? ''}</Text>
                                            </View>
                                            <View className="flex-row">
                                                <TouchableOpacity onPress={() => openEditSlot(s)} className="mr-2"><Icon name="edit" size={18} color="#2563eb" /></TouchableOpacity>
                                                <TouchableOpacity onPress={() => removeSlot(s.id)}><Icon name="delete" size={18} color="#dc2626" /></TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Version Modal */}
            <Modal visible={showVersionModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <ScrollView className="bg-white rounded-t-3xl p-4">
                        <Text className="text-lg font-bold mb-3">Create Version</Text>
                        <TextInput
                            placeholder="Name (e.g., Fall 2024)"
                            value={versionForm.name}
                            onChangeText={t => setVersionForm(v => ({ ...v, name: t }))}
                            className="border p-2 rounded mb-2"
                        />
                        <TextInput
                            placeholder="Academic Year (e.g., 2024-2025)"
                            value={versionForm.academicYear}
                            onChangeText={t => setVersionForm(v => ({ ...v, academicYear: t }))}
                            className="border p-2 rounded mb-2"
                        />
                        <TextInput
                            placeholder="Semester (e.g., 1, 2, 3...)"
                            value={versionForm.semester}
                            onChangeText={t => setVersionForm(v => ({ ...v, semester: t }))}
                            keyboardType="numeric"
                            className="border p-2 rounded mb-2"
                        />
                        <TextInput
                            placeholder="Valid From (YYYY-MM-DD)"
                            value={versionForm.validFrom}
                            onChangeText={t => setVersionForm(v => ({ ...v, validFrom: t }))}
                            className="border p-2 rounded mb-2"
                        />
                        <TextInput
                            placeholder="Valid To (YYYY-MM-DD) - Optional"
                            value={versionForm.validTo}
                            onChangeText={t => setVersionForm(v => ({ ...v, validTo: t }))}
                            className="border p-2 rounded mb-2"
                        />
                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={() => setShowVersionModal(false)} className="px-3 py-2 mr-2 bg-gray-300 rounded"><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={createVersion} className="px-3 py-2 bg-blue-600 rounded"><Text className="text-white">Create</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Slot Modal */}
            <Modal visible={showSlotModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <ScrollView className="bg-white rounded-t-3xl p-4">
                        <Text className="text-lg font-bold mb-3">{editingSlot ? 'Edit Slot' : 'New Slot'}</Text>

                        <Text className="text-sm font-semibold">Day</Text>
                        <ScrollView horizontal className="mb-2">
                            {days.map((d, i) => (
                                <TouchableOpacity key={i} onPress={() => setSlotForm(sf => ({ ...sf, dayOfWeek: String(i + 1) }))} className={`mr-2 px-3 py-2 rounded ${slotForm.dayOfWeek === String(i + 1) ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={slotForm.dayOfWeek === String(i + 1) ? 'text-white' : 'text-gray-800'}>{d}</Text></TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TextInput placeholder="Start Time (HH:MM)" value={slotForm.startTime} onChangeText={t => setSlotForm(sf => ({ ...sf, startTime: t }))} className="border p-2 rounded mb-2" />
                        <TextInput placeholder="End Time (HH:MM)" value={slotForm.endTime} onChangeText={t => setSlotForm(sf => ({ ...sf, endTime: t }))} className="border p-2 rounded mb-2" />

                        <Text className="text-sm font-semibold">Subject</Text>
                        <ScrollView horizontal className="mb-2">
                            {subjects.length ? subjects.map(s => (
                                <TouchableOpacity key={s.SubjectID} onPress={() => setSlotForm(sf => ({ ...sf, subjectId: String(s.SubjectID) }))} className={`mr-2 px-3 py-2 rounded ${slotForm.subjectId === String(s.SubjectID) ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={slotForm.subjectId === String(s.SubjectID) ? 'text-white' : 'text-gray-800'}>{s.SubjectName}</Text></TouchableOpacity>
                            )) : <Text className="text-gray-500">No subjects</Text>}
                        </ScrollView>

                        <Text className="text-sm font-semibold">Batch</Text>
                        <ScrollView horizontal className="mb-2">
                            {batches.length ? batches.map(b => (
                                <TouchableOpacity key={b.BatchId} onPress={() => setSlotForm(sf => ({ ...sf, batchId: String(b.BatchId) }))} className={`mr-2 px-3 py-2 rounded ${slotForm.batchId === String(b.BatchId) ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={slotForm.batchId === String(b.BatchId) ? 'text-white' : 'text-gray-800'}>{b.BatchName}</Text></TouchableOpacity>
                            )) : <Text className="text-gray-500">No batches</Text>}
                        </ScrollView>

                        <Text className="text-sm font-semibold">Faculty</Text>
                        <ScrollView horizontal className="mb-2">
                            {faculty.length ? faculty.map(f => (
                                <TouchableOpacity key={f.id} onPress={() => setSlotForm(sf => ({ ...sf, facultyId: String(f.id) }))} className={`mr-2 px-3 py-2 rounded ${slotForm.facultyId === String(f.id) ? 'bg-blue-600' : 'bg-gray-200'}`}><Text className={slotForm.facultyId === String(f.id) ? 'text-white' : 'text-gray-800'}>{f.name}</Text></TouchableOpacity>
                            )) : <Text className="text-gray-500">No faculty</Text>}
                        </ScrollView>

                        <TextInput placeholder="Room" value={slotForm.roomNumber} onChangeText={t => setSlotForm(sf => ({ ...sf, roomNumber: t }))} className="border p-2 rounded mb-2" />

                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={() => { setShowSlotModal(false); setEditingSlot(null); }} className="px-3 py-2 mr-2 bg-gray-300 rounded"><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={saveSlot} className="px-3 py-2 bg-blue-600 rounded"><Text className="text-white">Save</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

        </View>
    );
}