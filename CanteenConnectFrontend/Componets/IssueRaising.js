
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const IssueRaiseScreen = () => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  

  useEffect(() => {
    const fetchUser = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedName = await AsyncStorage.getItem('userName');
      setEmail(storedEmail || '');
      setUsername(storedName || '');
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!issueType || !description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields!',
      });
      return;
    }

    try {
      await axios.post('http://192.168.55.104:3101/raise-issue', {
        email,
        username,
        issue_type: issueType,
        description,
        order_id: orderId,
      });
      console.log('Data being sent:', {
        email,
        username,
        issue_type: issueType,
        description,
        order_id: orderId,
      });


      Toast.show({
        type: 'success',
        text1: 'Issue Raised Successfully!',
      });

      setIssueType('');
      setDescription('');
      setOrderId('');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to raise issue!',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🚨 Raise an Issue</Text>

      <Text style={styles.label}>Issue Type *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={issueType}
          onValueChange={(itemValue) => setIssueType(itemValue)}
          style={styles.picker}
        >
           <Picker.Item label="Select Issue Type" value="" />
          <Picker.Item label="App is slow" value="App is slow" />
          <Picker.Item label="Wrong item delivered" value="Wrong item delivered" />
          <Picker.Item label="Food quality is bad" value="Food quality is bad" />
          <Picker.Item label="App crashed during order" value="App crashed during order" />
          <Picker.Item label="Canteen closed unexpectedly" value="Canteen closed unexpectedly" />
          <Picker.Item label="Delayed service" value="Delayed service" />
          <Picker.Item label="Wrong item parcel" value="Wrong item parcel" />  
          <Picker.Item label="Rude behavior from Canteen staff" value="Rude behavior from Canteen staff" />
          <Picker.Item label="Price mismatch in app and bill" value="Price mismatch in app and bill" />
          <Picker.Item label="Not able to login" value="Not able to login" />
          <Picker.Item label="Not able to sign up" value="Not able to sign up" />
          <Picker.Item label="Item served cold" value="Item served cold" />
          <Picker.Item label="Other" value="Other" />

        </Picker>
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        value={description}
        onChangeText={setDescription}
        placeholder="Briefly describe the issue..."
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Order ID (optional)</Text>
      <TextInput
        style={styles.input}
        value={orderId}
        onChangeText={setOrderId}
        placeholder="Enter Order ID (if any)"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>📨 Submit Issue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f9fc',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: '#2d3436',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2d3436',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0984e3',
    paddingVertical: 14,
    marginTop: 25,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default IssueRaiseScreen;
