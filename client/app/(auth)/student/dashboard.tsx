import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Logout function
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('loginToken');
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
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

  const schedule = [
    { time: '10:20 - 11:10 AM', subject: 'EM&I', teacher: 'Bhagat Sir' },
    { time: '11:20 - 12:10 PM', subject: 'EMFT', teacher: 'D.K.P. Sir' },
    { time: '12:20 - 01:10 PM', subject: 'BSS', teacher: 'Ashutosh Sir' },
  ];

  const menuItems = [
    { name: 'Attendance', icon: 'check-circle' },
    { name: 'Syllabus', icon: 'menu-book' },
    { name: 'Assignments', icon: 'assignment' },
    { name: 'Notifications', icon: 'notifications' },
    { name: 'Circulars', icon: 'announcement' },
    { name: 'Events', icon: 'event' },
  ];

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('loginToken');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/student/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        console.log('Failed to fetch announcements');
      }
    } catch (error) {
      console.log('Error fetching announcements:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % schedule.length);
  const prev = () => setIndex((prev) => (prev - 1 + schedule.length) % schedule.length);

  const current = schedule[index];

  const getNotificationColor = (type: any) => {
    switch (type) {
      case 'assignment':
        return '#3B82F6'; // Blue
      case 'circular':
        return '#10B981'; // Green
      case 'results':
        return '#F59E0B'; // Amber
      case 'event':
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280'; // Gray
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const color = getNotificationColor(notification.type);

    return (
      <TouchableOpacity className="mb-3">
        <View className="flex-row items-start p-3 bg-white rounded-lg border border-gray-200">
          {/* Notification Icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon name={notification.icon} size={20} color={color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-semibold text-gray-800 flex-1" numberOfLines={1}>
                {notification.title}
              </Text>
              {notification.isNew && (
                <View className="bg-red-500 w-2 h-2 rounded-full ml-2"></View>
              )}
            </View>

            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
              {notification.description}
            </Text>

            <Text className="text-xs text-gray-400">{notification.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleMenuPress = (itemName: string) => {
    if (itemName === 'Attendance') {
      router.push('/(auth)/student/attendance');
    }
    if (itemName === 'Assignments') {
      router.push('/(auth)/student/assignments');
    }
    if (itemName === 'Syllabus') {
      router.push('/(auth)/student/syllabus');
    }
    if (itemName === 'Notifications') {
      router.push('/(auth)/student/notifications');
    }
    if (itemName === 'Circulars') {
      router.push('/(auth)/student/circulars');
    }
    if (itemName === 'Events') {
      router.push('/(auth)/student/events');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5 pt-16" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-row items-center justify-between mb-8 px-4">
        <Text className="text-5xl">Hello, Abhay</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      <Text className='px-5'>Upcoming Classes</Text>

      <View className="flex-row items-center border border-gray-300 rounded-2xl bg-gray-100 p-4 mt-3 mx-3">
        <TouchableOpacity onPress={prev} className="p-2">
          <Icon name="chevron-left" size={30} color="#555" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text>{current.time}</Text>
          <Text className="text-4xl my-2">{current.subject}</Text>
          <Text>By {current.teacher}</Text>
        </View>

        <TouchableOpacity onPress={next} className="p-2">
          <Icon name="chevron-right" size={30} color="#555" />
        </TouchableOpacity>
      </View>

      <View className='px-4 mt-10'>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold">Latest Notifications</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        <View className='border border-gray-400 mt-3 h-64 rounded-xl bg-gray-50'>
          <ScrollView
            className="flex-1 p-3"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#DC2626" size="large" />
                <Text className="text-gray-500 mt-2">Loading announcements...</Text>
              </View>
            ) : announcements.length > 0 ? (
              announcements.map((notification: any) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No announcements available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* grid here */}
      <View className="flex-row flex-wrap justify-between mt-10 px-4">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            className="w-[30%] aspect-square bg-gray-800 rounded-lg mb-4 justify-center items-center"
            onPress={() => handleMenuPress(item.name)}
          >
            <Icon name={item.icon} size={30} color="#fff" className="mb-2" />
            <Text className="text-white text-center">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className='text-center'> Department of Electrical Engineering</Text>
      <Text className='text-xs text-center mt-2'>&copy; 2025 Team Phool 🌼</Text>
    </ScrollView>
  );
}