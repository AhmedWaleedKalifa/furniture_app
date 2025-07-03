import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { Text, View, Image, ActivityIndicator, FlatList } from "react-native";
import useFetch from "@/services/useFetch";
import { fetchFurniture } from "@/services/api";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allFurniture, loading, error } = useFetch<Product[] | null>(fetchFurniture);
  const [filteredFurniture, setFilteredFurniture] = useState<Product[] | null>([]);
  const { user } = useAuth(); // Get user from context

  useEffect(() => {
    if (!allFurniture) {
      setFilteredFurniture([]);
      return;
    }

    // Determine the base list of products based on user role
    let baseList = allFurniture;
    if (user?.role === 'client') {
      baseList = allFurniture.filter(item => item.isApproved);
    }
    
    // Apply search query filtering on the base list
    if (searchQuery.trim() === '') {
      // When the search query is empty, show the role-appropriate list.
      setFilteredFurniture(baseList);
    } else {
      // When the user types, filter the base list.
      const filtered = baseList.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFurniture(filtered || []);
    }
  }, [searchQuery, allFurniture, user]);

  return (
    <View className="flex-1 bg-w-200">
      <FlatList
        data={filteredFurniture}
        renderItem={({ item }) => <Card {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{
          paddingBottom: 100
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center items-center">
              <Image source={icons.logo} className="w-16 h-16 mt-14 mb-1 mx-auto" />
            </View>
            <View className="my-5">
              <SearchBar 
                placeholder="Search furniture by name, category..." 
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {loading && (
              <ActivityIndicator size="large" color="#65B3B5" className="my-3" />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3 text-center">
                Error: {error.message}
              </Text>
            )}
            {!loading && !error && searchQuery.trim() && (
              <Text className="text-xl text-bl font-bold">Search Results for{' '}
                <Text className="text-br">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-g-300">
                {searchQuery.trim() ? 'No furniture found.' : 'Type to search for furniture.'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;