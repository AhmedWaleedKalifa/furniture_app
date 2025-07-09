import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import useFetch from '../../services/useFetch';
import { getCompanyAnalytics } from '../../services/api';
import { useAuth } from '@/context/AuthContext';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View className="bg-w-100 rounded-xl p-4 mb-4 w-[48%] border-l-4 shadow-md" style={{ borderLeftColor: color }}>
      <View className="flex-row items-center mb-2">
        <Text className="text-xl mr-2">{icon}</Text>
        <Text className="text-sm font-semibold text-g-300">{title}</Text>
      </View>
      <Text className="text-2xl font-bold" style={{ color: color }}>{value}</Text>
    </View>
);

const CompanyAnalyticsDashboard = () => {
    const { token } = useAuth();
    const { data, loading, error, refetch } = useFetch(() => getCompanyAnalytics(token!), !!token);
    const analytics = data?.data;

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
            <Text className="text-base text-red-500 text-center mb-4">Error: {error.message}</Text>
            <TouchableOpacity className="bg-accent py-2 px-5 rounded-lg" onPress={refetch}>
              <Text className="text-w-100 font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        );
    }

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4 flex-row flex-wrap justify-between">
                <StatCard title="Total Views" value={analytics?.totalViews || 0} icon="👁️" color="#007AFF" />
                <StatCard title="AR Placements" value={analytics?.totalPlacements || 0} icon="📱" color="#28a745" />
                <StatCard title="Wishlist Adds" value={analytics?.totalWishlists || 0} icon="❤️" color="#e83e8c" />
            </View>

            <View className="bg-w-100 mx-4 rounded-xl p-5 shadow-sm">
                <Text className="text-lg font-bold text-bl mb-4">Top Products by Views</Text>
                {analytics?.topProductsByViews && analytics.topProductsByViews.length > 0 ? (
                    analytics.topProductsByViews.map((product: any, index: number) => (
                        <View key={product.id} className="flex-row items-center py-3 border-b border-g-100">
                            <View className="w-10 items-center">
                                <Text className="text-base font-bold text-accent">#{index + 1}</Text>
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-base font-semibold text-bl mb-1" numberOfLines={1}>{product.name}</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-xs text-g-300 mr-3">👁️ {product.views || 0}</Text>
                                    <Text className="text-xs text-g-300 mr-3">📱 {product.placements || 0}</Text>
                                    <Text className="text-xs text-g-300">❤️ {product.wishlistCount || 0}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="items-center py-5">
                        <Text className="text-base text-g-300">No product data available yet.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default CompanyAnalyticsDashboard;