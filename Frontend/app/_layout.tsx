import { Stack, router, useSegments } from "expo-router";
import "global.css"
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const RootStackLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inApp = !inAuthGroup;

    if (!user && inApp) {
      // Redirect to the login page if the user is not signed in
      // and not in the auth group.
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect away from the auth group if the user is signed in.
      router.replace('/');
    }
  }, [user, isLoading, segments]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="furniture/[id]" />
      <Stack.Screen name="admin_dashboard" />
      <Stack.Screen name="company_dashboard" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="support" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
   <>
    <StatusBar hidden={true}/>
    <AuthProvider>
      <RootStackLayout />
    </AuthProvider>
   </>
  )
}