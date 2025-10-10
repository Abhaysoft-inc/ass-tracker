import { View, Text, TextInput, StyleSheet, Image, Button, ScrollView, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; //using this to save the token and then logging in using it
import { BASE_URL } from '../../../config/api';

export default function StudentLoginScreen() {
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
      console.log(email, password)
      const response = await fetch(`${BASE_URL}/auth/student/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Ensure token is a string before storing
        await SecureStore.setItemAsync("loginToken", String(data.token));
        const token = await SecureStore.getItemAsync("loginToken");
        console.log("Saved Token:", token);

        // Reset navigation stack to prevent going back to login
        router.dismissAll();
        router.replace("/student/dashboard");
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
  }


  return (
    <ScrollView>

      <View className='flex-1 items-center'>
        <Image source={require("../../../assets/images/knit-logo.png")} className='mt-36 object-cover' />
        <Text className='text-4xl font-semibold pt-12'>Login as Student</Text>

        <View className='pt-24 w-full px-10'>
          <TextInput placeholder='Email' className="w-full border border-gray-400 rounded-lg px-5 py-4 text-xl text-black" value={email} onChangeText={setEmail} />


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
                color="#1e40af"
              />
            </Pressable>
          </View>

          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.text}>

              {loading ? "Loading...." : "Login as Student"}

            </Text>
          </Pressable>

        </View>
      </View>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1e40af",
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