
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const PencilCanteenFoodItems = ({ route }) => {
  const { itemId } = route.params;
  const [itemData, setItemData] = useState(null);
  const navigation = useNavigation();

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(
        `https://dev285691.service-now.com/api/now/table/u_canteen_menu?sysparm_query=sys_id=${itemId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Basic YWRtaW46ekJQOGJGaS8xIWZN',
          },
        }
      );
      const data = await response.json();
      const item = data.result[0];
      setItemData({
        id: itemId,
        name: item.u_item_name,
        price: item.u_item_price,
        original_price: item.u_original_price,
        offer: item.u_offer,
        image: { uri: item.u_item_image_url },
        description: item.u_description,
        reviews: [item.u_item_image_url, item.u_item_image_url, item.u_item_image_url],
        ratings: [item.u_rating1, item.u_rating2, item.u_rating3],
        feedbacks: [item.u_feedback1, item.u_feedback2, item.u_feedback3],
        canteen_name: 'Pencil Canteen',
      });
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, []);

  const getRatingColor = (rating) => {
    const value = parseFloat(rating);
    if (value <= 2) return 'red';
    if (value > 2 && value <= 4) return 'orange';
    return 'green';
  };

  const addToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      const cartArray = existingCart ? JSON.parse(existingCart) : [];

      const index = cartArray.findIndex((item) => item.id === itemData.id);

      if (index >= 0) {
        cartArray[index].quantity = (cartArray[index].quantity || 1) + 1;
      } else {
        cartArray.push({
          id: itemData.id,
          name: itemData.name,
          price: itemData.price,
          original_price: itemData.original_price,
          offer: itemData.offer,
          image: itemData.image,
          quantity: 1,
          canteen_name: itemData.canteen_name,
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cartArray));
      navigation.navigate('Cartscreen');
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  if (!itemData) return <Text style={{ padding: 16 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={itemData.image} style={styles.mainImage} />
      </View>

      <Text style={styles.name}>{itemData.name}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.discountedPrice}>₹{itemData.price}</Text>
        <Text style={styles.originalPrice}>₹{itemData.original_price}</Text>
        <Text style={styles.offerText}>{itemData.offer} off</Text>
      </View>

      <Text style={styles.description}>{itemData.description}</Text>

      <Text style={styles.sectionTitle}>Review Images</Text>
      <View style={styles.reviewRow}>
        {itemData.reviews.map((uri, i) =>
          uri ? (
            <Image key={i} source={{ uri }} style={styles.reviewImage} />
          ) : null
        )}
      </View>

      <Text style={styles.sectionTitle}>Ratings & Feedback</Text>
      {itemData.ratings.map((rate, i) => (
        <View
          key={i}
          style={[styles.ratingFeedback, { borderLeftColor: getRatingColor(rate) }]}
        >
          <Text style={[styles.rating, { color: getRatingColor(rate) }]}>⭐ {rate}</Text>
          <Text style={styles.feedback}>• {itemData.feedbacks[i]}</Text>
        </View>
      ))}

      {/* Cart Button */}
      <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
        <Text style={styles.cartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainImage: {
    width: width * 0.5,
    height: height * 0.3,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#640D5F',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF8000',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#888',
  },
  offerText: {
    fontSize: 14,
    color: 'green',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'justify',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#640D5F',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  reviewImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  ratingFeedback: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedback: {
    fontSize: 15,
    color: '#333',
  },
  cartButton: {
    backgroundColor: '#FF8000',
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#640D5F',
  },
});

export default PencilCanteenFoodItems;
