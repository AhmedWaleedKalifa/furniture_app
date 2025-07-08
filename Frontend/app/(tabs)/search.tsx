import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import useFetch from "@/services/useFetch";
import { fetchFurniture } from "@/services/api";
import Card from "@/components/Card";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: allFurniture,
    loading,
    error,
  } = useFetch<Product[] | null>(fetchFurniture);
  const [filteredFurniture, setFilteredFurniture] = useState<Product[] | null>(
    []
  );
  const { user } = useAuth(); // Get user from context
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    tags: [] as string[],
  });
  // Temporary state for the modal to avoid applying filters until the user confirms
  const [tempFilters, setTempFilters] = useState(activeFilters);

  const { uniqueCategories, uniqueTags } = useMemo(() => {
    if (!allFurniture) return { uniqueCategories: [], uniqueTags: [] };

    // Filter for unique, non-empty values
    const categories = [
      ...new Set(allFurniture.map((p) => p.category).filter(Boolean)),
    ];
    const tags = [
      ...new Set(allFurniture.flatMap((p) => p.tags || []).filter(Boolean)),
    ];

    return { uniqueCategories: categories.sort(), uniqueTags: tags.sort() };
  }, [allFurniture]);

  useEffect(() => {
    if (!allFurniture) {
      setFilteredFurniture([]);
      return;
    }

    // Determine the base list of products based on user role
    let baseList = allFurniture;
    if (user?.role === "client") {
      baseList = allFurniture.filter((item) => item.isApproved);
    }
    const lowercasedQuery = searchQuery.toLowerCase();

    const filtered = baseList.filter((item) => {
      // Search Query Filter
      const matchesQuery =
        lowercasedQuery === "" ||
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.category.toLowerCase().includes(lowercasedQuery) ||
        item.description.toLowerCase().includes(lowercasedQuery);

      // Category Filter
      const matchesCategory =
        !activeFilters.category || item.category === activeFilters.category;

      // Price Filter
      const price = item.price;
      const minPrice = parseFloat(activeFilters.minPrice);
      const maxPrice = parseFloat(activeFilters.maxPrice);
      const matchesMinPrice = isNaN(minPrice) || price >= minPrice;
      const matchesMaxPrice = isNaN(maxPrice) || price <= maxPrice;

      // Tags Filter
      const matchesTags =
        activeFilters.tags.length === 0 ||
        activeFilters.tags.every((tag) => (item.tags || []).includes(tag));

      return (
        matchesQuery &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesTags
      );
    });

    setFilteredFurniture(filtered);
  }, [searchQuery, allFurniture, user, activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setFilterVisible(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      tags: [],
    };
    setTempFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setFilterVisible(false);
  };

  const toggleTag = (tag: string) => {
    setTempFilters((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterVisible}
      onRequestClose={() => setFilterVisible(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-w-100 rounded-t-2xl p-5 h-3/4">
          <Text className="text-2xl font-bold mb-5 text-center text-bl">Filters</Text>
          <ScrollView>
            <Text className="text-lg font-semibold mt-4 mb-3 text-slate-700">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {uniqueCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`py-2 px-4 rounded-full ${tempFilters.category === cat ? 'bg-br' : 'bg-g-100'}`}
                  onPress={() =>
                    setTempFilters({
                      ...tempFilters,
                      category: tempFilters.category === cat ? "" : cat,
                    })
                  }
                >
                  <Text className={`${tempFilters.category === cat ? 'text-w-100' : 'text-slate-700'} font-medium`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-lg font-semibold mt-4 mb-3 text-slate-700">Price Range</Text>
            <View className="flex-row justify-between gap-x-4">
              <TextInput
                className="flex-1 border border-g-200 rounded-lg p-3 text-base text-bl"
                placeholder="Min Price"
                keyboardType="numeric"
                value={tempFilters.minPrice}
                onChangeText={(text) =>
                  setTempFilters({ ...tempFilters, minPrice: text })
                }
              />
              <TextInput
                className="flex-1 border border-g-200 rounded-lg p-3 text-base text-bl"
                placeholder="Max Price"
                keyboardType="numeric"
                value={tempFilters.maxPrice}
                onChangeText={(text) =>
                  setTempFilters({ ...tempFilters, maxPrice: text })
                }
              />
            </View>
            <Text className="text-lg font-semibold mt-4 mb-3 text-slate-700">Styles</Text>
            <View className="flex-row flex-wrap gap-2">
              {uniqueTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className={`py-2 px-4 rounded-full ${tempFilters.tags.includes(tag) ? 'bg-br' : 'bg-g-100'}`}
                  onPress={() => toggleTag(tag)}
                >
                  <Text className={`${tempFilters.tags.includes(tag) ? 'text-w-100' : 'text-slate-700'} font-medium`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View className="flex-row mt-5 pt-3 border-t border-g-100 gap-x-3">
            <TouchableOpacity
              className="flex-1 p-4 rounded-lg bg-g-100 items-center"
              onPress={handleClearFilters}
            >
              <Text className="text-bl font-bold">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 p-4 rounded-lg bg-br items-center"
              onPress={handleApplyFilters}
            >
              <Text className="text-w-100 font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-w-200">
      {renderFilterModal()}
      <FlatList
        data={filteredFurniture}
        renderItem={({ item }) => <Card {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center items-center">
              <Image
                source={icons.logo}
                className="w-16 h-16 mt-14 mb-1 mx-auto"
              />
            </View>
            
                        <View className="my-5 flex-row items-center gap-x-2">
              <View className="flex-1">
                <SearchBar 
                  placeholder="Search for furniture..." 
                  value={searchQuery}
                  onChangeText={(text: string) => setSearchQuery(text)}
                />
              </View>
              <TouchableOpacity onPress={() => setFilterVisible(true)} className="bg-g-100 p-3 rounded-full"><Ionicons name="filter" size={24} color="#625043" /></TouchableOpacity>
             </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#7df9ff"
                className="my-3"
              />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3 text-center">
                Error: {error.message}
              </Text>
            )}
            {!loading && !error && searchQuery.trim() && !activeFilters.category && !activeFilters.minPrice && !activeFilters.maxPrice && activeFilters.tags.length === 0 && (
               <Text className="text-xl text-bl font-bold">Search Results for{' '}
                 <Text className="text-br">{searchQuery}</Text>
               </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-lg text-g-300">
                {searchQuery.trim()
                  ? "No furniture found."
                  : "Type to search for furniture."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};
  
export default Search;