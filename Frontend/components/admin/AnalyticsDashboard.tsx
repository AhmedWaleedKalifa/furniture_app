import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
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

  const { topProducts = [], engagementTrends = {}, period = '30 days' } = analytics?.data || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>Last {period}</Text>
      </View>

      {/* Engagement Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{engagementTrends.totalViews || 0}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{engagementTrends.totalPlacements || 0}</Text>
            <Text style={styles.statLabel}>AR Placements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{engagementTrends.totalWishlists || 0}</Text>
            <Text style={styles.statLabel}>Wishlist Adds</Text>
          </View>
        </View>

        <View style={styles.averagesGrid}>
          <View style={styles.averageCard}>
            <Text style={styles.averageValue}>{engagementTrends.averageViews || 0}</Text>
            <Text style={styles.averageLabel}>Avg Views/Product</Text>
          </View>
          <View style={styles.averageCard}>
            <Text style={styles.averageValue}>{engagementTrends.averagePlacements || 0}</Text>
            <Text style={styles.averageLabel}>Avg Placements/Product</Text>
          </View>
          <View style={styles.averageCard}>
            <Text style={styles.averageValue}>{engagementTrends.averageWishlists || 0}</Text>
            <Text style={styles.averageLabel}>Avg Wishlist/Product</Text>
          </View>
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products by Views</Text>
        {topProducts.length > 0 ? (
          topProducts.map((product: any, index: number) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productViews}>{product.views || 0} views</Text>
              </View>
              <View style={styles.productStats}>
                <Text style={styles.productStat}>👁️ {product.views || 0}</Text>
                <Text style={styles.productStat}>📱 {product.placements || 0}</Text>
                <Text style={styles.productStat}>❤️ {product.wishlistCount || 0}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No product data available</Text>
          </View>
        )}
      </View>
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
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  averagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageCard: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  averageLabel: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  productRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  productViews: {
    fontSize: 14,
    color: '#6c757d',
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productStat: {
    fontSize: 12,
    marginLeft: 8,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default AnalyticsDashboard;
