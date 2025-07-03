import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProductsDashboard from '../../components/admin/ProductsDashboard';
import OrdersDashboard from '../../components/admin/OrdersDashboard';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import StatsDashboard from './StatusDashboard';
import UsersDashboard from './UserDashboard';
import { useAdminOnly } from '../../lib/useRoleAcess';

const AdminDashboard = () => {
  const { token } = useAuth();
  const { hasAccess, isLoading } = useAdminOnly();
  const [activeTab, setActiveTab] = useState('stats');
 // return <Text>Admin Dashboard Works!</Text>;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.accessContainer}>
        <Text style={styles.accessText}>Admin Access Required</Text>
        <Text style={styles.accessSubtext}>You need admin privileges to access this section.</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'stats', title: 'Dashboard', icon: '📊' },
    { id: 'users', title: 'Users', icon: '👥' },
    { id: 'products', title: 'Products', icon: '🛋️' },
    { id: 'orders', title: 'Orders', icon: '📦' },
    { id: 'analytics', title: 'Analytics', icon: '📈' },
  ];

  const renderContent = () => {
    if (!token) return <Text style={styles.errorText}>Authentication required</Text>;
    
    switch (activeTab) {
      case 'stats': return <StatsDashboard token={token} />;
      case 'users': return <UsersDashboard token={token} />;
      case 'products': return <ProductsDashboard token={token} />;
      case 'orders': return <OrdersDashboard token={token} />;
      case 'analytics': return <AnalyticsDashboard token={token} />;
      default: return <StatsDashboard token={token} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>System Management</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  accessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  accessText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  accessSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabContent: {
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    margin: 20,
  },
});

export default AdminDashboard;
