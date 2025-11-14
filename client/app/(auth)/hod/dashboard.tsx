import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { hodAPI } from '../../../services/api';

export default function HODDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await hodAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Prevent back navigation to login screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Return true to prevent default back action
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription?.remove();
    }, [])
  );

  const managementItems = [
    { name: 'Students', icon: 'school', description: 'Manage student records' },
    { name: 'Faculty', icon: 'people', description: 'Manage faculty members' },
    { name: 'Batches', icon: 'group', description: 'Manage class batches' },
    { name: 'Subjects', icon: 'book', description: 'Manage subjects & curriculum' },
    { name: 'Attendance', icon: 'check-circle', description: 'View attendance reports' },
    { name: 'Assignments', icon: 'assignment', description: 'Monitor assignments' },
    { name: 'Timetable', icon: 'schedule', description: 'Manage class schedules' },
    { name: 'Announcements', icon: 'campaign', description: 'Send notifications' },
    { name: 'Reports', icon: 'assessment', description: 'Generate reports' },
  ];

  // Quick stats data from analytics
  const quickStats = analytics ? [
    { label: 'Total Students', value: analytics.quickStats.totalStudents.toString(), color: '#DC2626' },
    { label: 'Faculty Members', value: analytics.quickStats.totalFaculty.toString(), color: '#EF4444' },
    { label: 'Active Batches', value: analytics.quickStats.activeBatches.toString(), color: '#F87171' },
    { label: 'Total Subjects', value: analytics.quickStats.totalSubjects.toString(), color: '#B91C1C' },
  ] : [];

  // Additional stats
  const additionalStats = analytics ? [
    { label: 'Total Assignments', value: analytics.quickStats.totalAssignments.toString(), color: '#059669' },
    { label: 'Pending Assignments', value: analytics.quickStats.pendingAssignments.toString(), color: '#D97706' },
    { label: 'Recent Notifications', value: analytics.quickStats.recentNotifications.toString(), color: '#7C3AED' },
    { label: 'Department Analytics', value: 'EED', color: '#0EA5E9' },
  ] : [];

  // Recent activities from analytics
  const recentActivities = analytics && analytics.recentActivities ? analytics.recentActivities.map((activity: any) => {
    const activityDate = new Date(activity.time);
    const formattedTime = activityDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return {
      activity: activity.activity,
      time: formattedTime
    };
  }) : [];

  const handleManagementPress = (itemName: string) => {
    // Navigation logic for different management sections
    const route = itemName.toLowerCase().replace(' ', '-');
    router.push(`/(auth)/hod/${route}` as any);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear stored HOD data and token
              await SecureStore.deleteItemAsync("hodData");
              await SecureStore.deleteItemAsync("hodToken");
              console.log("HOD data and token cleared");

              // Navigate back to main screen
              router.dismissAll();
              router.replace("/");
            } catch (error) {
              console.log("Logout error:", error);
              // Even if there's an error, still navigate back
              router.dismissAll();
              router.replace("/");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header */}
      <View className="bg-red-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold">HOD Dashboard</Text>
            <Text className="text-red-100 text-base mt-1">Department of Electrical Engineering</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row">
            <TouchableOpacity
              onPress={loadAnalytics}
              className="bg-red-500 px-3 py-2 rounded-lg mr-2"
              disabled={loading}
            >
              <Icon name="refresh" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Icon name="logout" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="px-6 py-4">
        <Text className="text-xl font-semibold mb-4">Quick Overview</Text>
        <View className="flex-row flex-wrap justify-between">
          {quickStats.map((stat, idx) => (
            <View key={idx} className="w-[48%] bg-gray-50 rounded-lg p-4 mb-3">
              <Text className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </Text>
              <Text className="text-gray-600 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Additional Analytics */}
      <View className="px-6 py-4">
        <Text className="text-xl font-semibold mb-4">Department Analytics</Text>
        <View className="flex-row flex-wrap justify-between">
          {additionalStats.map((stat, idx) => (
            <View key={idx} className="w-[48%] bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
              <Text className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </Text>
              <Text className="text-gray-600 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Management Grid */}
      <View className="px-6 py-4">
        <Text className="text-xl font-semibold mb-4">Management</Text>
        <View className="flex-row flex-wrap justify-between">
          {managementItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="w-[48%] bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm"
              onPress={() => handleManagementPress(item.name)}
            >
              <View className="items-center">
                <View className="bg-red-100 rounded-full p-3 mb-2">
                  <Icon name={item.icon} size={24} color="#DC2626" />
                </View>
                <Text className="font-semibold text-gray-800 text-center">{item.name}</Text>
                <Text className="text-xs text-gray-500 text-center mt-1">{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View className="px-6 py-4">
        <Text className="text-xl font-semibold mb-4">Recent Activities</Text>
        <View className="bg-gray-50 rounded-lg p-4">
          {recentActivities.map((activity, idx) => (
            <View key={idx} className="flex-row items-start mb-3 last:mb-0">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-800 text-sm">{activity.activity}</Text>
                <Text className="text-gray-500 text-xs mt-1">{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-4 mt-6">
        <Text className="text-center text-gray-500 text-sm">
          Department of Electrical Engineering
        </Text>
        <Text className="text-center text-gray-400 text-xs mt-1">
          &copy; 2025 Team Phool 🌼
        </Text>
      </View>
    </ScrollView>
  );
}