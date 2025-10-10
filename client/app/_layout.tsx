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
          name="(auth)/faculty/dashboard"
          options={{
            headerShown: false
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
          name="(auth)/hod/dashboard"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="(auth)/hod/students"
          options={{
            title: "Students Management",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/student-detail"
          options={{
            title: "Student's Details",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/faculty"
          options={{
            title: "Faculty Management",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/batches"
          options={{
            title: "Batches Management",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/subjects"
          options={{
            title: "Subjects Management",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/attendance"
          options={{
            title: "Attendance Reports",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/assignments"
          options={{
            title: "Assignments Monitoring",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/timetable"
          options={{
            title: "Timetable Management",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/announcements"
          options={{
            title: "Announcements",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/hod/reports"
          options={{
            title: "Reports Generation",
            headerStyle: { backgroundColor: "#c92727ff" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />


        <Stack.Screen
          name="(auth)/student/dashboard"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(auth)/student/attendance"   // full path from app/
          options={{
            title: "My Attendance",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/student/syllabus"   // full path from app/
          options={{
            title: "Syllabus",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="(auth)/student/assignments"   // full path from app/
          options={{
            title: "My Assignments",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(auth)/student/notifications"   // full path from app/
          options={{
            title: "Notifications",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(auth)/student/circulars"   // full path from app/
          options={{
            title: "Circulars",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(auth)/student/events"   // full path from app/
          options={{
            title: "Events",
            headerStyle: { backgroundColor: "#1e40af" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        />
      </Stack>


    </>
  );
}
