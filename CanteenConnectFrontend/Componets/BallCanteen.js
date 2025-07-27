// BallCanteenPage.js
import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const ITEM_TYPES = ['All', 'Veg', 'Non-Veg', 'Beverages'];
const COST_FILTERS = ['All', '₹0–₹30', '₹30–₹60', '₹60–₹200'];

const BallCanteenPage = () => {
  const navigation = useNavigation();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [theme, setTheme] = useState('light');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(
        'https://dev285691.service-now.com/api/now/table/u_canteen_menu?sysparm_query=u_canteen_name=Ball Canteen',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Basic YWRtaW46ekJQOGJGaS8xIWZN',
          },
        }
      );
      const data = await response.json();

      const formattedItems = data.result.map(item => ({
        id: item.sys_id,
        name: item.u_item_name,
        price: `${item.u_item_price}`,
        rating: parseFloat(item.u_rating || 4.0),
        image: { uri: item.u_item_image_url },
        canteen: item.u_canteen_name || 'Ball Canteen',
        availability: (item.u_availability || '').toLowerCase() === 'yes' ? 'yes' : 'no',
        item_type: item.u_item_type || 'All',
        original_price: item.u_original_price,
        offer: item.u_offer,
      }));

      setFoodItems(formattedItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadWishlist = async () => {
        try {
          const stored = await AsyncStorage.getItem('wishlist');
          const wishlist = stored ? JSON.parse(stored) : [];
          setWishlistIds(wishlist.map(item => item.id));
        } catch (error) {
          console.error('Failed to load wishlist', error);
        }
      };

      loadWishlist();
      fetchFoodItems();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/ballcanteen.jpg')}
            style={{ width: 35, height: 35, borderRadius: 17, marginRight: 4, marginLeft: -28 }}
          />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#FF8000' : '#640D5F' }}>
            Ball Canteen
          </Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
          <Feather name={isDark ? 'sun' : 'moon'} size={22} color={isDark ? '#FF8000' : '#640D5F'} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: isDark ? '#121212' : '#FCFAF8',
      },
    });
  }, [navigation, isDark]);

  const toggleWishlist = async item => {
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];

      const index = wishlist.findIndex(i => i.id === item.id);
      let updated;
      if (index !== -1) {
        updated = wishlist.filter(i => i.id !== item.id);
      } else {
        updated = [...wishlist, item];
      }

      await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
      setWishlistIds(updated.map(i => i.id));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const addToCart = async item => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      const cart = stored ? JSON.parse(stored) : [];

      if (cart.find(i => i.id === item.id)) {
        Toast.show({
          type: 'info',
          text1: 'Already in Cart',
          text2: `${item.name} is already in your cart.`,
          position: 'bottom',
        });
        return;
      }

      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        availability: item.availability,
        item_type: item.item_type,
        canteen_name: item.canteen || 'Ball Canteen',
        original_price: item.original_price || item.price,
        offer: item.offer || '0',
      };

      cart.push(newItem);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${item.name} added to your cart.`,
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const filteredItems = foodItems.filter(item => {
    const matchType =
      selectedType === 'All' || item.item_type?.toLowerCase() === selectedType.toLowerCase();

    const price = parseFloat(item.price);
    let matchCost = true;
    if (selectedCost === '₹0–₹30') matchCost = price >= 0 && price <= 30;
    else if (selectedCost === '₹30–₹60') matchCost = price > 30 && price <= 60;
    else if (selectedCost === '₹60–₹200') matchCost = price > 60 && price <= 200;

    return matchType && matchCost;
  });

  const themedStyles = getThemedStyles(isDark);

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <ScrollView contentContainerStyle={themedStyles.container}>
        {/* Item Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {ITEM_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                themedStyles.filterChip,
                selectedType === type && themedStyles.activeFilterChip,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  themedStyles.filterText,
                  selectedType === type && themedStyles.activeFilterText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {COST_FILTERS.map(range => (
            <TouchableOpacity
              key={range}
              style={[
                themedStyles.filterChip,
                selectedCost === range && themedStyles.activeFilterChip,
              ]}
              onPress={() => setSelectedCost(range)}
            >
              <Text
                style={[
                  themedStyles.filterText,
                  selectedCost === range && themedStyles.activeFilterText,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={themedStyles.grid}>
          {filteredItems.map(item => {
            const isOutOfStock = item.availability === 'no';
            const isWished = wishlistIds.includes(item.id);

            return (
              <View key={item.id} style={themedStyles.card}>
                <Image source={item.image} style={themedStyles.imageStyle} />
                {isOutOfStock && (
                  <Text style={themedStyles.outOfStockText}>Out of Stock</Text>
                )}

                <View style={themedStyles.priceRow}>
                  <Text style={themedStyles.discountedPrice}>₹{item.price}</Text>
                  <Text style={themedStyles.originalPrice}>₹{item.original_price}</Text>
                  <Text style={themedStyles.offerText}>₹{item.offer} off</Text>
                </View>

                <Text style={themedStyles.name}>{item.name}</Text>
                <View style={themedStyles.reviewBadge}>
                  <Text style={themedStyles.reviewText}>{item.rating.toFixed(1)}</Text>
                  <MaterialIcons name="star" size={14} color="#fff" />
                </View>
                <Text style={themedStyles.canteen}>{item.canteen}</Text>

                <TouchableOpacity
                  style={themedStyles.iconButton}
                  onPress={() => toggleWishlist(item)}
                >
                  <MaterialIcons
                    name={isWished ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={isWished ? '#FF8000' : '#aaa'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    themedStyles.button,
                    { marginTop: 8 },
                    isOutOfStock && themedStyles.disabledButton,
                  ]}
                  onPress={() => addToCart(item)}
                  disabled={isOutOfStock}
                >
                  <View style={themedStyles.buttonContent}>
                    <Text style={themedStyles.buttonText}>
                      {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                    </Text>
                    <MaterialIcons name="shopping-cart" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BallCanteenPage;

const getThemedStyles = isDark =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#FCFAF8',
    },
    container: {
      padding: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      backgroundColor: isDark ? '#2E2E2E' : '#fff',
      width: '47%',
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
      elevation: 3,
      position: 'relative',
    },
    imageStyle: {
      width: '100%',
      height: 100,
      borderRadius: 8,
      marginBottom: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#640D5F',
      marginTop: 4,
    },
    canteen: {
      fontSize: 13,
      color: isDark ? '#ccc' : 'gray',
      marginTop: 2,
      marginBottom: 6,
    },
    button: {
      backgroundColor: '#FF8000',
      paddingVertical: 6,
      borderRadius: 6,
      paddingHorizontal: 10,
    },
    buttonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    reviewBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF8000',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    reviewText: {
      color: '#fff',
      fontSize: 12,
      marginRight: 3,
    },
    outOfStockText: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'red',
      color: '#fff',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 10,
      zIndex: 2,
    },
    iconButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 6,
    },
    discountedPrice: {
      color: '#FF8000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    originalPrice: {
      textDecorationLine: 'line-through',
      color: 'gray',
      fontSize: 14,
      marginLeft: 4,
    },
    offerText: {
      color: 'green',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    disabledButton: {
      backgroundColor: '#aaa',
      opacity: 0.6,
    },
    filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#ccc',
      borderRadius: 20,
      marginRight: 8,
    },
    activeFilterChip: {
      backgroundColor: '#FF8000',
    },
    filterText: {
      fontSize: 14,
      color: '#333',
    },
    activeFilterText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
