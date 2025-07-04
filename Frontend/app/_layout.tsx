import { Stack, router, useSegments } from "expo-router";
import "../global.css"
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const RootStackLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';
const inAuth = segments[0] === '(auth)';

// Only redirect to login if not authenticated and in a protected (tabs) route
if (!user && inTabs) {
  router.replace('/login');
}

// Only redirect away from auth pages if authenticated and in (auth)
if (user && inAuth) {
  router.replace('/');
}

// Do NOT redirect for other routes (like /furniture/[id])

  }, [user, isLoading, segments]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The (tabs) layout is defined here, containing all your tab screens. */}
      <Stack.Screen name="(tabs)" />
      
      {/* The (auth) layout is for login/signup screens. */}
      <Stack.Screen name="(auth)" />

      {/* This is a modal/stack screen that can be pushed on top of the tabs. */}
      <Stack.Screen name="furniture/[id]" />
      <Stack.Screen name="ticket/[id]" />
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