import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';

import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Dimensions } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SigninScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const validateForm = () => {
    let valid = true;

    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Email is required' });
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email) && !/^[6-9]\d{9}$/.test(email)) {
      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Enter a valid email or phone' });
      valid = false;
    }

    if (!password.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Password is required' });
      valid = false;
    } else if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Invalid Password', text2: 'Minimum 8 characters required' });
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://192.168.55.104:3101/signin", {
        email_or_phone: email,
        password: password,
      });

      if (response.data.message === "Login successful") 
        {
            
        Toast.show({ type: 'success', text1: 'Login Successful', visibilityTime: 1000 });

        if (response.data?.user) {
          const { email_or_phone, username } = response.data.user;
          if (email_or_phone && username) {
            await AsyncStorage.setItem('userEmail', email_or_phone.trim());
            await AsyncStorage.setItem('userName', username.trim());
          }
        }

        setTimeout(() => {
          navigation.navigate('HomeTabs');
        }, 1500);
      }
    } catch (error) {
      console.log('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Animatable.Image
            animation="fadeInDown"
            delay={100}
            duration={1200}
            source={require('../assets/LoginImg.jpg')}
            style={styles.image}
          />

          <Animatable.View animation="fadeInUp" delay={300} duration={1000} style={styles.formContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <View style={styles.backIconWrapper}>
                <Ionicons name="arrow-back" size={20} color="#000" />
              </View>
            </TouchableOpacity>

            <View style={styles.tabContainer}>
              <Text style={styles.tabActive}>Sign In</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="gray" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="gray" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={{ padding: 5 }}>
                <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.bottomLink}>
                Don't have an account? <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: {
    width: '100%',
    height: '45%',
    resizeMode: 'cover',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 26,
    zIndex: 10,
  },
  backIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FF8000',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -60,
    padding: 25,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -10
  },
  tabActive: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 8,
    height: 50,
    marginTop: 10,
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#000',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: 'bold',
    marginRight: 7,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 50,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -7,
  },
  buttonText: {
    color: '#FFAC1C',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    justifyContent: 'center',
    marginBottom: 15,
    height: 50,
  },
  socialButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomLink: {
    textAlign: 'center',
    color: '#000',
    marginTop: 5,
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});