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
  createdAt: any; // Allow for Firestore timestamp object
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
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-yellow-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getStatusTextColor = (status: string) => {
    return (status === 'shipped' || status === 'pending') ? 'text-bl' : 'text-w-100';
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <View className="bg-w-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-bl">
          Order #{item.orderNumber || item.id.substring(0, 8)}
        </Text>
        <Text className="text-sm text-g-300">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-accent font-semibold mb-1">Customer: {item.userEmail}</Text>
        <Text className="text-base font-bold text-bl">Total: ${item.totalAmount.toFixed(2)}</Text>
        
        <View className="flex-row mt-2">
          <View className={`px-2 py-1 rounded-full mr-2 ${getStatusColor(item.orderStatus)}`}>
            <Text className={`text-xs font-bold uppercase ${getStatusTextColor(item.orderStatus)}`}>{item.orderStatus.replace('_', ' ')}</Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${getStatusColor(item.paymentStatus)}`}>
            <Text className={`text-xs font-bold uppercase ${getStatusTextColor(item.paymentStatus)}`}>{item.paymentStatus}</Text>
          </View>
        </View>

        <Text className="text-sm font-semibold text-bl mt-3 mb-1">Items:</Text>
        {item.items.map((product, index) => (
          <Text key={index} className="text-sm text-g-300">
            • {product.quantity}x {product.productName} - ${product.unitPrice.toFixed(2)}
          </Text>
        ))}
      </View>

      <TouchableOpacity
  className="bg-accent/20 py-2 px-4 rounded-lg self-start"
  onPress={() => openStatusModal(item)}
>
  <Text className="text-accent font-semibold">Update Status</Text>
</TouchableOpacity>
    </View>
  );

  if (fetchLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text className="mt-4 text-g-300">Loading orders...</Text>
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
    <View className="flex-1">
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-base text-g-300">No orders found</Text>
          </View>
        }
      />

      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-5">
          <View className="bg-w-100 rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center text-bl mb-2">Update Order Status</Text>
            <Text className="text-base text-g-300 text-center mb-5">
              Order #{selectedOrder?.orderNumber || selectedOrder?.id.substring(0, 8)}
            </Text>
            
            <Text className="text-base font-semibold text-bl mb-2">Order Status:</Text>
            <StatusPicker
              selectedValue={newOrderStatus}
              onValueChange={setNewOrderStatus}
              options={ORDER_STATUS_OPTIONS}
              style={{marginBottom: 16}}
            />

            <Text className="text-base font-semibold text-bl mb-2">Payment Status:</Text>
            <StatusPicker
              selectedValue={newPaymentStatus}
              onValueChange={setNewPaymentStatus}
              options={PAYMENT_STATUS_OPTIONS}
              style={{marginBottom: 24}}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 mr-2 bg-g-100 py-3 rounded-lg items-center"
                onPress={() => setShowStatusModal(false)}
              >
                <Text className="text-bl font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 ml-2 bg-br py-3 rounded-lg items-center"
                onPress={handleStatusUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#7df9ff" size="small" />
                ) : (
                  <Text className="text-w-100 font-bold">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrdersDashboard;