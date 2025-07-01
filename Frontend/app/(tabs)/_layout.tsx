import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

// Fix the TabIconProps interface
interface TabIconProps {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap; // This ensures type safety
  color: string;
  size: number;
}

// Create a proper icon mapping function
const getIconName = (iconName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  const iconMapping: Record<string, { focused: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
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
  if (!icons) {
    return focused ? 'home' : 'home-outline';
  }
  return focused ? icons.focused : icons.outline;
};

const TabIcon = ({ focused, name, color, size }: TabIconProps) => (
  <Ionicons 
    name={name}
    size={size} 
    color={color} 
  />
);

export default function TabLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading]);

  if (loading || !user) {
    return null;
  }

  // Updated tab configuration with proper icon handling
  const getTabsForRole = () => {
    switch (user.role) {
      case 'client':
        return [
          { name: 'index', title: 'Home', icon: 'home' },
          { name: 'search', title: 'Search', icon: 'search' },
          { name: 'saved', title: 'Wishlist', icon: 'heart' },
          { name: 'orders', title: 'Orders', icon: 'receipt' },
          { name: 'profile', title: 'Profile', icon: 'person' }
        ];

      case 'company':
        return [
          { name: 'index', title: 'Home', icon: 'home' },
          { name: 'company_dashboard', title: 'Dashboard', icon: 'business' },
          { name: 'orders', title: 'Orders', icon: 'receipt' },
          { name: 'profile', title: 'Profile', icon: 'person' }
        ];

      case 'admin':
        return [
          { name: 'index', title: 'Home', icon: 'home' },
          { name: 'admin_dashboard', title: 'Admin Panel', icon: 'shield' },
          { name: 'support', title: 'Support', icon: 'help-circle' },
          { name: 'profile', title: 'Profile', icon: 'person' }
        ];

      default:
        return [
          { name: 'index', title: 'Home', icon: 'home' },
          { name: 'profile', title: 'Profile', icon: 'person' }
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22bb22',
        tabBarInactiveTintColor: '#606060',
        headerShown: false,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon 
                focused={focused} 
                name={getIconName(tab.icon, focused)} // Use the mapping function
                color={color} 
                size={size} 
              />
            ),
          }}
        />
      ))}
      
      {/* Hidden screens */}
      <Tabs.Screen name="furniture/[id]" options={{ href: null }} />
    </Tabs>
  );
}
