import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router =  useRouter();
  return (
    <View className="flex-1 bg-blue-50 p-10 pt-36">
      
      {/* Logo */}
      <View className="items-center mt-16">
        <Image
          source={require("../assets/images/knit-logo.png")}
          className="w-32 h-32 mb-6"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-8">Login as</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <Pressable className="bg-blue-600 py-4 rounded-xl w-full items-center" onPress={()=>router.push("/student/login")}>
          <Text className="text-white text-lg font-semibold">Student</Text>
        </Pressable>

        <Pressable className="bg-green-600 py-4 rounded-xl w-full items-center" onPress={()=>router.push("/faculty")}>
          <Text className="text-white text-lg font-semibold">Faculty</Text>
        </Pressable>

        <Pressable className="bg-red-600 py-4 rounded-xl w-full items-center" onPress={()=>router.push("/hod")}>
          <Text className="text-white text-lg font-semibold">HOD</Text>
        </Pressable>
      </View>

      {/* Create account link */}
      <View className="items-center mt-8">
        <Text className="text-gray-600">
          Don’t have an account?{" "}
          <Text className="text-blue-700 font-semibold">Create New Account</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    marginTop: 10,
    gap: 16, // adds spacing between buttons
  },
});
