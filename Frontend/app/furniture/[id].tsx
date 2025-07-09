// import React, { useState } from "react";
// import {
//   ScrollView,
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import {
//   fetchFurnitureDetails,
//   createOrder,
//   approveProduct,
//   rejectProduct,
//   updateProduct,
//   deleteProduct,
// } from "@/services/api";
// import useFetch from "@/services/useFetch";
// import { useAuth } from "@/context/AuthContext";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";
// import ModelViewer from "@/components/ModelViewer";
// import { ProductDetails } from "@/types";
// import Model from "@/components/ModelViewer";

// const FurnitureDetails = () => {
//   const { id } = useLocalSearchParams();
//   const productId = Array.isArray(id) ? id[0] : id;

//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [rejectModalVisible, setRejectModalVisible] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [newSelectedImage, setNewSelectedImage] =
//     useState<ImagePicker.ImagePickerAsset | null>(null);
//   const [modelFile, setModelFile] =
//     useState<DocumentPicker.DocumentPickerAsset | null>(null);
//   const {
//     data: furniture,
//     loading,
//     refetch,
//   } = useFetch<ProductDetails>(
//     () => fetchFurnitureDetails(productId!),
//     !!productId
//   );
//   const {
//     wishlist,
//     addItemToWishlist,
//     removeItemFromWishlist,
//     user,
//     token,
//     triggerGlobalRefresh,
//   } = useAuth();
//   const [isOrdering, setIsOrdering] = useState(false);
//   const [isActionLoading, setIsActionLoading] = useState(false);

//   const [formState, setFormState] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "",
//     thumbnailUrl: "",
//     modelUrl: "",
//     dimensions: { width: "", height: "", depth: "" },
//     tags: "",
//   });
//   const imageUri = newSelectedImage?.uri ?? (formState.thumbnailUrl || null);
//   const [formLoading, setFormLoading] = useState(false);

//   React.useEffect(() => {
//     if (editModalVisible && furniture) {
//       setFormState({
//         name: furniture.name || "",
//         description: furniture.description || "",
//         price: String(furniture.price ?? ""),
//         category: furniture.category || "",
//         thumbnailUrl: furniture.thumbnailUrl || "",
//         modelUrl: furniture.modelUrl || "",
//         dimensions: {
//           width: String(furniture.dimensions?.width ?? ""),
//           height: String(furniture.dimensions?.height ?? ""),
//           depth: String(furniture.dimensions?.depth ?? ""),
//         },
//         tags: (furniture.tags || []).join(", "),
//       });
//       setNewSelectedImage(null);
//     }
//   }, [editModalVisible, furniture]);

//   const handleImagePick = async () => {
//     const permissionResult =
//       await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (permissionResult.granted === false) {
//       return Alert.alert(
//         "Permission Required",
//         "You need to allow access to your photos to upload a new image."
//       );
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });
//     if (!result.canceled) {
//       setNewSelectedImage(result.assets[0]);
//     }
//   };

//   const handleModelPick = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["application/octet-stream", "model/gltf-binary"],
//         copyToCacheDirectory: true,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setModelFile(result.assets[0]);
//       }
//     } catch (error: any) {
//       Alert.alert(
//         "Model File Error",
//         error.message || "Could not pick model file."
//       );
//     }
//   };

//   const handleWishlistToggle = () => {
//     if (!user || !furniture) return router.push("/login");
//     wishlist.some((item) => item.productId === furniture.id)
//       ? removeItemFromWishlist(furniture.id)
//       : addItemToWishlist(furniture);
//   };

//   const handleOrderProduct = async () => {
//     if (!user || !furniture) return router.push("/login");
//     if (!furniture.isApproved) {
//       return Alert.alert(
//         "Not Available",
//         "This product is not yet available for purchase."
//       );
//     }
//     Alert.alert(
//       "Confirm Order",
//       `Are you sure you want to order ${furniture.name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Confirm Order",
//           onPress: async () => {
//             if (!token) return;
//             setIsOrdering(true);
//             try {
//               const orderItem = {
//                 productId: furniture.id,
//                 productName: furniture.name,
//                 productPrice: furniture.price,
//                 quantity: 1,
//               };
//               await createOrder(token, {
//                 items: [orderItem],
//                 totalAmount: orderItem.productPrice,
//                 totalPrice: orderItem.productPrice,
//               });
//               triggerGlobalRefresh();
//               Alert.alert("Success", "Order placed successfully!");
//               router.push("/(tabs)/orders");
//             } catch (error: any) {
//               Alert.alert(
//                 "Order Failed",
//                 error.message || "Could not place order."
//               );
//             } finally {
//               setIsOrdering(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleApprove = async () => {
//     if (!token || !furniture) return;
//     setIsActionLoading(true);
//     try {
//       await approveProduct(token, furniture.id);
//       Alert.alert("Success", "Product has been approved.");
//       triggerGlobalRefresh();
//       refetch();
//     } catch (error: any) {
//       Alert.alert("Error", error.message || "Failed to approve product.");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handleRejectSubmit = async () => {
//     if (!token || !furniture || !rejectionReason.trim())
//       return Alert.alert("Error", "Please provide a reason for rejection.");
//     setIsActionLoading(true);
//     try {
//       await rejectProduct(token, furniture.id, rejectionReason);
//       Alert.alert("Success", "Product has been rejected.");
//       triggerGlobalRefresh();
//       setRejectModalVisible(false);
//       setRejectionReason("");
//       router.back();
//     } catch (error: any) {
//       Alert.alert("Error", error.message || "Failed to reject product.");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handleDelete = () => {
//     if (!token || !furniture) return;
//     Alert.alert(
//       "Delete Product",
//       `Are you sure you want to permanently delete "${furniture.name}"? This action cannot be undone.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             setIsActionLoading(true);
//             try {
//               await deleteProduct(token, furniture.id);
//               Alert.alert("Success", "Product has been deleted.");
//               triggerGlobalRefresh();
//               router.back();
//             } catch (error: any) {
//               Alert.alert(
//                 "Error",
//                 error.message || "Failed to delete product."
//               );
//             } finally {
//               setIsActionLoading(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleFormChange = (field: keyof typeof formState, value: string) =>
//     setFormState((p) => ({ ...p, [field]: value }));
//   const handleDimensionChange = (
//     field: "width" | "height" | "depth",
//     value: string
//   ) =>
//     setFormState((p) => ({
//       ...p,
//       dimensions: { ...p.dimensions, [field]: value },
//     }));

//   const handleEditFormSubmit = async () => {
//     setFormLoading(true);
//     try {
//       if (!token || !furniture?.id) throw new Error("Authentication error.");
//       const formData = new FormData();
//       formData.append("name", formState.name);
//       formData.append("description", formState.description);
//       formData.append("price", formState.price);
//       formData.append("category", formState.category);
//       const dimensions = {
//         width: parseFloat(formState.dimensions.width) || 0,
//         height: parseFloat(formState.dimensions.height) || 0,
//         depth: parseFloat(formState.dimensions.depth) || 0,
//         unit: furniture.dimensions?.unit || "cm",
//       };
//       formData.append("dimensions", JSON.stringify(dimensions));
//       const tagsArray = formState.tags
//         .split(",")
//         .map((tag) => tag.trim())
//         .filter(Boolean);
//       formData.append("tags", JSON.stringify(tagsArray));
//       if (newSelectedImage) {
//         const uriParts = newSelectedImage.uri.split(".");
//         const fileType = uriParts[uriParts.length - 1];
//         // @ts-ignore
//         formData.append("thumbnail", {
//           uri: newSelectedImage.uri,
//           name: `thumbnail.${fileType}`,
//           type: newSelectedImage.mimeType || `image/${fileType}`,
//         });
//       }
//       if (modelFile) {
//         // @ts-ignore
//         formData.append("modelFile", {
//           uri: modelFile.uri,
//           name: modelFile.name || "model.glb",
//           type: modelFile.mimeType || "application/octet-stream",
//         });
//       }
//       await updateProduct(token, furniture.id, formData);
//       Alert.alert("Success", "Product updated successfully!");
//       setEditModalVisible(false);
//       refetch();
//       triggerGlobalRefresh();
//     } catch (error: any) {
//       Alert.alert("Error", error.message || "Failed to update product.");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const renderRoleSpecificActions = () => {
//     if (!user || !furniture) return null;
//     const isWishlisted = (wishlist || []).some(
//       (item) => item.productId === furniture.id
//     );

//     switch (user.role) {
//       case "client":
//         return (
//           <>
//             <TouchableOpacity
//               className="mx-6 my-4 bg-br p-4 rounded-lg items-center"
//               onPress={() =>
//                 Alert.alert(
//                   "Coming Soon!",
//                   "The AR feature is under development."
//                 )
//               }
//             >
//               <Text className="text-w-100 font-bold text-base">
//                 See in my room
//               </Text>
//             </TouchableOpacity>
//             <View className="flex-row gap-x-3 px-6 mb-4">
//               <TouchableOpacity
//                 onPress={handleWishlistToggle}
//                 className={`flex-1 py-3 rounded-lg items-center border ${
//                   isWishlisted
//                     ? "bg-red-500/20 border-red-500"
//                     : "bg-br/20 border-br"
//                 }`}
//               >
//                 <Text
//                   className={`font-bold ${
//                     isWishlisted ? "text-red-600" : "text-br"
//                   }`}
//                 >
//                   {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleOrderProduct}
//                 className={`flex-1 py-3 rounded-lg items-center justify-center border ${
//                   !furniture.isApproved || isOrdering
//                     ? "bg-g-100 border-g-200"
//                     : "bg-accent/20 border-accent"
//                 }`}
//                 disabled={!furniture.isApproved || isOrdering}
//               >
//                 {isOrdering ? (
//                   <ActivityIndicator color="#65B3B5" />
//                 ) : (
//                   <Text
//                     className={`font-bold ${
//                       !furniture.isApproved || isOrdering
//                         ? "text-g-300"
//                         : "text-accent"
//                     }`}
//                   >
//                     {furniture.isApproved ? "Order Now" : "Unavailable"}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </>
//         );
//       case "company":
//         return user.uid === furniture.companyId ? (
//           <View className="px-6 my-4">
//             <TouchableOpacity
//               className="bg-accent/20 p-4 rounded-lg items-center"
//               onPress={() => setEditModalVisible(true)}
//             >
//               <Text className="text-accent font-bold text-base">
//                 Edit Product Details
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ) : null;
//         case "admin":
//           return (
//             <View className="px-6 my-4 space-y-3">
//               {/* Approval/Rejection buttons only show if the product is pending */}
//               {!furniture.isApproved && (
//                 <View className="flex-row gap-x-3">
//                   <TouchableOpacity
//                     onPress={() => setRejectModalVisible(true)}
//                     disabled={isActionLoading}
//                     className="flex-1 py-3 rounded-lg items-center bg-yellow-500/20"
//                   >
//                     {isActionLoading ? (
//                       <ActivityIndicator size="small" color="#ca8a04" />
//                     ) : (
//                       <Text className="text-yellow-700 font-bold">Reject</Text>
//                     )}
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={handleApprove}
//                     disabled={isActionLoading}
//                     className="flex-1 py-3 rounded-lg items-center bg-green-500/20"
//                   >
//                     {isActionLoading ? (
//                       <ActivityIndicator size="small" color="#16a34a" />
//                     ) : (
//                       <Text className="text-green-700 font-bold">Approve</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {/* Delete button is always available for admins */}
//               <TouchableOpacity
//                 onPress={handleDelete}
//                 disabled={isActionLoading}
//                 className="bg-red-500/20 p-4 rounded-lg items-center mt-4"
//               >
//                 {isActionLoading ? (
//                   <ActivityIndicator color="#dc2626" />
//                 ) : (
//                   <Text className="text-red-600 font-bold text-base">
//                     Delete Product Permanently
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           );
//       default:
//         return null;
//     }
//   };

//   const renderRejectModal = () => (
//     <Modal
//       visible={rejectModalVisible}
//       transparent
//       animationType="fade"
//       onRequestClose={() => setRejectModalVisible(false)}
//     >
//       <View className="flex-1 justify-center items-center bg-black/60 p-5">
//         <View className="w-full bg-w-100 p-6 rounded-xl">
//           <Text className="text-xl font-bold text-center mb-2 text-bl">
//             Reject Product
//           </Text>
//           <Text
//             className="text-base text-g-300 text-center mb-4"
//             numberOfLines={1}
//           >
//             {furniture?.name}
//           </Text>
//           <TextInput
//             className="border border-g-200 rounded-md p-3 mb-4 bg-w-100 h-24 text-bl"
//             placeholder="Reason for rejection..."
//             placeholderTextColor="#A9A9A9"
//             value={rejectionReason}
//             onChangeText={setRejectionReason}
//             multiline
//             textAlignVertical="top"
//           />
//           <View className="flex-row gap-x-3">
//             <TouchableOpacity
//               className="flex-1 bg-g-100 p-3 rounded-lg items-center"
//               onPress={() => setRejectModalVisible(false)}
//             >
//               <Text className="text-bl font-bold">Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className={`flex-1 p-3 rounded-lg items-center ${
//                 isActionLoading || !rejectionReason.trim()
//                   ? "bg-red-400"
//                   : "bg-red-600"
//               }`}
//               onPress={handleRejectSubmit}
//               disabled={isActionLoading || !rejectionReason.trim()}
//             >
//               {isActionLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text className="text-w-100 font-bold">Confirm Reject</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderEditModal = () => (
//     <Modal
//       visible={editModalVisible}
//       animationType="slide"
//       onRequestClose={() => setEditModalVisible(false)}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         className="flex-1"
//       >
//         <ScrollView
//           className="flex-1 bg-w-200"
//           contentContainerStyle={{
//             paddingHorizontal: 20,
//             paddingTop: 60,
//             paddingBottom: 40,
//           }}
//         >
//           <Text className="text-3xl font-bold text-bl mb-6">Edit Product</Text>
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Name
//           </Text>
//           <TextInput
//             placeholder="Product Name"
//             value={formState.name}
//             onChangeText={(t) => handleFormChange("name", t)}
//             className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
//             placeholderTextColor="#A9A9A9"
//           />
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Description
//           </Text>
//           <TextInput
//             placeholder="Description"
//             value={formState.description}
//             onChangeText={(t) => handleFormChange("description", t)}
//             className="bg-g-100 text-bl p-4 rounded-lg mb-4 h-28 border border-g-200"
//             multiline
//             textAlignVertical="top"
//             placeholderTextColor="#A9A9A9"
//           />
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Price
//           </Text>
//           <TextInput
//             placeholder="Price"
//             value={formState.price}
//             onChangeText={(t) => handleFormChange("price", t)}
//             className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
//             keyboardType="numeric"
//             placeholderTextColor="#A9A9A9"
//           />
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Category
//           </Text>
//           <TextInput
//             placeholder="Category"
//             value={formState.category}
//             onChangeText={(t) => handleFormChange("category", t)}
//             className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
//             placeholderTextColor="#A9A9A9"
//           />
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Thumbnail Image
//           </Text>
//           <View className="w-full h-48 rounded-lg mb-2 bg-g-100 items-center justify-center overflow-hidden border border-g-200">
//             {imageUri ? (
//               <Image
//                 source={{ uri: imageUri }}
//                 className="w-full h-full"
//                 resizeMode="cover"
//               />
//             ) : (
//               <Text className="text-g-300">No Image</Text>
//             )}
//           </View>
//           <TouchableOpacity
//             onPress={handleImagePick}
//             className="bg-accent/20 p-3 rounded-lg mb-4 items-center"
//           >
//             <Text className="text-accent font-semibold">Change Image</Text>
//           </TouchableOpacity>
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             3D Model
//           </Text>
//           <TouchableOpacity
//             onPress={handleModelPick}
//             className="bg-accent/20 p-3 rounded-lg mb-2 items-center"
//           >
//             <Text className="text-accent font-semibold">
//               Pick New 3D Model (.glb)
//             </Text>
//           </TouchableOpacity>
//           {modelFile ? (
//             <Text className="text-sm text-g-300 text-center mb-4">
//               Selected: {modelFile.name}
//             </Text>
//           ) : (
//             <Text className="text-sm text-g-300 text-center mb-4">
//               Current: {formState.modelUrl.split("/").pop()}
//             </Text>
//           )}
//           <Text className="text-base text-bl font-semibold mb-2 mt-2">
//             Tags (comma-separated)
//           </Text>
//           <TextInput
//             placeholder="e.g. modern, leather, cozy"
//             value={formState.tags}
//             onChangeText={(t) => handleFormChange("tags", t)}
//             className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
//             placeholderTextColor="#A9A9A9"
//           />
//           <Text className="text-base text-bl font-semibold mt-2 mb-2">
//             Dimensions ({furniture?.dimensions?.unit || "cm"})
//           </Text>
//           <View className="flex-row gap-x-3">
//             <TextInput
//               placeholder="Width"
//               value={formState.dimensions.width}
//               onChangeText={(t) => handleDimensionChange("width", t)}
//               className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
//               keyboardType="numeric"
//               placeholderTextColor="#A9A9A9"
//             />
//             <TextInput
//               placeholder="Height"
//               value={formState.dimensions.height}
//               onChangeText={(t) => handleDimensionChange("height", t)}
//               className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
//               keyboardType="numeric"
//               placeholderTextColor="#A9A9A9"
//             />
//             <TextInput
//               placeholder="Depth"
//               value={formState.dimensions.depth}
//               onChangeText={(t) => handleDimensionChange("depth", t)}
//               className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
//               keyboardType="numeric"
//               placeholderTextColor="#A9A9A9"
//             />
//           </View>
//           <TouchableOpacity
//             onPress={handleEditFormSubmit}
//             className="bg-br p-4 rounded-lg mt-6"
//             disabled={formLoading}
//           >
//             {formLoading ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <Text className="text-w-100 text-center font-bold text-base">
//                 Save Changes
//               </Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setEditModalVisible(false)}
//             className="bg-g-100 p-4 rounded-lg mt-3"
//           >
//             <Text className="text-bl text-center font-bold text-base">
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// if(furniture?.modelUrl){
//   console.log(furniture.modelUrl)
// }
//   if (loading)
//     return (
//       <View className="flex-1 justify-center items-center bg-w-200">
//         <ActivityIndicator size="large" color="#625043" />
//       </View>
//     );
//   if (!furniture)
//     return (
//       <View className="flex-1 justify-center items-center bg-w-200 p-5">
//         <Text className="text-lg text-g-300">Product not found.</Text>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="mt-6 bg-g-100 p-3 rounded-lg items-center"
//         >
//           <Text className="text-bl font-bold">Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );

//   return (
//     <ScrollView className="flex-1 bg-w-100">
//       <Image
//         source={{ uri: furniture.thumbnailUrl }}
//         className="w-full h-64 bg-g-100"
//         resizeMode="cover"
//       />
//       <View className="p-6">
//         <Text className="text-3xl font-bold text-bl mb-2">
//           {furniture.name}
//         </Text>
//         <View
//           className={`mb-4 p-3 rounded-lg ${
//             furniture.isApproved ? "bg-green-500/10" : "bg-yellow-500/10"
//           }`}
//         >
//           <Text
//             className={`font-bold ${
//               furniture.isApproved ? "text-green-700" : "text-yellow-700"
//             }`}
//           >
//             Status:{" "}
//             {furniture.isApproved
//               ? "Available for Purchase"
//               : "Pending Approval"}
//           </Text>
//         </View>
//         <Text className="text-base text-g-300 mb-4">
//           {furniture.description}
//         </Text>
//         <Text className="text-3xl font-bold text-accent mb-4">
//           ${furniture.price}
//         </Text>
//         <View className="mb-4">
//           <Text className="text-base font-bold text-bl mb-1">Category</Text>
//           <Text className="text-base text-g-300">{furniture.category}</Text>
//         </View>
//         {furniture.dimensions && (
//           <View className="mb-6">
//             <Text className="text-base font-bold text-bl mb-1">Dimensions</Text>
//             <View className="flex-row justify-between">
//               <Text className="text-base text-g-300">
//                 Width: {furniture.dimensions.width} {furniture.dimensions.unit}
//               </Text>
//               <Text className="text-base text-g-300">
//                 Height: {furniture.dimensions.height}{" "}
//                 {furniture.dimensions.unit}
//               </Text>
//               <Text className="text-base text-g-300">
//                 Depth: {furniture.dimensions.depth} {furniture.dimensions.unit}
//               </Text>
//             </View>
//           </View>
//         )}
//       </View>
//       {/* <View className="my-4 mx-6 h-80 bg-g-100 rounded-xl overflow-hidden justify-center items-center border border-g-200">
//         <Text className="absolute top-2 left-2 font-bold text-g-300 bg-w-100/80 px-2 py-1 rounded-md z-10">
//           3D Interactive Model {furniture.modelUrl}
//         </Text>
//         //<ModelViewer modelUrl={furniture.modelUrl}  />
//         //<ModelViewer modelUrl="https://yourdomain.com/model.glb" />
//         <ModelViewer modelUrl="https://yourdomain.com/model.glb" style={{ height: 300 }} />
//          furniture.modelUrl ? (
//            <ModelViewer modelUrl="https://example.com/model.glb" />

//                ) : (

//           <Text className="text-g-300 text-base">No 3D model available.</Text>
//         )
//       </View> */}

//       {renderRoleSpecificActions()}
//       {renderEditModal()}
//       <TouchableOpacity
//         onPress={() => router.back()}
//         className="mx-6 mb-6 mt-4 bg-g-100 p-4 rounded-lg items-center"
//       >
//         <Text className="text-bl font-bold">Go Back</Text>
//       </TouchableOpacity>
//       {renderRejectModal()}
//     </ScrollView>
//   );
// };

// export default FurnitureDetails;

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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchFurnitureDetails,
  createOrder,
  approveProduct,
  rejectProduct,
  updateProduct,
  deleteProduct,
  trackProductPlacement,
} from "@/services/api";
import useFetch from "@/services/useFetch";
import { useAuth } from "@/context/AuthContext";
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
  const imageUri = newSelectedImage?.uri ?? (formState.thumbnailUrl || null);
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
  const handleArPlacement = async () => {
        if (!token || !furniture) return;
        try {
          // Fire-and-forget tracking call
          await trackProductPlacement(token, furniture.id);
        } catch (error) {
          console.warn("Could not track AR placement", error);
        }
        Alert.alert("Coming Soon!", "The AR feature is under development.");
      };
    
  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      return Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to upload a new image."
      );
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
        type: ["application/octet-stream", "model/gltf-binary"],
        copyToCacheDirectory: true,
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
    if (!user || !furniture) return router.push("/login");
    wishlist.some((item) => item.productId === furniture.id)
      ? removeItemFromWishlist(furniture.id)
      : addItemToWishlist(furniture);
  };

  const handleOrderProduct = async () => {
    if (!user || !furniture) return router.push("/login");
    if (!furniture.isApproved) {
      return Alert.alert(
        "Not Available",
        "This product is not yet available for purchase."
      );
    }
    Alert.alert(
      "Confirm Order",
      `Are you sure you want to order ${furniture.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Order",
          onPress: async () => {
            if (!token) return;
            setIsOrdering(true);
            try {
              const orderItem = {
                productId: furniture.id,
                productName: furniture.name,
                productPrice: furniture.price,
                quantity: 1,
              };
              await createOrder(token, {
                items: [orderItem],
                totalAmount: orderItem.productPrice,
                totalPrice: orderItem.productPrice,
              });
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
    if (!token || !furniture || !rejectionReason.trim())
      return Alert.alert("Error", "Please provide a reason for rejection.");
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

  const handleFormChange = (field: keyof typeof formState, value: string) =>
    setFormState((p) => ({ ...p, [field]: value }));
  const handleDimensionChange = (
    field: "width" | "height" | "depth",
    value: string
  ) =>
    setFormState((p) => ({
      ...p,
      dimensions: { ...p.dimensions, [field]: value },
    }));

  const handleEditFormSubmit = async () => {
    setFormLoading(true);
    try {
      if (!token || !furniture?.id) throw new Error("Authentication error.");
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("description", formState.description);
      formData.append("price", formState.price);
      formData.append("category", formState.category);
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
      if (modelFile) {
        // @ts-ignore
        formData.append("modelFile", {
          uri: modelFile.uri,
          name: modelFile.name || "model.glb",
          type: modelFile.mimeType || "application/octet-stream",
        });
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
    if (!user || !furniture) return null;
    const isWishlisted = (wishlist || []).some(
      (item) => item.productId === furniture.id
    );

    switch (user.role) {
      case "client":
        return (
          <>
            <TouchableOpacity onPress={handleArPlacement} className="mx-6 my-4 bg-br p-4 rounded-lg items-center">
               <Text className="text-w-100 font-bold text-base">
                 See in my room
               </Text>
            </TouchableOpacity>
            <View className="flex-row gap-x-3 px-6 mb-4">
              <TouchableOpacity
                onPress={handleWishlistToggle}
                className={`flex-1 py-3 rounded-lg items-center border ${
                  isWishlisted
                    ? "bg-red-500/20 border-red-500"
                    : "bg-br/20 border-br"
                }`}
              >
                <Text
                  className={`font-bold ${
                    isWishlisted ? "text-red-600" : "text-br"
                  }`}
                >
                  {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOrderProduct}
                className={`flex-1 py-3 rounded-lg items-center justify-center border ${
                  !furniture.isApproved || isOrdering
                    ? "bg-g-100 border-g-200"
                    : "bg-accent/20 border-accent"
                }`}
                disabled={!furniture.isApproved || isOrdering}
              >
                {isOrdering ? (
                  <ActivityIndicator color="#65B3B5" />
                ) : (
                  <Text
                    className={`font-bold ${
                      !furniture.isApproved || isOrdering
                        ? "text-g-300"
                        : "text-accent"
                    }`}
                  >
                    {furniture.isApproved ? "Order Now" : "Unavailable"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        );
      case "company":
        return user.uid === furniture.companyId ? (
          <View className="px-6 my-4">
            <TouchableOpacity
              className="bg-accent/20 p-4 rounded-lg items-center"
              onPress={() => setEditModalVisible(true)}
            >
              <Text className="text-accent font-bold text-base">
                Edit Product Details
              </Text>
            </TouchableOpacity>
          </View>
        ) : null;
      case "admin":
        return (
          <View className="px-6 my-4 space-y-3">
            {/* Approval/Rejection buttons only show if the product is pending */}
            {!furniture.isApproved && (
              <View className="flex-row gap-x-3">
                <TouchableOpacity
                  onPress={() => setRejectModalVisible(true)}
                  disabled={isActionLoading}
                  className="flex-1 py-3 rounded-lg items-center bg-yellow-500/20"
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color="#ca8a04" />
                  ) : (
                    <Text className="text-yellow-700 font-bold">Reject</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApprove}
                  disabled={isActionLoading}
                  className="flex-1 py-3 rounded-lg items-center bg-green-500/20"
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : (
                    <Text className="text-green-700 font-bold">Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Delete button is always available for admins */}
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isActionLoading}
              className="bg-red-500/20 p-4 rounded-lg items-center mt-4"
            >
              {isActionLoading ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <Text className="text-red-600 font-bold text-base">
                  Delete Product Permanently
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderRejectModal = () => (
    <Modal
      visible={rejectModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setRejectModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-5">
        <View className="w-full bg-w-100 p-6 rounded-xl">
          <Text className="text-xl font-bold text-center mb-2 text-bl">
            Reject Product
          </Text>
          <Text
            className="text-base text-g-300 text-center mb-4"
            numberOfLines={1}
          >
            {furniture?.name}
          </Text>
          <TextInput
            className="border border-g-200 rounded-md p-3 mb-4 bg-w-100 h-24 text-bl"
            placeholder="Reason for rejection..."
            placeholderTextColor="#A9A9A9"
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            textAlignVertical="top"
          />
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              className="flex-1 bg-g-100 p-3 rounded-lg items-center"
              onPress={() => setRejectModalVisible(false)}
            >
              <Text className="text-bl font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg items-center ${
                isActionLoading || !rejectionReason.trim()
                  ? "bg-red-400"
                  : "bg-red-600"
              }`}
              onPress={handleRejectSubmit}
              disabled={isActionLoading || !rejectionReason.trim()}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-w-100 font-bold">Confirm Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-w-200"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 40,
          }}
        >
          <Text className="text-3xl font-bold text-bl mb-6">Edit Product</Text>
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Name
          </Text>
          <TextInput
            placeholder="Product Name"
            value={formState.name}
            onChangeText={(t) => handleFormChange("name", t)}
            className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
            placeholderTextColor="#A9A9A9"
          />
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Description
          </Text>
          <TextInput
            placeholder="Description"
            value={formState.description}
            onChangeText={(t) => handleFormChange("description", t)}
            className="bg-g-100 text-bl p-4 rounded-lg mb-4 h-28 border border-g-200"
            multiline
            textAlignVertical="top"
            placeholderTextColor="#A9A9A9"
          />
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Price
          </Text>
          <TextInput
            placeholder="Price"
            value={formState.price}
            onChangeText={(t) => handleFormChange("price", t)}
            className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
            keyboardType="numeric"
            placeholderTextColor="#A9A9A9"
          />
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Category
          </Text>
          <TextInput
            placeholder="Category"
            value={formState.category}
            onChangeText={(t) => handleFormChange("category", t)}
            className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
            placeholderTextColor="#A9A9A9"
          />
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Thumbnail Image
          </Text>
          <View className="w-full h-48 rounded-lg mb-2 bg-g-100 items-center justify-center overflow-hidden border border-g-200">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-g-300">No Image</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleImagePick}
            className="bg-accent/20 p-3 rounded-lg mb-4 items-center"
          >
            <Text className="text-accent font-semibold">Change Image</Text>
          </TouchableOpacity>
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            3D Model
          </Text>
          <TouchableOpacity
            onPress={handleModelPick}
            className="bg-accent/20 p-3 rounded-lg mb-2 items-center"
          >
            <Text className="text-accent font-semibold">
              Pick New 3D Model (.glb)
            </Text>
          </TouchableOpacity>
          {modelFile ? (
            <Text className="text-sm text-g-300 text-center mb-4">
              Selected: {modelFile.name}
            </Text>
          ) : (
            <Text className="text-sm text-g-300 text-center mb-4">
              Current: {formState.modelUrl.split("/").pop()}
            </Text>
          )}
          <Text className="text-base text-bl font-semibold mb-2 mt-2">
            Tags (comma-separated)
          </Text>
          <TextInput
            placeholder="e.g. modern, leather, cozy"
            value={formState.tags}
            onChangeText={(t) => handleFormChange("tags", t)}
            className="bg-g-100 text-bl p-4 rounded-lg mb-4 border border-g-200"
            placeholderTextColor="#A9A9A9"
          />
          <Text className="text-base text-bl font-semibold mt-2 mb-2">
            Dimensions ({furniture?.dimensions?.unit || "cm"})
          </Text>
          <View className="flex-row gap-x-3">
            <TextInput
              placeholder="Width"
              value={formState.dimensions.width}
              onChangeText={(t) => handleDimensionChange("width", t)}
              className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
              keyboardType="numeric"
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              placeholder="Height"
              value={formState.dimensions.height}
              onChangeText={(t) => handleDimensionChange("height", t)}
              className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
              keyboardType="numeric"
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              placeholder="Depth"
              value={formState.dimensions.depth}
              onChangeText={(t) => handleDimensionChange("depth", t)}
              className="bg-g-100 text-bl p-4 rounded-lg flex-1 border border-g-200"
              keyboardType="numeric"
              placeholderTextColor="#A9A9A9"
            />
          </View>
          <TouchableOpacity
            onPress={handleEditFormSubmit}
            className="bg-br p-4 rounded-lg mt-6"
            disabled={formLoading}
          >
            {formLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-w-100 text-center font-bold text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            className="bg-g-100 p-4 rounded-lg mt-3"
          >
            <Text className="text-bl text-center font-bold text-base">
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
  if (furniture?.modelUrl) {
    console.log(furniture.modelUrl);
  }
  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-w-200">
        <ActivityIndicator size="large" color="#625043" />
      </View>
    );
  if (!furniture)
    return (
      <View className="flex-1 justify-center items-center bg-w-200 p-5">
        <Text className="text-lg text-g-300">Product not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-g-100 p-3 rounded-lg items-center"
        >
          <Text className="text-bl font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView className="flex-1 bg-w-100">
      <Image
        source={{ uri: furniture.thumbnailUrl }}
        className="w-full h-64 bg-g-100"
        resizeMode="cover"
      />
      <View className="p-6">
        <Text className="text-3xl font-bold text-bl mb-2">
          {furniture.name}
        </Text>
        <View
          className={`mb-4 p-3 rounded-lg ${
            furniture.isApproved ? "bg-green-500/10" : "bg-yellow-500/10"
          }`}
        >
          <Text
            className={`font-bold ${
              furniture.isApproved ? "text-green-700" : "text-yellow-700"
            }`}
          >
            Status:{" "}
            {furniture.isApproved
              ? "Available for Purchase"
              : "Pending Approval"}
          </Text>
        </View>
        <Text className="text-base text-g-300 mb-4">
          {furniture.description}
        </Text>
        <Text className="text-3xl font-bold text-accent mb-4">
          ${furniture.price}
        </Text>
        <View className="mb-4">
          <Text className="text-base font-bold text-bl mb-1">Category</Text>
          <Text className="text-base text-g-300">{furniture.category}</Text>
        </View>
        {furniture.dimensions && (
          <View className="mb-6">
            <Text className="text-base font-bold text-bl mb-1">Dimensions</Text>
            <View className="flex-row justify-between">
              <Text className="text-base text-g-300">
                Width: {furniture.dimensions.width} {furniture.dimensions.unit}
              </Text>
              <Text className="text-base text-g-300">
                Height: {furniture.dimensions.height}{" "}
                {furniture.dimensions.unit}
              </Text>
              <Text className="text-base text-g-300">
                Depth: {furniture.dimensions.depth} {furniture.dimensions.unit}
              </Text>
            </View>
          </View>
        )}
      </View>
      {/* <View className="my-4 mx-6 h-80 bg-g-100 rounded-xl overflow-hidden justify-center items-center border border-g-200">
        <Text className="absolute top-2 left-2 font-bold text-g-300 bg-w-100/80 px-2 py-1 rounded-md z-10">
          3D Interactive Model {furniture.modelUrl}
        </Text>
        //<ModelViewer modelUrl={furniture.modelUrl}  />   
        //<ModelViewer modelUrl="https://yourdomain.com/model.glb" />
        <ModelViewer modelUrl="https://yourdomain.com/model.glb" style={{ height: 300 }} />
         furniture.modelUrl ? (
           <ModelViewer modelUrl="https://example.com/model.glb" />      

               ) : (

          <Text className="text-g-300 text-base">No 3D model available.</Text>
        )
      </View> */}

      {renderRoleSpecificActions()}
      {renderEditModal()}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mx-6 mb-6 mt-4 bg-g-100 p-4 rounded-lg items-center"
      >
        <Text className="text-bl font-bold">Go Back</Text>
      </TouchableOpacity>
      {renderRejectModal()}
    </ScrollView>
  );
};

export default FurnitureDetails;
