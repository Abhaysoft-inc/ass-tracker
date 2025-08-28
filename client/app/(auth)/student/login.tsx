import { View, Text, TextInput, StyleSheet, Image, Button, ScrollView, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; //using this to save the token and then logging in using it

export default function StudentLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secure, setsecure] = useState(true);


  const handleLogin = async ()=>{
    
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    
    setLoading(true);

    try {
      console.log(email, password)
      const response = await fetch("http://172.20.47.74:3000/auth/student/login", {
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },
        body:JSON.stringify({email, password}),
      });

      const data =  await response.json();
      await SecureStore.setItemAsync("loginToken", data.token); // saving the token
      const token = await SecureStore.getItemAsync("loginToken"); // fetching the token
      Alert.alert("Saved Token", token?.toString());

      router.push("/student/dashboard");

      // Alert.alert(data);
    } catch (error) {

      console.log(error);
      
      
    }
  }


  return (
    <ScrollView>

      <View className='flex-1 items-center'>
        <Image source={require("../../../assets/images/knit-logo.png")} className='mt-36 object-cover' />
        <Text className='text-4xl font-semibold pt-12'>Login as Student</Text>

        <View className='pt-24 w-full px-10'>
          <TextInput placeholder='Email' className="w-full border border-gray-400 rounded-lg px-5 py-4 text-base text-xl" value={email} onChangeText={setEmail} />
          

          <View style={styles.container} className='border border-gray-400 rounded-lg'>
            <TextInput
              placeholder="Enter password"
              secureTextEntry={secure}
              style={styles.input}
              className='text-xl py-4'
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