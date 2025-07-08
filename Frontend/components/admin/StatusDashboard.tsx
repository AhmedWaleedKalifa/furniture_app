import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import useFetch from "@/services/useFetch";
import { getSystemStats } from "@/services/api";

interface StatsDashboardProps {
  token: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <View
    className="bg-w-100 rounded-xl p-4 mb-4 w-[48%] border-l-4 shadow-md"
    style={{ borderLeftColor: color }}
  >
    <View className="flex-row items-center mb-2">
      <Text className="text-xl mr-2">{icon}</Text>
      <Text className="text-sm font-semibold text-g-300">{title}</Text>
    </View>
    <Text className="text-2xl font-bold" style={{ color }}>
      {value}
    </Text>
  </View>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ token }) => {
  const {
    data: stats,
    loading,
    error,
    refetch,
  } = useFetch(() => getSystemStats(token), !!token);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-w-200">
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text className="mt-4 text-g-300">Loading statistics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-w-200">
        <Text className="text-base text-red-500 text-center mb-4">
          Error: {error.message}
        </Text>
        <TouchableOpacity
          className="bg-accent py-2 px-5 rounded-lg"
          onPress={refetch}
        >
          <Text className="text-w-100 font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="bg-w-100 rounded-xl p-4 mb-4  ">
        <Text className="text-center text-xl font-bold text-bl">
          System Overview
        </Text>
        <Text className="text-center text-base text-g-300">
          Real-time system statistics
        </Text>
      </View>
      <View className="p-4 flex-row flex-wrap justify-between">
        <StatCard
          title="Total Users"
          value={stats?.data?.users?.total || 0}
          icon="👥"
          color="#007AFF"
        />
        <StatCard
          title="Total Products"
          value={stats?.data?.products?.total || 0}
          icon="🛋️"
          color="#28a745"
        />
        <StatCard
          title="Pending Products"
          value={stats?.data?.products?.pending || 0}
          icon="⏳"
          color="#ffc107"
        />
        <StatCard
          title="Approved Products"
          value={stats?.data?.products?.approved || 0}
          icon="✅"
          color="#17a2b8"
        />
      </View>

      <View className="bg-w-100  mt-0 rounded-xl p-5 shadow-sm">
        <Text className="text-lg font-bold text-bl mb-4">User Breakdown</Text>
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <Text className="text-sm text-g-300 mb-1">Clients</Text>
            <Text className="text-xl font-bold text-accent">
              {stats?.data?.users?.client || 0}
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-sm text-g-300 mb-1">Companies</Text>
            <Text className="text-xl font-bold text-accent">
              {stats?.data?.users?.company || 0}
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-sm text-g-300 mb-1">Admins</Text>
            <Text className="text-xl font-bold text-accent">
              {stats?.data?.users?.admin || 0}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-w-100 rounded-xl p-4 my-8 ">
        <Text className="text-center text-xl font-bold text-bl">
          Engagement Stats
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-between">
        <StatCard
          title="Total Views"
          value={stats?.data?.engagement?.totalViews || 0}
          icon="👁️"
          color="#6f42c1"
        />
        <StatCard
          title="Total Placements"
          value={stats?.data?.engagement?.totalPlacements || 0}
          icon="📱"
          color="#fd7e14"
        />
        <StatCard
          title="Wishlist Items"
          value={stats?.data?.engagement?.totalWishlists || 0}
          icon="❤️"
          color="#e83e8c"
        />
      </View>

      {stats?.data?.recentActivity && (
        <>
          <View className="bg-w-100 rounded-xl p-4 my-8 ">
            <Text className="text-center text-xl font-bold text-bl">
              Recent Activity (7 days)
            </Text>
          </View>
          <View className="flex-row justify-between">
            <StatCard
              title="New Products"
              value={stats.data.recentActivity.newProducts || 0}
              icon="🆕"
              color="#20c997"
            />
            <StatCard
              title="New Users"
              value={stats.data.recentActivity.newUsers || 0}
              icon="👤"
              color="#6610f2"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default StatsDashboard;
