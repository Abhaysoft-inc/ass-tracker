import React from 'react';
import { View, Text, ScrollView } from 'react-native';


type AttendanceSubject = {
    subject: string;
    attended: number;
    total: number;
};

const attendanceData: AttendanceSubject[] = [
    { subject: 'EM&I', attended: 32, total: 40 },
    { subject: 'EMFT', attended: 28, total: 40 },
    { subject: 'Physics', attended: 36, total: 40 },
    { subject: 'Mathematics', attended: 38, total: 40 },
];

type OverallAttendance = {
    attended: number;
    total: number;
    percent: string;
};

const getOverallAttendance = (data: AttendanceSubject[]): OverallAttendance => {
    const totalAttended = data.reduce((sum: number, s: AttendanceSubject) => sum + s.attended, 0);
    const totalClasses = data.reduce((sum: number, s: AttendanceSubject) => sum + s.total, 0);
    return {
        attended: totalAttended,
        total: totalClasses,
        percent: totalClasses ? ((totalAttended / totalClasses) * 100).toFixed(2) : '0.00',
    };
};

export default function StudentAttendance() {
    const overall = getOverallAttendance(attendanceData);

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-3xl font-bold mb-6 text-center">My Attendance</Text>

            <View className="mb-8">
                <Text className="text-xl font-semibold mb-2">Overall Attendance</Text>
                <View className="bg-blue-100 rounded-lg p-4 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-blue-800">{overall.attended} / {overall.total}</Text>
                    <Text className="text-lg font-bold text-blue-800">{overall.percent}%</Text>
                </View>
            </View>

            <Text className="text-xl font-semibold mb-2">Subject-wise Attendance</Text>
            <View>
                {attendanceData.map((subject, idx) => {
                    const percent = ((subject.attended / subject.total) * 100).toFixed(2);
                    return (
                        <View key={idx} className="bg-gray-100 rounded-lg p-4 mb-3 flex-row items-center justify-between">
                            <Text className="text-lg font-semibold">{subject.subject}</Text>
                            <Text className="text-base">{subject.attended} / {subject.total}</Text>
                            <Text className="text-base font-bold text-green-700">{percent}%</Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}
