import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import useFetch from '../../services/useFetch';
import { getAdminTickets } from '../../services/api';
import { SupportTicket } from '../../types';
import { router } from 'expo-router';

interface SupportDashboardProps {
  token: string;
}

const SupportDashboard: React.FC<SupportDashboardProps> = ({ token }) => {
  const { data: tickets, loading, error, refetch } = useFetch(() => getAdminTickets(token), !!token);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'open': return 'bg-blue-500';
        case 'in_progress': return 'bg-yellow-500';
        case 'resolved': return 'bg-green-500';
        case 'closed': return 'bg-g-200';
        default: return 'bg-g-200';
    }
  };

  const getStatusTextColor = (status: string) => {
    return status === 'in_progress' ? 'text-bl' : 'text-w-100';
  }

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      className="bg-w-100 p-4 rounded-xl mb-3 shadow-sm"
      onPress={() => router.push(`/ticket/${item.id}`)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-bold text-bl flex-1 pr-2" numberOfLines={1}>{item.subject}</Text>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className={`text-xs font-bold uppercase ${getStatusTextColor(item.status)}`}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text className="text-sm text-g-300 mb-1">
        User: {item.userName || item.userEmail}
      </Text>
      <Text className="text-xs text-g-200">
        Created: {new Date(item.createdAt as string).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#7df9ff" /></View>;
  }

  if (error) {
    return <Text className="text-red-500 text-center mt-5">Error: {error.message}</Text>;
  }

  return (
    <View className="flex-1">
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<View className="flex-1 justify-center items-center py-10"><Text className="text-base text-g-300">No support tickets found.</Text></View>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default SupportDashboard;