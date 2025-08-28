import { View, Text, Image, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native'
import React, {useState} from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

export default function FacultyLoginScreen() {
  const router = useRouter();
    
      
      const [secure, setsecure] = useState(true);
  return (
    <ScrollView>
    
          <View className='flex-1 items-center'>
            <Image source={require("../../../assets/images/knit-logo.png")} className='mt-36 object-cover' />
            <Text className='text-4xl font-semibold pt-12'>Login as Faculty</Text>
    
            <View className='pt-24 w-full px-10'>
              <TextInput placeholder='Email' className="w-full border border-gray-400 rounded-lg px-5 py-4 text-base text-xl" />
              
    
              <View style={styles.container} className='border border-gray-400 rounded-lg'>
                <TextInput
                  placeholder="Enter password"
                  secureTextEntry={secure}
                  style={styles.input}
                  className='text-xl py-4 '
                />
    
                <Pressable onPress={() => setsecure(!secure)}>
                  <Ionicons
                    name={secure ? "eye-off" : "eye"}
                    size={24}
                    color="#188d35ff"
                  />
                </Pressable>
              </View>
    
              <Pressable style={styles.button} onPress={()=>{router.push("/hod/dashboard")}}>
                <Text style={styles.text}>Login as Faculty</Text>
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