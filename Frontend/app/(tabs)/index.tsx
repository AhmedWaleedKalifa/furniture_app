import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import {  router } from "expo-router";
import { Text, View, Image, ScrollView, ActivityIndicator, FlatList } from "react-native";
import Card from "@/components/Card";
import {fetchFurniture} from "../../services/api"
import useFetch from "@/services/useFetch";

export default function Index() {

  const { data: furniture, loading, error } = useFetch(fetchFurniture);

  return (
    <View className="flex-1 bg-w-200">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 10,
        }}
      >
        <Image source={icons.logo} className="w-16 h-16 mt-14 mb-1 mx-auto" />
        {loading? (
          <ActivityIndicator
            size="large"
            color="#65B3B5"
            className="mt-10 self-center"
          />
        ) : error? (
          <Text>Error:{error?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search for a furniture"
            />
            
            <>
              <Text className="text-lg text-g-200 font-bold mt-5 mb-3 ">Furniture</Text>
              <FlatList
                data={furniture}
                renderItem={({item})=>(
                  <Card
                      {...item}
                  />
                )}
                keyExtractor={(item)=>item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent:"flex-start",
                  gap:23,
                  paddingRight:5,
                  marginBottom:10
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
