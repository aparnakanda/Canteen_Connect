// ✅ Combined ProfileScreen.js with working Review Modal per order
import React, { useState, useEffect, useCallback } from 'react';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity,
  Alert, Modal, ActivityIndicator, TextInput, Button
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import {
  SERVICENOW_INSTANCE,
  SERVICENOW_USERNAME,
  SERVICENOW_PASSWORD,
  SERVICENOW_TABLE,
} from '@env';

export default function ProfileScreen() {
  const [orders, setOrders] = useState([]);
  const [darkTheme, setDarkTheme] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // 👈 for tracking which order is reviewed

  const navigation = useNavigation();

  const themeStyles = {
    container: { backgroundColor: darkTheme ? '#000' : '#f8f9fa' },
    title: { color: darkTheme ? '#FFA500' : '#FF8C00' },
    profileCard: { backgroundColor: darkTheme ? '#1A1A1A' : '#fff' },
    info: { color: darkTheme ? '#FFA500' : '#000' },
    orderItem: { backgroundColor: darkTheme ? '#222' : '#eee' },
    orderText: { color: darkTheme ? '#FFA500' : '#000' },
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const email = (await AsyncStorage.getItem('userEmail'))?.trim();
        setUserEmail(email);
        fetchUserDetails(email);
        fetchOrderDetails(email);
      };
      fetchData();
    }, [])
  );

  const fetchUserDetails = async (email) => {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${SERVICENOW_USERNAME}:${SERVICENOW_PASSWORD}`).toString('base64');
      const response = await axios.get(
        `${SERVICENOW_INSTANCE}/api/now/table/${SERVICENOW_TABLE}?sysparm_query=u_email=${email}&sysparm_limit=1`,
        { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
      );
      const user = response.data.result[0];
      if (user) {
        setUserInfo({
          username: user.u_username,
          email: user.u_email,
          photo: user.u_photo_url || null,
        });
      } else {
        Alert.alert('User not found');
      }
    } catch (error) {
      console.error('User fetch error:', error);
    }
  };

  const fetchOrderDetails = async (email) => {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${SERVICENOW_USERNAME}:${SERVICENOW_PASSWORD}`).toString('base64');
      const response = await axios.get(
        `${SERVICENOW_INSTANCE}/api/now/table/u_order_details?sysparm_query=u_email=${email}&sysparm_limit=20&sysparm_display_value=true`,
        { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
      );
      const formatted = response.data.result.map(item => ({
        id: item.sys_id,
        item: item.u_item_name,
        canteen: item.u_canteen_name,
        cost: item.u_item_price,
        date: item.u_created_on?.split(' ')[0] || '',
      }));
      setOrders(formatted);
    } catch (error) {
      console.error('Order fetch error:', error);
    }
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, themeStyles.title]}>User Profile</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => setDarkTheme(!darkTheme)} style={styles.toggleButton}>
            <Icon name={darkTheme ? 'sunny' : 'moon'} size={24} color={darkTheme ? '#FFA500' : '#FFB800'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userName');
              navigation.navigate('Login');
            }}
            style={styles.toggleButton}
          >
            <Icon name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={[styles.profileCard, themeStyles.profileCard]}>
        {userInfo?.photo ? (
          <Image source={{ uri: userInfo.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="person-circle-outline" size={80} color="#fff" />
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, themeStyles.info]}>{userInfo?.username || 'Loading...'}</Text>
          <Text style={[styles.emailText, themeStyles.info]}>{userInfo?.email || 'Loading...'}</Text>
        </View>
      </View>

      {/* Orders */}
      <Text style={[styles.title, { marginTop: 20 }, themeStyles.title]}>Order History</Text>
     <FlatList
  data={orders}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Animatable.View animation="fadeInUp" duration={800} style={[styles.orderItem, themeStyles.orderItem]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderText, themeStyles.orderText]}>
            <Text style={styles.bold}>Item:</Text> {item.item}
          </Text>
          <Text style={[styles.orderText, themeStyles.orderText]}>
            <Text style={styles.bold}>Canteen:</Text> {item.canteen}
          </Text>
          <Text style={[styles.orderText, themeStyles.orderText]}>
            <Text style={styles.bold}>Cost:</Text> ₹{item.cost}
          </Text>
          <Text style={[styles.orderText, { color: '#999' }]}>
            <Text style={styles.bold}>Date:</Text> {item.date}
          </Text>
        </View>

        <ReviewButton
          darkTheme={darkTheme}
          itemName={item.item}
          canteenName={item.canteen}
          onReviewSubmit={(data) => {
            console.log('Review for', item.item, data);
            Alert.alert("Success", `Review submitted for ${item.item}`);
          }}
        />
      </View>
    </Animatable.View>
  )}

  ListFooterComponent={
   <View style={styles.buttonRow}>
  <TouchableOpacity
    style={styles.button}
onPress={() => navigation.navigate('IssueRaiseScreen')}
  >
    <Text style={styles.buttonText}>➕ Raise Issue</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.button, { backgroundColor: '#4CAF50' }]}
    onPress={() => navigation.navigate('IssueList')}
  >
    <Text style={styles.buttonText}>📋 My Issues</Text>
  </TouchableOpacity>
</View>

  }
/>

    </View>
  );
}

// ⬇️ ReviewButton component used above
function ReviewButton({ darkTheme, itemName, canteenName, onReviewSubmit }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const openCamera = async () => {
    setPhotoModalVisible(false);
    setLoadingPhoto(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0]);
      }
    } finally {
      setLoadingPhoto(false);
    }
  };

  const openGallery = async () => {
    setPhotoModalVisible(false);
    setLoadingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets?.length > 0) {
        setPhoto(result.assets[0]);
      }
    } finally {
      setLoadingPhoto(false);
    }
  };

  const isSubmitDisabled = !photo || !comment.trim() || !rating || isNaN(rating) || rating < 1 || rating > 5;

  return (
    <>
      <TouchableOpacity
        style={styles.reviewButtonInline}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.reviewButtonText}>Review📝</Text>
      </TouchableOpacity>

      {/* Review Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContent, darkTheme && { backgroundColor: '#000' }]}>
          <Text style={[styles.modalTitle, { color: darkTheme ? '#FFA500' : '#FF8C00' }]}>Review: {itemName}</Text>

          <TouchableOpacity style={styles.photoUpload} onPress={() => setPhotoModalVisible(true)}>
            {loadingPhoto ? <ActivityIndicator /> : photo ? (
              <Image source={{ uri: photo.uri }} style={{ width: 150, height: 150 }} />
            ) : (
              <Text style={{ color: '#888' }}>Tap to upload photo</Text>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Write your comment"
            placeholderTextColor={darkTheme ? '#AAA' : '#888'}
            multiline
            style={[
              styles.commentInput,
              {
                backgroundColor: darkTheme ? '#222' : '#fff',
                color: darkTheme ? '#FFA500' : '#000',
                borderColor: darkTheme ? '#FFA500' : '#ccc',
              },
            ]}
            value={comment}
            onChangeText={setComment}
          />

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star.toString())}>
                <Text style={{ fontSize: 30, color: star <= parseInt(rating) ? '#FFD700' : '#ccc' }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            <Button
              title="Submit"
              disabled={isSubmitDisabled}
              onPress={() => {
                const review = {
                  photo,
                  comment,
                  rating: parseInt(rating),
                  itemName,
                  canteenName,
                };
                onReviewSubmit(review);
                setModalVisible(false);
              }}
              color={darkTheme ? '#FFA500' : '#FF8C00'}
            />
          </View>
        </View>
      </Modal>

      {/* Photo Picker Modal */}
      <Modal visible={photoModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.photoModalContainer, { backgroundColor: darkTheme ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: darkTheme ? '#FFA500' : '#FF8C00' }]}>Choose Option</Text>
            <TouchableOpacity style={styles.photoOptionButton} onPress={openCamera}>
              <Text style={{ color: '#fff' }}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOptionButton} onPress={openGallery}>
              <Text style={{ color: '#fff' }}>🖼 Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)}>
              <Text style={{ color: '#FF3B30' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  
  // styles as in your code...

  container: { flex: 1, padding: 16, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  toggleButton: { padding: 8, borderRadius: 20, backgroundColor: '#eee' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  photo: { width: 90, height: 90, borderRadius: 45, marginRight: 16 },
  infoContainer: { flexShrink: 1 },
  nameText: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emailText: { fontSize: 15, color: '#666' },
  orderItem: {
    borderRadius: 12, padding: 16, marginVertical: 8, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  reviewButtonInline: {
    backgroundColor: '#FF8C00', padding: 10, borderRadius: 8, marginLeft: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  orderText: { fontSize: 15, marginBottom: 4 },
  bold: { fontWeight: '600' },
  modalContent: { flex: 1, padding: 20, justifyContent: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  commentInput: { height: 100, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  modalBackground: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  photoModalContainer: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' },
  photoOptionButton: { width: '100%', paddingVertical: 14, backgroundColor: '#FF8C00', borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  photoUpload: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  raiseIssueButton: {
  marginTop: 20,
  marginBottom: 30,
  backgroundColor: '#FF8C00',
  padding: 12,
  borderRadius: 8,
  alignSelf: 'center',
},
raiseIssueButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  paddingHorizontal: 10,
  gap: 10,
},

button: {
  flex: 1,
  backgroundColor: '#FF8C00',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
},

buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});
