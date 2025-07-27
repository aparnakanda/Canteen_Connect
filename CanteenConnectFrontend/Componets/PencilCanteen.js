import React, { useState,useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import PencilCanteenFoodItems from './PencilCanteenfooditems';
import Cartscreen from './Cartscreen';

const ITEM_TYPES = ['All', 'Veg', 'Non-Veg', 'Beverages'];
const COST_FILTERS = ['All', '₹0–₹30', '₹30–₹60', '₹60–₹200'];

const PencilCanteenMain = () => {
  const navigation = useNavigation();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [theme, setTheme] = useState('light');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');

  const isDark = theme === 'dark';
  const toggleTheme = async () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  await AsyncStorage.setItem('appTheme', newTheme);
};


  useEffect(() => {
  const loadTheme = async () => {
    const storedTheme = await AsyncStorage.getItem('appTheme');
    if (storedTheme) setTheme(storedTheme);
  };
  loadTheme();
}, []);

useLayoutEffect(() => {
  navigation.setOptions({
    headerShown:true,
    headerTitle: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={require('../assets/pencil canteen.jpg')}
          style={{ width: 35, height: 35, borderRadius: 17, marginRight: 4 ,marginLeft:-15}}
        />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#FF8000' : '#640D5F' }}>
          Pencil Canteen
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


  const fetchFoodItems = async () => {
    try {
      const response = await fetch(
        'https://dev285691.service-now.com/api/now/table/u_canteen_menu?sysparm_query=u_canteen_name=Pencil Canteen',
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
        canteen: item.u_canteen_name,
        availability: (item.u_availability || '').toLowerCase() === 'yes' ? 'yes' : 'no',
        item_type: item.u_item_type || 'All',
        original_price: item.u_original_price,
        offer: item.u_offer,
        description: item.u_description,
      }));

      setFoodItems(formattedItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
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
        canteen_name: item.canteen || 'Pencil Canteen',
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

  
  const toggleWishlist = async item => {
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];
      const exists = wishlist.find(i => i.id === item.id);

      let updated;
      if (exists) {
        updated = wishlist.filter(i => i.id !== item.id);
      } else {
        updated = [...wishlist, item];
      }

      setWishlistIds(updated.map(i => i.id));
      await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
    } catch (e) {
      console.error('Wishlist toggle error:', e);
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

  const styles = getThemedStyles(isDark);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Type filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ITEM_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedType === type && styles.activeFilterChip]}
              onPress={() => setSelectedType(type)}>
              <Text style={[styles.filterText, selectedType === type && styles.activeFilterText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cost filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {COST_FILTERS.map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.filterChip, selectedCost === range && styles.activeFilterChip]}
              onPress={() => setSelectedCost(range)}>
              <Text style={[styles.filterText, selectedCost === range && styles.activeFilterText]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {filteredItems.map(item => {
            const isOutOfStock = item.availability === 'no';
            const isWished = wishlistIds.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('PencilCanteenFoodItems', { itemId: item.id })}>
                <Image source={item.image} style={styles.imageStyle} />
                <TouchableOpacity onPress={() => toggleWishlist(item)} style={styles.wishlistIcon}>
                  <MaterialIcons name={isWished ? 'favorite' : 'favorite-border'} size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.canteen}>{item.canteen}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.discountedPrice}>₹{item.price}</Text>
                  <Text style={styles.originalPrice}>₹{item.original_price}</Text>
                  <Text style={styles.offerText}>₹{item.offer} off</Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, isOutOfStock && styles.disabledButton]}
                  onPress={() => addToCart(item)}
                  disabled={isOutOfStock}>
                  <Text style={styles.buttonText}>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const PencilCanteen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PencilCanteenMain" component={PencilCanteenMain} />
    <Stack.Screen name="PencilCanteenFoodItems" component={PencilCanteenFoodItems} />
    <Stack.Screen name="Cartscreen" component={Cartscreen} />
  </Stack.Navigator>
);

export default PencilCanteen;

const getThemedStyles = isDark =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#FCFAF8',
    },
    container: {
      padding: 16,
    },
    filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#ccc',
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 10,
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      backgroundColor: isDark ? '#333' : '#fff',
      width: '47%',
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
      elevation: 3,
    },
    imageStyle: {
      width: '100%',
      height: 100,
      borderRadius: 8,
      marginBottom: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#640D5F',
    },
    canteen: {
      fontSize: 12,
      color: 'gray',
    },
    discountedPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FF8000',
    },
    originalPrice: {
      fontSize: 14,
      color: 'gray',
      textDecorationLine: 'line-through',
      marginLeft: 6,
    },
    offerText: {
      fontSize: 14,
      color: 'green',
      fontWeight: '600',
      marginLeft: 6,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 6,
    },
    ratingBadge: {
      backgroundColor: '#FF8000',
      borderRadius: 12,
      marginLeft: 0,
      width: 50,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    ratingText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#FF8000',
      paddingVertical: 8,
      marginTop: 6,
      borderRadius: 6,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#aaa',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    wishlistIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
  });
