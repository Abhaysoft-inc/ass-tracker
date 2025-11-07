import { View, Text, Image, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../../../config/api';


export default function HODLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secure, setsecure] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      console.log(email, password);
      const response = await fetch(`${BASE_URL}/auth/hod/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get('content-type'));

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log("Non-JSON response:", textResponse);
        Alert.alert("Error", "Server error. Please check if the backend is running.");
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.hod && data.token) {
        // Store HOD data and token in SecureStore
        await SecureStore.setItemAsync("hodData", JSON.stringify(data.hod));
        await SecureStore.setItemAsync("hodToken", data.token);
        console.log("HOD login successful:", data.msg);

        // Reset navigation stack to prevent going back to login
        router.dismissAll();
        router.replace("/hod/dashboard");
        Alert.alert("Success", "Login successful!");
      } else {
        Alert.alert("Error", data.message || "Login failed");
      }

    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView>

      <View className='flex-1 items-center'>
        <Image source={require("../../../assets/images/knit-logo.png")} className='mt-36 object-cover' />
        <Text className='text-4xl font-semibold pt-12'>Login as HOD</Text>

        <View className='pt-24 w-full px-10'>
          <TextInput
            placeholder='Email'
            className="w-full border border-gray-400 rounded-lg px-5 py-4 text-xl text-black"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />


          <View style={styles.container} className='border border-gray-400 rounded-lg'>
            <TextInput
              placeholder="Enter password"
              secureTextEntry={secure}
              style={styles.input}
              className='text-xl py-4 text-black'
              value={password}
              onChangeText={setPassword}
            />

            <Pressable onPress={() => setsecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off" : "eye"}
                size={24}
                color="#c92727ff"
              />
            </Pressable>
          </View>

          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.text}>
              {loading ? "Loading..." : "Login as HOD"}
            </Text>
          </Pressable>

        </View>
      </View>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  button: {
    backgroundColor: "#c92727ff",
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
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