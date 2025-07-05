import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchFurnitureDetails,
  createOrder,
  approveProduct,
  rejectProduct,
  updateProduct,
} from "@/services/api";
import useFetch from "@/services/useFetch";
import { useAuth } from "@/context/AuthContext";
import { ProductDetails } from "@/types/index";

const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { data: furniture, loading, refetch } = useFetch<ProductDetails>(
    () => fetchFurnitureDetails(productId!),
    !!productId
  );
  const { wishlist, addItemToWishlist, removeItemFromWishlist, user, token, triggerGlobalRefresh } = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    thumbnailUrl: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  React.useEffect(() => {
    if (editModalVisible && furniture) {
      setForm({
        name: furniture.name || "",
        description: furniture.description || "",
        price: String(furniture.price ?? ""),
        category: furniture.category || "",
        thumbnailUrl: furniture.thumbnailUrl || "",
      });
    }
  }, [editModalVisible, furniture]);

  const handleWishlistToggle = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!furniture) return;
    if (wishlist.some((item) => item.productId === furniture.id)) {
      removeItemFromWishlist(furniture.id);
    } else {
      addItemToWishlist(furniture);
    }
  };

  // --- ORDER CREATION LOGIC MATCHING YOUR SCHEMA ---
  const handleOrderProduct = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!furniture?.isApproved) {
      Alert.alert("Not Available", "This product is not yet available for purchase.");
      return;
    }
    Alert.alert(
      "Confirm Order",
      `Are you sure you want to order ${furniture?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Order",
          onPress: async () => {
            if (!token || !furniture) return;
            setIsOrdering(true);
            try {
              // Build the order item as required by your schema
              const orderItem = {
                productId: furniture.id,
                productName: furniture.name,
                productPrice: furniture.price,
                quantity: 1,
              };
              const totalAmount = orderItem.productPrice * orderItem.quantity;
              const orderData = {
                items: [orderItem],
                totalAmount,
                totalPrice: totalAmount,
                // orderStatus, paymentStatus, createdAt, orderNumber are set by backend
              };
              await createOrder(token, orderData);
              triggerGlobalRefresh();
              Alert.alert("Success", "Order placed successfully!");
              router.push("/(tabs)/orders");
            } catch (error: any) {
              Alert.alert("Order Failed", error.message || "Could not place order.");
            } finally {
              setIsOrdering(false);
            }
          },
        },
      ]
    );
  };

  const handleApprove = async () => {
    if (!token || !furniture) return;
    setIsActionLoading(true);
    try {
      await approveProduct(token, furniture.id);
      Alert.alert("Success", "Product has been approved.");
      triggerGlobalRefresh();
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to approve product.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!token || !furniture) return;
    Alert.prompt(
      "Reject Product",
      "Please provide a reason for rejection.",
      async (reason) => {
        if (reason) {
          setIsActionLoading(true);
          try {
            await rejectProduct(token, furniture.id, reason);
            Alert.alert("Success", "Product has been rejected.");
            triggerGlobalRefresh();
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to reject product.");
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    );
  };

  const handleEditFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormSubmit = async () => {
    setFormLoading(true);
    try {
      if (!token || !furniture?.id) {
        Alert.alert("Error", "Missing authentication or product information.");
        return;
      }
      await updateProduct(token, furniture.id, {
        ...form,
        price: parseFloat(form.price),
      });
      Alert.alert("Success", "Product updated successfully!");
      setEditModalVisible(false);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update product.");
    } finally {
      setFormLoading(false);
    }
  };

  const renderRoleSpecificActions = () => {
    if (!user || !furniture) return null;
    switch (user.role) {
      case "client":
        const isWishlisted = (wishlist || []).some((item) => item.productId === furniture.id);
        return (
          <>
            <TouchableOpacity
              onPress={() => {
                Alert.alert("At room");
              }}
              style={styles.seeInRoomButton}
            >
              <Text>See in my room</Text>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleWishlistToggle}
                style={[
                  styles.actionButton,
                  { backgroundColor: isWishlisted ? "#ef4444" : "#007bff" },
                ]}
              >
                <Text style={styles.actionButtonText}>
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOrderProduct}
                style={[
                  styles.actionButton,
                  { backgroundColor: !furniture.isApproved || isOrdering ? "#a3a3a3" : "#1e293b" },
                ]}
                disabled={!furniture.isApproved || isOrdering}
              >
                {isOrdering ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {furniture.isApproved ? "Order Now" : "Unavailable"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        );
      case "company":
        if (user.uid === furniture.companyId) {
          return (
            <View style={styles.companyAction}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.editButtonText}>Edit Product</Text>
              </TouchableOpacity>
              <Modal
                visible={editModalVisible}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
                transparent={false}
              >
                <ScrollView contentContainerStyle={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Product</Text>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(v) => handleEditFormChange("name", v)}
                    placeholder="Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={form.description}
                    onChangeText={(v) => handleEditFormChange("description", v)}
                    placeholder="Description"
                  />
                  <TextInput
                    style={styles.input}
                    value={form.price}
                    onChangeText={(v) => handleEditFormChange("price", v)}
                    placeholder="Price"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    value={form.category}
                    onChangeText={(v) => handleEditFormChange("category", v)}
                    placeholder="Category"
                  />
                  <TextInput
                    style={styles.input}
                    value={form.thumbnailUrl}
                    onChangeText={(v) => handleEditFormChange("thumbnailUrl", v)}
                    placeholder="Image URL"
                  />
                  <Button title="Save Changes" onPress={handleEditFormSubmit} disabled={formLoading} />
                  <Button title="Cancel" color="red" onPress={() => setEditModalVisible(false)} />
                </ScrollView>
              </Modal>
            </View>
          );
        }
        return null;
      case "admin":
        if (!furniture.isApproved) {
          return (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleApprove}
                disabled={isActionLoading}
                style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Approve</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                disabled={isActionLoading}
                style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!furniture) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: furniture?.thumbnailUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.productName}>{furniture?.name}</Text>
        <View style={styles.statusBox}>
          <Text
            style={[
              styles.statusText,
              { color: furniture?.isApproved ? "#16a34a" : "#eab308" },
            ]}
          >
            Status: {furniture?.isApproved ? "Available for Purchase" : "Pending Approval"}
          </Text>
        </View>
        <Text style={styles.description}>{furniture?.description}</Text>
        <Text style={styles.price}>${furniture?.price}</Text>
        <View style={styles.categoryBox}>
          <Text style={styles.categoryLabel}>Category</Text>
          <Text style={styles.categoryText}>{furniture?.category}</Text>
        </View>
        {furniture?.dimensions && (
          <View style={styles.dimensionsBox}>
            <Text style={styles.categoryLabel}>Dimensions</Text>
            <View style={styles.dimensionsRow}>
              <Text style={styles.categoryText}>
                Width: {furniture.dimensions.width} {furniture.dimensions.unit}
              </Text>
              <Text style={styles.categoryText}>
                Height: {furniture.dimensions.height} {furniture.dimensions.unit}
              </Text>
              <Text style={styles.categoryText}>
                Depth: {furniture.dimensions.depth} {furniture.dimensions.unit}
              </Text>
            </View>
          </View>
        )}
      </View>
      {renderRoleSpecificActions()}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.goBackButtonBottom}
      >
        <Text style={styles.goBackText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 256 },
  details: { paddingHorizontal: 24, paddingVertical: 24 },
  productName: { fontSize: 24, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  statusBox: { marginBottom: 16, padding: 12, backgroundColor: "#f3f4f6", borderRadius: 8 },
  statusText: { fontWeight: "bold" },
  description: { color: "#64748b", marginBottom: 16 },
  price: { fontSize: 28, fontWeight: "bold", color: "#f59e42", marginBottom: 16 },
  categoryBox: { marginBottom: 16 },
  categoryLabel: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  categoryText: { color: "#64748b" },
  dimensionsBox: { marginBottom: 24 },
  dimensionsRow: { flexDirection: "row", justifyContent: "space-between" },
  seeInRoomButton: { margin: 20, backgroundColor: "#f59e42", padding: 16, borderRadius: 8, alignItems: "center" },
  actionRow: { flexDirection: "row", gap: 12, paddingHorizontal: 24, marginTop: 24 },
  actionButton: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
  companyAction: { paddingHorizontal: 24, marginTop: 24 },
  editButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 16 },
  editButtonText: { color: "#fff", fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  notFoundText: { fontSize: 18, color: "#64748b" },
  goBackButton: { marginTop: 24, backgroundColor: "#f3f4f6", padding: 12, borderRadius: 8, alignItems: "center" },
  goBackButtonBottom: { marginHorizontal: 24, marginBottom: 24, backgroundColor: "#f3f4f6", padding: 16, borderRadius: 8, alignItems: "center" },
  goBackText: { color: "#1e293b", fontWeight: "bold" },
  modalContent: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9f9f9" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginBottom: 12, backgroundColor: "#fff" },
});

export default FurnitureDetails;
