import { View, Text, Image, ScrollView, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';

export default function FacultyLoginScreen() {
  const router = useRouter();
  const [secure, setsecure] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/faculty/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in SecureStore
        await SecureStore.setItemAsync('facultyToken', data.token);
        await SecureStore.setItemAsync('facultyUser', JSON.stringify(data.user));

        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              router.dismissAll();
              router.replace('/faculty/dashboard');
            },
          },
        ]);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View className='flex-1 items-center'>
        <Image source={require("../../../assets/images/knit-logo.png")} className='mt-36 object-cover' />
        <Text className='text-4xl font-semibold pt-12'>Login as Faculty</Text>

        <View className='pt-24 w-full px-10'>
          <TextInput
            placeholder='Email'
            className="w-full border border-gray-400 rounded-lg px-5 py-4 text-xl mb-4"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <View style={styles.container} className='border border-gray-400 rounded-lg'>
            <TextInput
              placeholder="Enter password"
              secureTextEntry={secure}
              style={styles.input}
              className='text-xl py-4'
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <Pressable onPress={() => setsecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off" : "eye"}
                size={24}
                color="#188d35ff"
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.text}>Login as Faculty</Text>
            )}
          </Pressable>

        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#188d35ff",
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "semibold",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
});