import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-blue-50">
      {/* Main Content Container */}
      <View className="flex-1 justify-center px-8">

        {/* Logo Section */}
        <View className="items-center mb-12">
          <View className="bg-white rounded-full p-6 shadow-lg mb-6">
            <Image
              source={require("../assets/images/knit-logo.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">AAS Tracker</Text>
          <Text className="text-lg text-gray-600 mb-8">Choose your role to continue</Text>
        </View>

        {/* Login Buttons */}
        <View className="gap-6">
          <Pressable
            className="bg-blue-600 py-5 rounded-2xl w-full items-center shadow-lg active:scale-95"
            onPress={() => router.push("/student/login")}
          >
            <Text className="text-white text-xl font-bold">Student</Text>
          </Pressable>

          <Pressable
            className="bg-green-600 py-5 rounded-2xl w-full items-center shadow-lg active:scale-95"
            onPress={() => router.push("/faculty/login")}
          >
            <Text className="text-white text-xl font-bold">Faculty</Text>
          </Pressable>

          <Pressable
            className="bg-red-600 py-5 rounded-2xl w-full items-center shadow-lg active:scale-95"
            onPress={() => router.push("/hod/login")}
          >
            <Text className="text-white text-xl font-bold">Head of Department</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View className="items-center pb-8">
        <Pressable
          className="mb-4 px-4 py-2 rounded-lg bg-gray-200 active:bg-gray-300"
          onPress={() => router.push("/server-config")}
        >
          <Text className="text-gray-600 text-sm">⚙️ Server Configuration</Text>
        </Pressable>
        <Text className="text-gray-500 text-sm">
          © 2025 Team Phool 🌼 • All rights reserved
        </Text>
      </View>
    </View>
  );
}
