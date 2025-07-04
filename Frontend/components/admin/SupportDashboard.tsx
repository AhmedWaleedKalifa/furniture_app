import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useFetch from '../../services/useFetch';
import { getAdminTickets } from '../../services/api'; // Use the new admin-specific function
import { SupportTicket } from '../../types';
import { router } from 'expo-router';

interface SupportDashboardProps {
  token: string;
}

const SupportDashboard: React.FC<SupportDashboardProps> = ({ token }) => {
  const { data: tickets, loading, error, refetch } = useFetch(() => getAdminTickets(token), !!token);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'open': return '#007AFF';
        case 'in_progress': return '#ffc107';
        case 'resolved': return '#28a745';
        case 'closed': return '#6c757d';
        default: return '#6c757d';
    }
  };

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => router.push(`/ticket/${item.id}`)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.ticketInfo}>
        User: {item.userName || item.userEmail}
      </Text>
      <Text style={styles.ticketDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No support tickets found.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  ticketCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default SupportDashboard;