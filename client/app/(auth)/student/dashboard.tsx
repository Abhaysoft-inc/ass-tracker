import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function StudentDashboard() {
  const schedule = [
    { time: '10:20 - 11:10 AM', subject: 'EM&I', teacher: 'R.K. Sir' },
    { time: '11:20 - 12:10 PM', subject: 'EMFT', teacher: 'D.K.P. Sir' },
    { time: '12:20 - 01:10 PM', subject: 'Physics', teacher: 'A.B. Sir' },
  ];

  const menuItems = [
    { name: 'Attendance', icon: 'check-circle' },
    { name: 'Syllabus', icon: 'menu-book' },
    { name: 'Assignments', icon: 'assignment' },
    { name: 'Notifications', icon: 'notifications' },
    { name: 'Circulars', icon: 'announcement' },
    { name: 'Events', icon: 'event' },
  ];

  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Posted',
      description: 'Mathematics Assignment #3 - Calculus has been posted. Due date: March 15th',
      time: '2 hours ago',
      isNew: true,
      icon: 'assignment'
    },
    {
      id: 2,
      type: 'circular',
      title: 'Important Circular',
      description: 'Annual Sports Day event scheduled for March 20th. All students must participate.',
      time: '5 hours ago',
      isNew: true,
      icon: 'announcement'
    },
    {
      id: 3,
      type: 'results',
      title: 'Results Declared',
      description: 'Mid-term examination results for Semester 6 have been published.',
      time: '1 day ago',
      isNew: false,
      icon: 'grade'
    },
    {
      id: 4,
      type: 'event',
      title: 'Workshop Registration',
      description: 'AI & Machine Learning workshop registration is now open. Limited seats available.',
      time: '2 days ago',
      isNew: false,
      icon: 'event'
    },
    {
      id: 5,
      type: 'assignment',
      title: 'Assignment Reminder',
      description: 'Physics Assignment #2 submission deadline is tomorrow at 11:59 PM.',
      time: '2 days ago',
      isNew: false,
      icon: 'assignment'
    },
    {
      id: 6,
      type: 'circular',
      title: 'Library Notice',
      description: 'Library will remain closed on March 18th due to maintenance work.',
      time: '3 days ago',
      isNew: false,
      icon: 'announcement'
    }
  ];

  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % schedule.length);
  const prev = () => setIndex((prev) => (prev - 1 + schedule.length) % schedule.length);

  const current = schedule[index];

  const getNotificationColor = (type) => {
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

  const NotificationItem = ({ notification }) => {
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

  return (
    <View className="flex-1 bg-white p-5 pt-24">
      <Text className="text-5xl mb-8 px-4">Hello, Abhay</Text>

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
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No notifications available</Text>
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
          >
            <Icon name={item.icon} size={30} color="#fff" className="mb-2" />
            <Text className="text-white text-center">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className='text-center'> Department of Electrical Engineering</Text>
      <Text className='text-xs text-center mt-2'>&copy; 2025 Team ASS</Text>
    </View>
  );
}