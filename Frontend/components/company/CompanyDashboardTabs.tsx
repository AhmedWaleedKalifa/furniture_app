import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCompanyOnly } from '../../lib/useRoleAcess';
import CompanyProductsDashboard from './CompanyProductDashboard';
import CompanyAnalyticsDashboard from './CompanyAnalyticsDashboard';

const CompanyDashboardTabs = () => {
  const { hasAccess, isLoading } = useCompanyOnly();
  const [activeTab, setActiveTab] = useState('products');

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-w-200">
        <ActivityIndicator size="large" color="#7df9ff" />
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-w-200">
        <Text className="text-2xl font-bold text-red-500 mb-2">Company Access Required</Text>
        <Text className="text-base text-g-300 text-center">You need to be a company to access this section.</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'products', title: 'My Products', icon: '🛋️' },
    { id: 'analytics', title: 'Analytics', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products': return <CompanyProductsDashboard />;
      case 'analytics': return <CompanyAnalyticsDashboard />;
      default: return <CompanyProductsDashboard />;
    }
  };

  return (
    <View className="flex-1 bg-w-200">
      <View className="bg-br p-5 pt-12">
        <Text className="text-3xl font-bold text-w-100">Company Dashboard</Text>
        <Text className="text-base text-w-100/80 mt-1">Manage your business</Text>
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

export default CompanyDashboardTabs;