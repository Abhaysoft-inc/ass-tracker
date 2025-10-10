import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function RequestPastAttendance() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');

    // Past dates for selection
    const pastDates = [
        { id: '1', date: '2025-10-03', day: 'Yesterday', classes: 2 },
        { id: '2', date: '2025-10-02', day: 'Oct 2, 2025', classes: 3 },
        { id: '3', date: '2025-10-01', day: 'Oct 1, 2025', classes: 1 },
        { id: '4', date: '2025-09-30', day: 'Sep 30, 2025', classes: 2 },
        { id: '5', date: '2025-09-29', day: 'Sep 29, 2025', classes: 3 },
    ];

    // Past classes based on selected date
    const getPastClasses = (dateId: string) => {
        const classesData: { [key: string]: any[] } = {
            '1': [
                { id: '1', subject: 'Digital Electronics', batch: 'EE-2023', time: '09:30 - 10:30 AM', room: 'EE-101', facultyId: '2' },
                { id: '2', subject: 'Control Systems', batch: 'EE-2022', time: '11:00 - 12:00 PM', room: 'EE-201', facultyId: '1' },
            ],
            '2': [
                { id: '3', subject: 'Power Systems', batch: 'EE-2021', time: '10:00 - 11:00 AM', room: 'EE-301', facultyId: '3' },
                { id: '4', subject: 'Microprocessors', batch: 'EE-2023', time: '02:00 - 03:00 PM', room: 'EE-102', facultyId: '2' },
                { id: '5', subject: 'Network Theory', batch: 'EE-2024', time: '03:30 - 04:30 PM', room: 'EE-103', facultyId: '1' },
            ],
            '3': [
                { id: '6', subject: 'Electromagnetics', batch: 'EE-2022', time: '11:00 - 12:00 PM', room: 'EE-201', facultyId: '3' },
            ],
            '4': [
                { id: '7', subject: 'Analog Circuits', batch: 'EE-2023', time: '09:00 - 10:00 AM', room: 'EE-104', facultyId: '2' },
                { id: '8', subject: 'Signal Processing', batch: 'EE-2021', time: '01:00 - 02:00 PM', room: 'EE-205', facultyId: '1' },
            ],
            '5': [
                { id: '9', subject: 'Power Electronics', batch: 'EE-2022', time: '10:30 - 11:30 AM', room: 'EE-302', facultyId: '3' },
                { id: '10', subject: 'Communication Systems', batch: 'EE-2021', time: '02:30 - 03:30 PM', room: 'EE-206', facultyId: '2' },
                { id: '11', subject: 'Control Theory', batch: 'EE-2024', time: '04:00 - 05:00 PM', room: 'EE-105', facultyId: '1' },
            ],
        };
        return classesData[dateId] || [];
    };

    // Faculty members who conducted past classes
    const facultyMembers = [
        { id: '1', name: 'Dr. Rajesh Kumar', department: 'Electrical Engineering' },
        { id: '2', name: 'Prof. Sunita Sharma', department: 'Electrical Engineering' },
        { id: '3', name: 'Dr. Amit Singh', department: 'Electrical Engineering' },
    ];

    const pastClasses = selectedDate ? getPastClasses(selectedDate) : [];
    const selectedClassData = pastClasses.find(c => c.id === selectedClass);
    const conductingFaculty = selectedClassData ? facultyMembers.find(f => f.id === selectedClassData.facultyId) : null;

    const handleRequest = () => {
        if (!selectedDate || !selectedClass) {
            Alert.alert('Error', 'Please select both date and class');
            return;
        }

        const dateData = pastDates.find(d => d.id === selectedDate);

        Alert.alert(
            'Request Submitted',
            `Date: ${dateData?.day}\nClass: ${selectedClassData?.subject}\nFaculty: ${conductingFaculty?.name}\n\nYour request has been sent to the faculty member.`,
            [
                { text: 'OK', onPress: () => router.back() }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 pt-16 pb-6 px-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Icon name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Request Past Attendance</Text>
                        <Text className="text-green-100 text-sm mt-1">Request attendance from previous classes</Text>
                    </View>
                </View>
            </View>

            <View className="px-6 py-4">
                {/* Select Date */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-3">Select Date</Text>
                    <View className="space-y-3">
                        {pastDates.map((dateItem) => (
                            <TouchableOpacity
                                key={dateItem.id}
                                onPress={() => {
                                    setSelectedDate(dateItem.id);
                                    setSelectedClass(''); // Reset class selection
                                }}
                                className={`p-4 rounded-lg border-2 flex-row items-center justify-between ${selectedDate === dateItem.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <View>
                                    <Text className={`text-lg font-semibold ${selectedDate === dateItem.id ? 'text-green-800' : 'text-gray-800'
                                        }`}>
                                        {dateItem.day}
                                    </Text>
                                    <Text className="text-gray-600 text-sm">{dateItem.date}</Text>
                                </View>
                                <View className="items-center">
                                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                                        <Text className="text-blue-700 font-medium text-sm">
                                            {dateItem.classes} {dateItem.classes === 1 ? 'Class' : 'Classes'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Select Class (shown only when date is selected) */}
                {selectedDate && (
                    <View className="mb-6">
                        <Text className="text-lg font-semibold mb-3">
                            Select Class ({pastClasses.length} available)
                        </Text>
                        <View className="space-y-3">
                            {pastClasses.map((classItem) => {
                                const faculty = facultyMembers.find(f => f.id === classItem.facultyId);
                                return (
                                    <TouchableOpacity
                                        key={classItem.id}
                                        onPress={() => setSelectedClass(classItem.id)}
                                        className={`p-4 rounded-lg border-2 ${selectedClass === classItem.id
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <Text className={`text-lg font-semibold ${selectedClass === classItem.id ? 'text-green-800' : 'text-gray-800'
                                            }`}>
                                            {classItem.subject}
                                        </Text>
                                        <View className="flex-row justify-between mt-2">
                                            <Text className="text-gray-600">{classItem.batch}</Text>
                                            <Text className="text-gray-600">{classItem.time}</Text>
                                        </View>
                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-gray-500 text-sm">Room: {classItem.room}</Text>
                                            <Text className="text-gray-500 text-sm">Faculty: {faculty?.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Request Summary */}
                {selectedDate && selectedClass && (
                    <View className="bg-blue-50 rounded-lg p-4 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Icon name="summarize" size={20} color="#3B82F6" />
                            <Text className="text-blue-800 font-semibold ml-2">Request Summary</Text>
                        </View>
                        <View className="space-y-2">
                            <View className="flex-row justify-between">
                                <Text className="text-blue-700">Date:</Text>
                                <Text className="text-blue-800 font-medium">
                                    {pastDates.find(d => d.id === selectedDate)?.day}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-blue-700">Class:</Text>
                                <Text className="text-blue-800 font-medium">{selectedClassData?.subject}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-blue-700">Batch:</Text>
                                <Text className="text-blue-800 font-medium">{selectedClassData?.batch}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-blue-700">Faculty:</Text>
                                <Text className="text-blue-800 font-medium">{conductingFaculty?.name}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Request Guidelines */}
                <View className="bg-yellow-50 rounded-lg p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <Icon name="info" size={20} color="#F59E0B" />
                        <Text className="text-yellow-800 font-semibold ml-2">Request Guidelines</Text>
                    </View>
                    <Text className="text-yellow-700 text-sm">
                        • Past attendance requests are sent directly to the faculty who conducted the class{'\n'}
                        • Faculty members have 48 hours to respond to your request{'\n'}
                        • You can request attendance for classes up to 30 days old{'\n'}
                        • Valid reasons include technical issues, network problems, or app crashes{'\n'}
                        • Frequent requests may require additional verification
                    </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleRequest}
                    className={`py-4 rounded-xl items-center mb-4 ${selectedDate && selectedClass
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                    disabled={!selectedDate || !selectedClass}
                >
                    <Text className={`text-lg font-semibold ${selectedDate && selectedClass
                            ? 'text-white'
                            : 'text-gray-500'
                        }`}>
                        Submit Request
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}