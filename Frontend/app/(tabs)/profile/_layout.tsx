import { Stack } from 'expo-router';
import React from 'react';

// The default export MUST be a React component that renders the navigator.
export default function ProfileLayout() {
  return (
    <Stack>
      {/* This screen will be the root of the profile stack, accessible via the tab bar. */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      {/* This screen is pushed on top of the 'index' screen. */}
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: false, 
          // 'presentation: modal' is good for edit screens.
          presentation: 'modal' 
        }} 
      />
    </Stack>
  );
}