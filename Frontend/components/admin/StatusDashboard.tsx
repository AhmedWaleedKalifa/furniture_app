import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useFetch from '@/services/useFetch';
import { getSystemStats } from '@/services/api';

interface StatsDashboardProps {
  token: string;
}

const StatCard = ({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ token }) => {
  const { data: stats, loading, error, refetch } = useFetch(
    () => getSystemStats(token),
    !!token
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Overview</Text>
        <Text style={styles.headerSubtitle}>Real-time system statistics</Text>
      </View>

      <View style={styles.statsGrid}>
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

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>User Breakdown</Text>
        <View style={styles.userBreakdown}>
          <View style={styles.userTypeCard}>
            <Text style={styles.userTypeLabel}>Clients</Text>
            <Text style={styles.userTypeValue}>{stats?.data?.users?.client || 0}</Text>
          </View>
          <View style={styles.userTypeCard}>
            <Text style={styles.userTypeLabel}>Companies</Text>
            <Text style={styles.userTypeValue}>{stats?.data?.users?.company || 0}</Text>
          </View>
          <View style={styles.userTypeCard}>
            <Text style={styles.userTypeLabel}>Admins</Text>
            <Text style={styles.userTypeValue}>{stats?.data?.users?.admin || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Engagement Stats</Text>
        <View style={styles.engagementStats}>
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
      </View>

      {stats?.data?.recentActivity && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Recent Activity (7 days)</Text>
          <View style={styles.recentActivity}>
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
        </View>
      )}
    </ScrollView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsSection: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  userBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeCard: {
    alignItems: 'center',
    flex: 1,
  },
  userTypeLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  userTypeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  engagementStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentActivity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default StatsDashboard;
