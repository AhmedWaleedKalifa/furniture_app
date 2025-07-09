import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native";
import useFetch from "@/services/useFetch";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

interface ProductsDashboardProps {
  token: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  isApproved: boolean;
  companyId: string;
  company?: {
    displayName: string;
  };
  createdAt: string;
}
const ProductsDashboard: React.FC<ProductsDashboardProps> = ({ token }) => {
  // FIX: Get the global refresh trigger from the auth context
  const { triggerGlobalRefresh } = useAuth();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [productToReject, setProductToReject] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    data: products,
    loading: fetchLoading,
    error,
    refetch,
  } = useFetch(() => getPendingProducts(token), !!token);

  const handleApprove = async (productId: string) => {
    try {
      setLoading(true);
      await approveProduct(token, productId);
      Alert.alert("Success", "Product approved successfully");
      refetch(); // Refreshes this component's list
      triggerGlobalRefresh(); // FIX: Notifies the rest of the app to refresh
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!productToReject || !rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      await rejectProduct(token, productToReject.id, rejectionReason);
      Alert.alert("Success", "Product rejected successfully");
      refetch();
      setRejectModalVisible(false);
      setRejectionReason("");
      triggerGlobalRefresh(); // FIX: Notifies the rest of the app to refresh
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(token, product.id);
              Alert.alert("Success", "Product deleted successfully");
              refetch();
              triggerGlobalRefresh(); // FIX: Notifies the rest of the app to refresh
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openRejectModal = (product: Product) => {
    setProductToReject(product);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.productImage}
        defaultSource={require("@/assets/images/placeholder.png")}
      />

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.productCompany}>
          By: {item.company?.displayName || "Unknown Company"}
        </Text>
        <Text style={styles.productDate}>
          Created:{" "}
          {item.createdAt &&
          typeof item.createdAt === "object" &&
          item.createdAt._seconds
            ? new Date(item.createdAt._seconds * 1000).toLocaleDateString()
            : item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "N/A"}
        </Text>
      </View>

      <View className="flex-row justify-end space-x-2 mt-4 gap-2">
        <TouchableOpacity
className="bg-green-500/20 py-2 px-3 rounded-lg"          onPress={() => handleApprove(item.id)}
          disabled={loading}
        >
          <Text className=" text-green-700 font-semibold">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
 className="bg-yellow-500/20 py-2 px-3 rounded-lg"          onPress={() => openRejectModal(item)}
          disabled={loading}
        >
          <Text className="text-yellow-700 font-semibold">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
className="bg-red-500/20  py-2 px-3 rounded-lg"          onPress={() => handleDelete(item)}
          disabled={loading}
        >
          <Text className="text-red-600 font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text style={styles.loadingText}>Loading products...</Text>
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
        <Text style={styles.headerTitle}>Product Management</Text>
        <Text style={styles.headerSubtitle}>
          Pending Products: {products?.length || 0}
        </Text>
      </View>

      <FlatList
        data={products || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending products</Text>
          </View>
        }
      />

      {/* Reject Modal */}
      <Modal visible={isRejectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Product</Text>
            <Text style={styles.modalSubtitle}>
              {productToReject?.name || ''}
             </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason("");
                  setProductToReject(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.rejectConfirmButton,
                  !rejectionReason.trim() && styles.disabledButton,
                ]}
                onPress={handleReject}
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="7df9ff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Reject</Text>
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
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 4,
  },
  productCompany: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: "#6c757d",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
  },
  approveButton: {
    backgroundColor: "#28a745",
  },
  rejectButton: {
    backgroundColor: "#fd7e14",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    height: 80,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  rejectConfirmButton: {
    backgroundColor: "#dc3545",
  },
  confirmButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
  },
});

export default ProductsDashboard;
