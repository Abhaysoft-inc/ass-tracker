import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../../config/api';

export default function FacultyManagement() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('hodToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                router.replace('/');
                return;
            }
            const response = await fetch(`${BASE_URL}/hod/faculty`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const text = await response.text();
            let data: any = null;
            try { data = text ? JSON.parse(text) : null; } catch (parseErr) {
                console.error('Non-JSON response:', text, parseErr);
                Alert.alert('Error', 'Server returned an unexpected response');
                return;
            }
            if (response.ok && data && data.success) { setFaculty(data.data); }
            else { console.error('Failed:', { status: response.status, body: data }); Alert.alert('Error', data?.message || 'Failed to fetch faculty'); }
        } catch (error) { console.error('Error fetching faculty:', error); Alert.alert('Error', 'Network error.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFaculty(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);
    const filteredFaculty = faculty.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.faculty?.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (<View className="flex-1 bg-white justify-center items-center"><ActivityIndicator size="large" color="#DC2626" /><Text className="text-gray-600 mt-4">Loading faculty...</Text></View>);
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-4"><View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4"><Icon name="search" size={20} color="#666" /><TextInput placeholder="Search faculty..." className="flex-1 ml-3 text-gray-800" value={searchQuery} onChangeText={setSearchQuery} /></View></View>
            <View className="px-6 mb-4"><TouchableOpacity className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center" onPress={() => router.push('/(auth)/hod/add-faculty')}><Icon name="add" size={20} color="white" /><Text className="text-white font-semibold ml-2">Add New Faculty</Text></TouchableOpacity></View>
            <View className="px-6"><Text className="text-lg font-semibold mb-4">Faculty Members ({filteredFaculty.length})</Text>
                {filteredFaculty.length === 0 ? (<View className="bg-gray-50 rounded-lg p-8 items-center"><Icon name="people" size={48} color="#9CA3AF" /><Text className="text-gray-600 text-lg font-medium mt-4">No Faculty Found</Text><Text className="text-gray-500 text-center mt-2">Add faculty members to get started</Text></View>)
                    : (filteredFaculty.map((f) => (<View key={f.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"><View className="flex-row items-center justify-between mb-2"><Text className="text-lg font-semibold text-gray-800">{f.name}</Text>{f.faculty?.isHOD && (<View className="bg-red-100 px-2 py-1 rounded"><Text className="text-red-600 text-xs font-semibold">HOD</Text></View>)}</View><Text className="text-sm text-gray-600 mb-2">Department: {f.faculty?.department || 'N/A'}</Text><View className="mb-3"><Text className="text-sm text-gray-600">Phone: {f.faculty?.phone || 'N/A'}</Text><Text className="text-sm text-gray-600">Email: {f.email}</Text></View><View className="flex-row justify-end"><TouchableOpacity className="bg-green-100 px-3 py-2 rounded-lg mr-2"><Text className="text-green-600 text-sm">View</Text></TouchableOpacity><TouchableOpacity className="bg-red-100 px-3 py-2 rounded-lg"><Text className="text-red-600 text-sm">Delete</Text></TouchableOpacity></View></View>)))}
            </View>
        </ScrollView>
    );
}
