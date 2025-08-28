import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar backgroundColor="#000000ff" barStyle="light-content" />
      <Stack>
        {/* Home screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Student login */}
        <Stack.Screen
          name="(auth)/student/login"   // full path from app/
          options={{
            title: "Student Login",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/faculty/login"
          options={{
            title: "Faculty Login",
            headerStyle: { backgroundColor: "#188d35ff" },
            headerTintColor: "#fff",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/login"
          options={{
            title: "HOD Login",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
          }}
        />

        <Stack.Screen
        name="(auth)/student/dashboard"
        options={{
          headerShown:false,
          
        }}
        />
      </Stack>
    </>
  );
}
