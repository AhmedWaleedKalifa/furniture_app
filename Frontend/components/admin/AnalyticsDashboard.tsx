import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import useFetch from '../../services/useFetch';
import { getProductAnalytics } from '../../services/api';

interface AnalyticsDashboardProps {
  token: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ token }) => {
  const { data: analytics, loading, error } = useFetch(
    () => getProductAnalytics(token),
    !!token
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text className="mt-4 text-g-300">Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-red-500 text-center">Error: {error.message}</Text>
      </View>
    );
  }

  const { topProducts = [], engagementTrends = {}, period = '30 days' } = analytics?.data || {};

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-5 bg-w-100 border-b border-g-100">
        <Text className="text-2xl font-bold text-bl">Analytics Dashboard</Text>
        <Text className="text-base text-g-300 mt-1">Last {period}</Text>
      </View>

      <View className="bg-w-100 m-4 rounded-xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-bl mb-4">Engagement Overview</Text>
        <View className="flex-row justify-around mb-5">
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-accent mb-1">{engagementTrends.totalViews || 0}</Text>
            <Text className="text-xs text-g-300 text-center">Total Views</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-accent mb-1">{engagementTrends.totalPlacements || 0}</Text>
            <Text className="text-xs text-g-300 text-center">AR Placements</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-accent mb-1">{engagementTrends.totalWishlists || 0}</Text>
            <Text className="text-xs text-g-300 text-center">Wishlist Adds</Text>
          </View>
        </View>

        <View className="flex-row justify-around">
          <View className="items-center flex-1 bg-g-100 p-3 rounded-lg mx-1">
            <Text className="text-base font-bold text-green-600 mb-1">{engagementTrends.averageViews || 0}</Text>
            <Text className="text-xs text-g-300 text-center">Avg Views/Product</Text>
          </View>
          <View className="items-center flex-1 bg-g-100 p-3 rounded-lg mx-1">
            <Text className="text-base font-bold text-green-600 mb-1">{engagementTrends.averagePlacements || 0}</Text>
            <Text className="text-xs text-g-300 text-center">Avg Placements/Product</Text>
          </View>
          <View className="items-center flex-1 bg-g-100 p-3 rounded-lg mx-1">
            <Text className="text-base font-bold text-green-600 mb-1">{engagementTrends.averageWishlists || 0}</Text>
            <Text className="text-xs text-g-300 text-center">Avg Wishlist/Product</Text>
          </View>
        </View>
      </View>

      {/* Top Products */}
      <View className="bg-w-100 m-4 rounded-xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-bl mb-4">Top Products by Views</Text>
        {topProducts.length > 0 ? (
          topProducts.map((product: any, index: number) => (
            <View key={product.id} className="flex-row items-center py-3 border-b border-g-100">
              <View className="w-10 items-center">
                <Text className="text-base font-bold text-accent">#{index + 1}</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-bl mb-1" numberOfLines={1}>{product.name}</Text>
                <Text className="text-sm text-g-300">{product.views || 0} views</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-g-300 ml-2">👁️ {product.views || 0}</Text>
                <Text className="text-xs text-g-300 ml-2">📱 {product.placements || 0}</Text>
                <Text className="text-xs text-g-300 ml-2">❤️ {product.wishlistCount || 0}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center py-5">
            <Text className="text-base text-g-300">No product data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboard;