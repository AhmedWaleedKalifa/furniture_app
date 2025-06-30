import { ScrollView, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fetchFurnitureDetails } from "@/services/api";
import useFetch from "@/services/useFetch";
import { icons } from "@/constants/icons";
import db from "../../mock/db.json";
interface furnitureInfoProps {
  label: string;
  value?: string | number | null;
}
const furnitureInfo = ({ label, value }: furnitureInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-w-200 font-normal text-sm">{label}</Text>
    <Text className="text-w-100 font-bold text-sm mt-2">{value || "N/A"}</Text>
  </View>
);
const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: furniture, loading } = useFetch(() =>
    fetchFurnitureDetails(id as string)
  );
  //const furniture=db.furniture[Number(id)];

  // interface ProductDetails {
  //   id: string;
  //   name: string;
  //   description: string;
  //   category: string;
  //   dimensions: {
  //     width: number;
  //     height: number;
  //     depth: number;
  //     unit: string;
  //   };
  //   modelUrl: string;
  //   thumbnailUrl: string;
  //   price: number;
  //   isApproved: boolean;
  //   customizable: {
  //     color: boolean;
  //     material: boolean;
  //   };
  //   tags: string[];
  // }
  return (
    <View className="bg-w-200 flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        <View>
          <Image
            source={{
              uri: furniture?.thumbnailUrl
                ? furniture.thumbnailUrl
                : `https://placehold.co/600x400/1a1a1a/ffffff.png`,
            }}
            className="w-full h-[550px] border-2 border-g-200"
            resizeMode="stretch"
          />

          <View className="flex-col items-start justify-center gap-y-5 mt-5 px-5">
            <Text className="text-bl font-bold text-xl" numberOfLines={2}>
              {furniture?.name}
            </Text>
            <Text
              className="text-g-300 font-medium text-base"
              numberOfLines={2}
            >
              {furniture?.description}
            </Text>
            <View className="flex-row w-full items-center justify-between ">
              <Text className="text-br text-sm ">${furniture?.price}</Text>
              <Text className="text-br text-sm">{furniture?.category}</Text>
            </View>
            <Text className="font-bold text-lg text-bl">Dimensions:</Text>
            <View className="flex-row w-full items-center justify-between ">
              <Text className="text-g-300 text-sm font-normal ">
                <Text className="text-g-200 font_">Width: </Text>
                {furniture?.dimensions.width}{" "}
                <Text className="text-g-300 font-bold">
                  {furniture?.dimensions.unit}
                </Text>
              </Text>
              <Text className="text-g-300 text-sm font-normal ">
                <Text className="text-g-200">Height:</Text>{" "}
                {furniture?.dimensions.height}{" "}
                <Text className=" font-bold">{furniture?.dimensions.unit}</Text>
              </Text>
              <Text className="text-g-300 text-sm font-normal">
                <Text className="text-g-200">Depth:</Text>{" "}
                {furniture?.dimensions.depth}{" "}
                <Text className=" font-bold">{furniture?.dimensions.unit}</Text>
              </Text>
            </View>
            <Text className="text-bl font-medium">Is approved: <Text className="text-g-200 font-normal">{furniture?.isApproved ? "True" : "False"}</Text></Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-br  text-w-100 rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-130"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FurnitureDetails;
