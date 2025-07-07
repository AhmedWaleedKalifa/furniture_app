import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Button,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchFurnitureDetails,
  createOrder,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
} from "@/services/api";
import useFetch from "@/services/useFetch";
import { useAuth } from "@/context/AuthContext";
import { ProductDetails } from "@/types/index";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [newSelectedImage, setNewSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [modelFile, setModelFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const {
    data: furniture,
    loading,
    refetch,
  } = useFetch<ProductDetails>(
    () => fetchFurnitureDetails(productId!),
    !!productId
  );
  const {
    wishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    user,
    token,
    triggerGlobalRefresh,
  } = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit form state
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    thumbnailUrl: "",
    modelUrl: "",
    dimensions: { width: "", height: "", depth: "" },
    tags: "",
  });
  const imageUri =
    newSelectedImage && newSelectedImage.uri
      ? newSelectedImage.uri
      : formState.thumbnailUrl && formState.thumbnailUrl !== ""
      ? formState.thumbnailUrl
      : null;
  const [formLoading, setFormLoading] = useState(false);

  React.useEffect(() => {
    if (editModalVisible && furniture) {
      setFormState({
        name: furniture.name || "",
        description: furniture.description || "",
        price: String(furniture.price ?? ""),
        category: furniture.category || "",
        thumbnailUrl: furniture.thumbnailUrl || "",
        modelUrl: furniture.modelUrl || "",
        dimensions: {
          width: String(furniture.dimensions?.width ?? ""),
          height: String(furniture.dimensions?.height ?? ""),
          depth: String(furniture.dimensions?.depth ?? ""),
        },
        tags: (furniture.tags || []).join(", "),
      });
      setNewSelectedImage(null);
    }
  }, [editModalVisible, furniture]);
  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to upload a new image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewSelectedImage(result.assets[0]);
    }
  };
  const handleModelPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/octet-stream",
          "model/gltf-binary",
          "application/zip",
          "model/gltf+json",
          "model/fbx",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setModelFile(result.assets[0]);
      }
    } catch (error: any) {
      Alert.alert(
        "Model File Error",
        error.message || "Could not pick model file."
      );
    }
  };
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

  const handleOrderProduct = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!furniture?.isApproved) {
      Alert.alert(
        "Not Available",
        "This product is not yet available for purchase."
      );
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
              };
              await createOrder(token, orderData);
              triggerGlobalRefresh();
              Alert.alert("Success", "Order placed successfully!");
              router.push("/(tabs)/orders");
            } catch (error: any) {
              Alert.alert(
                "Order Failed",
                error.message || "Could not place order."
              );
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

  const handleRejectSubmit = async () => {
    if (!token || !furniture || !rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection.");
      return;
    }
    setIsActionLoading(true);
    try {
      await rejectProduct(token, furniture.id, rejectionReason);
      Alert.alert("Success", "Product has been rejected.");
      triggerGlobalRefresh();
      setRejectModalVisible(false);
      setRejectionReason("");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject product.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = () => {
    if (!token || !furniture) return;
    Alert.alert(
      "Delete Product",
      `Are you sure you want to permanently delete "${furniture.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading(true);
            try {
              await deleteProduct(token, furniture.id);
              Alert.alert("Success", "Product has been deleted.");
              triggerGlobalRefresh();
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete product."
              );
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (
    field: "width" | "height" | "depth",
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value },
    }));
  };

  const handleEditFormSubmit = async () => {
    setFormLoading(true);
    try {
      if (!token || !furniture?.id)
        throw new Error("Authentication error. Please log in again.");
  
      const formData = new FormData();
  
      // Append text/json fields
      formData.append("name", formState.name);
      formData.append("description", formState.description);
      formData.append("price", formState.price);
      formData.append("category", formState.category);
  
      // Do NOT send modelUrl directly if updating via file; backend will set this
      // Only include modelUrl if you want to allow direct URL update (rare)
      // formData.append("modelUrl", formState.modelUrl);
  
      const dimensions = {
        width: parseFloat(formState.dimensions.width) || 0,
        height: parseFloat(formState.dimensions.height) || 0,
        depth: parseFloat(formState.dimensions.depth) || 0,
        unit: furniture.dimensions?.unit || "cm",
      };
      formData.append("dimensions", JSON.stringify(dimensions));
  
      const tagsArray = formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));
  
      // Conditionally append the new image file
      if (newSelectedImage) {
        const uriParts = newSelectedImage.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        // @ts-ignore
        formData.append("thumbnail", {
          uri: newSelectedImage.uri,
          name: `thumbnail.${fileType}`,
          type: newSelectedImage.mimeType || `image/${fileType}`,
        });
      }
  
      // Conditionally append the new 3D model file
      // @ts-ignore
      if (modelFile) {
        formData.append("modelFile", {
          uri: modelFile.uri,
          name: modelFile.name || "model.glb",
          type: modelFile.mimeType || "application/octet-stream",
        }as any);
      }
  
      await updateProduct(token, furniture.id, formData);
  
      Alert.alert("Success", "Product updated successfully!");
      setEditModalVisible(false);
      refetch();
      triggerGlobalRefresh();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update product.");
    } finally {
      setFormLoading(false);
    }
  };
  
  const renderRoleSpecificActions = () => {
    if (!user || !furniture) return <View />;
    switch (user.role) {
      case "client":
        const isWishlisted = (wishlist || []).some(
          (item) => item.productId === furniture.id
        );
        return (
          <View>
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
                  {
                    backgroundColor:
                      !furniture.isApproved || isOrdering
                        ? "#a3a3a3"
                        : "#1e293b",
                  },
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
          </View>
        );
      case "company":
        if (user.uid === furniture.companyId) {
          return (
            <View style={styles.companyAction}>
              <TouchableOpacity
                className="bg-accent p-4 rounded-lg items-center"
                onPress={() => setEditModalVisible(true)}
              >
                <Text className="text-white font-bold text-base">
                  Edit Product Details
                </Text>
              </TouchableOpacity>
              <Modal
                visible={editModalVisible}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
                transparent={false}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  className="flex-1"
                >
                  <ScrollView
                    className="flex-1 bg-w-200 p-5 pt-16"
                    contentContainerStyle={{ paddingBottom: 40 }}
                  >
                    <Text className="text-2xl font-bold text-bl mb-6">
                      Edit Product
                    </Text>
                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Name
                    </Text>
                    <TextInput
                      placeholder="Product Name"
                      value={formState.name}
                      onChangeText={(t) => handleFormChange("name", t)}
                      className="bg-g-100 p-3 rounded-lg mb-3"
                    />
                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Description
                    </Text>
                    <TextInput
                      placeholder="Description"
                      value={formState.description}
                      onChangeText={(t) => handleFormChange("description", t)}
                      className="bg-g-100 p-3 rounded-lg mb-3 h-24"
                      multiline
                    />
                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Price
                    </Text>
                    <TextInput
                      placeholder="Price"
                      value={formState.price}
                      onChangeText={(t) => handleFormChange("price", t)}
                      className="bg-g-100 p-3 rounded-lg mb-3"
                      keyboardType="numeric"
                    />
                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Category
                    </Text>
                    <TextInput
                      placeholder="Category"
                      value={formState.category}
                      onChangeText={(t) => handleFormChange("category", t)}
                      className="bg-g-100 p-3 rounded-lg mb-3"
                    />

                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Thumbnail Image
                    </Text>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                      <View>
                        <Text>No Image</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={handleImagePick}
                      className="bg-g-200 p-3 rounded-lg mb-3 items-center"
                    >
                      <Text className="text-bl font-semibold">
                        Change Image
                      </Text>
                    </TouchableOpacity>

                    <Button
                      title="Pick New 3D Model"
                      onPress={handleModelPick}
                    />
                    {modelFile && (
                      <Text style={{ marginTop: 8 }}>
                        Selected Model: {modelFile.name}
                      </Text>
                    )}
                    <Text className="text-bl font-semibold mb-2 mt-2">
                      Tags (comma-separated)
                    </Text>
                    <TextInput
                      placeholder="e.g. modern, leather, cozy"
                      value={formState.tags}
                      onChangeText={(t) => handleFormChange("tags", t)}
                      className="bg-g-100 p-3 rounded-lg mb-3"
                    />
                    <Text className="text-bl font-semibold mt-4 mb-2">
                      Dimensions ({furniture.dimensions?.unit || "cm"})
                    </Text>
                    <View className="flex-row gap-x-2">
                      <TextInput
                        placeholder="Width"
                        value={formState.dimensions.width}
                        onChangeText={(t) => handleDimensionChange("width", t)}
                        className="bg-g-100 p-3 rounded-lg mb-3 flex-1"
                        keyboardType="numeric"
                      />
                      <TextInput
                        placeholder="Height"
                        value={formState.dimensions.height}
                        onChangeText={(t) => handleDimensionChange("height", t)}
                        className="bg-g-100 p-3 rounded-lg mb-3 flex-1"
                        keyboardType="numeric"
                      />
                      <TextInput
                        placeholder="Depth"
                        value={formState.dimensions.depth}
                        onChangeText={(t) => handleDimensionChange("depth", t)}
                        className="bg-g-100 p-3 rounded-lg mb-3 flex-1"
                        keyboardType="numeric"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleEditFormSubmit}
                      className="bg-br p-4 rounded-lg mt-4"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-w-100 text-center font-bold">
                          Save Changes
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      className="bg-g-200 p-4 rounded-lg mt-2"
                    >
                      <Text className="text-bl text-center font-bold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </KeyboardAvoidingView>
              </Modal>
            </View>
          );
        }
        return <View />;
      case "admin":
        return (
          <View>
            {!furniture.isApproved && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={handleApprove}
                  disabled={isActionLoading}
                  style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRejectModalVisible(true)}
                  disabled={isActionLoading}
                  style={[styles.actionButton, { backgroundColor: "#f59e42" }]}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isActionLoading}
                className="bg-red-600 p-4 rounded-lg items-center"
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Delete Product Permanently
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return <View />;
    }
  };

  const renderRejectModal = () => (
    <Modal
      visible={rejectModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setRejectModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reject Product</Text>
          <Text style={styles.modalSubtitle}>{furniture?.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={styles.confirmRejectButton}
            onPress={handleRejectSubmit}
            disabled={isActionLoading || !rejectionReason.trim()}
          >
            <Text style={styles.actionButtonText}>
              {isActionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                "Confirm Reject"
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setRejectModalVisible(false)}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
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
            Status:{" "}
            {furniture?.isApproved
              ? "Available for Purchase"
              : "Pending Approval"}
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
                Height: {furniture.dimensions.height}{" "}
                {furniture.dimensions.unit}
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
      {renderRejectModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 256 },
  details: { paddingHorizontal: 24, paddingVertical: 24 },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  statusBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  statusText: { fontWeight: "bold" },
  description: { color: "#64748b", marginBottom: 16 },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f59e42",
    marginBottom: 16,
  },
  categoryBox: { marginBottom: 16 },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  categoryText: { color: "#64748b" },
  dimensionsBox: { marginBottom: 24 },
  dimensionsRow: { flexDirection: "row", justifyContent: "space-between" },
  seeInRoomButton: {
    marginHorizontal: 24,
    marginVertical: 12,
    backgroundColor: "#f59e42",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
  companyAction: { paddingHorizontal: 24, marginTop: 16, marginBottom: 12 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: { fontSize: 18, color: "#64748b" },
  goBackButton: {
    marginTop: 24,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  goBackButtonBottom: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  goBackText: { color: "#1e293b", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  confirmRejectButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default FurnitureDetails;
