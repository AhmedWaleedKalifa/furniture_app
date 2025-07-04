import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import StatusPicker from '../../components/admin/StatusPicker';
import useFetch from '../../services/useFetch';
import { getAllOrders, updateOrderStatus } from '../../services/api';

interface OrdersDashboardProps {
  token: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  userEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const ORDER_STATUS_OPTIONS = [
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ token }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { data: orders, loading: fetchLoading, error, refetch } = useFetch(
    () => getAllOrders(token),
    !!token
  );

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await updateOrderStatus(token, selectedOrder.id, newOrderStatus, newPaymentStatus);
      Alert.alert('Success', 'Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return '#007AFF';
      case 'shipped':
        return '#ffc107';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>
          Order #{item.orderNumber || item.id.substring(0, 8)}
        </Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.userEmail}>Customer: {item.userEmail}</Text>
        <Text style={styles.orderTotal}>Total: ${item.totalAmount.toFixed(2)}</Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
            <Text style={styles.statusText}>{item.orderStatus.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) }]}>
            <Text style={styles.statusText}>{item.paymentStatus.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.itemsHeader}>Items:</Text>
        {item.items.map((product, index) => (
          <Text key={index} style={styles.itemText}>
            • {product.quantity}x {product.productName} - ${product.unitPrice.toFixed(2)}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => openStatusModal(item)}
      >
        <Text style={styles.updateButtonText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.headerSubtitle}>
          Total Orders: {orders?.length || 0}
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>
              Order #{selectedOrder?.orderNumber || selectedOrder?.id.substring(0, 8)}
            </Text>
            
            <Text style={styles.pickerLabel}>Order Status:</Text>
            <StatusPicker
              selectedValue={newOrderStatus}
              onValueChange={setNewOrderStatus}
              options={ORDER_STATUS_OPTIONS}
              style={styles.pickerContainer}
            />

            <Text style={styles.pickerLabel}>Payment Status:</Text>
            <StatusPicker
              selectedValue={newPaymentStatus}
              onValueChange={setNewPaymentStatus}
              options={PAYMENT_STATUS_OPTIONS}
              style={styles.pickerContainer}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleStatusUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  orderDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  orderInfo: {
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  updateButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default OrdersDashboard;
