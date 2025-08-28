import { Stack } from "expo-router";
import "../global.css"
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (

    
    <Stack>
      <StatusBar backgroundColor="#1e40af" barStyle="light-content" />
      <Stack.Screen name="index" options={{headerShown:false}}/>

    </Stack>
  );
}
