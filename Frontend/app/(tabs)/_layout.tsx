import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';

// This is a helper component, no changes needed here.
const TabIcon = ({ focused, name, color, size }: {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) => (
  <Ionicons name={name} size={size} color={color} />
);

// This is a helper function, no changes needed here.
const getIconName = (iconName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  const iconMapping: Record<string, { focused: string; outline: string }> = {
    'home': { focused: 'home', outline: 'home-outline' },
    'search': { focused: 'search', outline: 'search-outline' },
    'heart': { focused: 'heart', outline: 'heart-outline' },
    'receipt': { focused: 'receipt', outline: 'receipt-outline' },
    'person': { focused: 'person', outline: 'person-outline' },
    'business': { focused: 'business', outline: 'business-outline' },
    'shield': { focused: 'shield', outline: 'shield-outline' },
    'help-circle': { focused: 'help-circle', outline: 'help-circle-outline' },
  };
  const icons = iconMapping[iconName];
  return icons ? (focused ? icons.focused as keyof typeof Ionicons.glyphMap : icons.outline as keyof typeof Ionicons.glyphMap) : 'home';
};


export default function TabLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // --- START OF THE FIX ---
  // We declare all screens but conditionally set their `href` to null to hide them.
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: { backgroundColor: '#fff' },
        headerShown: false,
      }}
    >
      {/* Common Tabs for ALL roles */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('home', focused)} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('person', focused)} color={color} size={size} />
          ),
        }}
      />

      {/* --- Client-Only Tabs --- */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          href: user.role === 'client' ? '/search' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('search', focused)} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Wishlist',
          href: user.role === 'client' ? '/saved' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('heart', focused)} color={color} size={size} />
          ),
        }}
      />

      {/* --- Company-Only Tabs --- */}
      <Tabs.Screen
        name="company_dashboard"
        options={{
          title: 'Dashboard',
          href: user.role === 'company' ? '/company_dashboard' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('business', focused)} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          href: user.role === 'company' ? '/orders' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('receipt', focused)} color={color} size={size} />
          ),
        }}
      />

      {/* --- Admin-Only Tabs --- */}
      <Tabs.Screen
        name="admin_dashboard"
        options={{
          title: 'Dashboard',
          href: user.role === 'admin' ? '/admin_dashboard' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('shield', focused)} color={color} size={size} />
          ),
        }}
      />
       <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          href: user.role === 'admin' || user.role === 'company' || user.role === 'client' ? '/support' : null,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} name={getIconName('help-circle', focused)} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
  // --- END OF THE FIX ---
}