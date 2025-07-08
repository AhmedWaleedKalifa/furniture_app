import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProductsDashboard from '../../components/admin/ProductsDashboard';
import OrdersDashboard from '../../components/admin/OrdersDashboard';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import StatsDashboard from './StatusDashboard';
import UsersDashboard from './UserDashboard';
import { useAdminOnly } from '../../lib/useRoleAcess';
import SupportDashboard from './SupportDashboard';

const AdminDashboard = () => {
  const { token } = useAuth();
  const { hasAccess, isLoading } = useAdminOnly();
  const [activeTab, setActiveTab] = useState('stats');

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-w-200">
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text className="mt-4 text-g-300">Loading...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-w-200">
        <Text className="text-2xl font-bold text-red-500 mb-2">Admin Access Required</Text>
        <Text className="text-base text-g-300 text-center">You need admin privileges to access this section.</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'stats', title: 'Dashboard', icon: '📊' },
    { id: 'users', title: 'Users', icon: '👥' },
    { id: 'products', title: 'Products', icon: '🛋️' },
    { id: 'orders', title: 'Orders', icon: '📦' },
    { id: 'support', title: 'Support', icon: '💬' },
    { id: 'analytics', title: 'Analytics', icon: '📈' },
  ];

  const renderContent = () => {
    if (!token) return <Text className="text-red-500 text-base text-center m-5">Authentication required</Text>;
    
    switch (activeTab) {
      case 'stats': return <StatsDashboard token={token} />;
      case 'users': return <UsersDashboard token={token} />;
      case 'products': return <ProductsDashboard token={token} />;
      case 'orders': return <OrdersDashboard token={token} />;
      case 'support': return <SupportDashboard token={token} />;
      case 'analytics': return <AnalyticsDashboard token={token} />;
      default: return <StatsDashboard token={token} />;
    }
  };

  return (
    <View className="flex-1 bg-w-200">
      <View className="bg-br p-5 pt-12">
        <Text className="text-3xl font-bold text-w-100">Admin Dashboard</Text>
        <Text className="text-base text-w-100/80 mt-1">System Management</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="bg-w-100 border-b border-g-100 max-h-28"
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`py-4 px-5 items-center border-b-2 ${activeTab === tab.id ? 'border-accent' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text className={`text-xl mb-1 ${activeTab === tab.id ? '' : 'opacity-50'}`}>{tab.icon}</Text>
            <Text className={`text-sm font-semibold ${activeTab === tab.id ? 'text-accent' : 'text-g-300'}`}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-1 p-4">
        {renderContent()}
      </View>
    </View>
  );
};

export default AdminDashboard;