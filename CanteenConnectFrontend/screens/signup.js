import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Keyboard
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConPassword, setHideConPassword] = useState(true);
  const [errors, setErrors] = useState({});

  const base_url = "http://192.168.55.104:3101/signup";

  const validateAndSubmit = async () => {
    Keyboard.dismiss();
    const newErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or Phone is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
        newErrors.emailOrPhone = 'Enter a valid email or phone number';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post(base_url, {
          username,
          email_or_phone: emailOrPhone,
          password,
        });

        if (response.data.message === 'User registered successfully') {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'User registered successfully!',
          });

          setTimeout(() => {
            navigation.navigate('Login');
          }, 2000);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            Toast.show({
              type: 'error',
              text1: 'Signup Failed',
              text2: 'User already exists',
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: error.response.data.message || 'Something went wrong',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Network Error',
            text2: 'Please check your internet or server connection',
          });
        }
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Animatable.Image
              animation="fadeInDown"
              delay={100}
              duration={1200}
              source={require('../assets/signupImg.jpeg')}
              style={styles.image}
            />

            <Animatable.View animation="fadeInUp" delay={300} duration={1000} style={styles.formContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <View style={styles.backIconWrapper}>
                  <Ionicons name="arrow-back" size={20} color="#000" />
                </View>
              </TouchableOpacity>

              <View style={styles.tabContainer}>
                <Text style={styles.tabActive}>Sign Up</Text>
              </View>

              {/* Username */}
              <Animatable.View animation="fadeInUp" delay={200} duration={700}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="gray" style={styles.icon} />
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                    }}
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </Animatable.View>

              {/* Email/Phone */}
              <Animatable.View animation="fadeInUp" delay={300} duration={700}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail" size={20} color="gray" style={styles.icon} />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#999"
                    style={styles.input}
                    keyboardType="email-address"
                    value={emailOrPhone}
                    onChangeText={(text) => {
                      setEmailOrPhone(text);
                      if (errors.emailOrPhone) setErrors((prev) => ({ ...prev, emailOrPhone: '' }));
                    }}
                  />
                </View>
                {errors.emailOrPhone && <Text style={styles.errorText}>{errors.emailOrPhone}</Text>}
              </Animatable.View>

              {/* Password */}
              <Animatable.View animation="fadeInUp" delay={400} duration={700}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="gray" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={hidePassword}
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                  />
                  <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={20} />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </Animatable.View>

              {/* Confirm Password */}
              <Animatable.View animation="fadeInUp" delay={500} duration={700}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="gray" style={styles.icon} />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry={hideConPassword}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                  />
                  <TouchableOpacity onPress={() => setHideConPassword(!hideConPassword)}>
                    <Ionicons name={hideConPassword ? 'eye-off' : 'eye'} size={20} />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </Animatable.View>

              {/* Sign Up Button */}
              <Animatable.View animation="fadeInUp" delay={600} duration={700}>
                <TouchableOpacity style={styles.button} onPress={validateAndSubmit}>
                  <Text style={styles.buttonText}>Sign up</Text>
                </TouchableOpacity>
              </Animatable.View>

              {/* OR and Google */}
              <Animatable.View animation="fadeInUp" delay={700} duration={700}>
                <View style={styles.orContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.line} />
                </View>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome name="google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              </Animatable.View>

              {/* Bottom Link */}
              <Animatable.View animation="fadeInUp" delay={800} duration={700}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.bottomLink}>
                    Already have an account? <Text style={styles.linkText}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: height * 0.32,
    resizeMode: 'cover',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FF8000',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: -30,
  },
  backButton: {
    position: 'absolute',
    top: 25,
    left: 20,
    zIndex: 10,
  },
  backIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  tabActive: {
    marginTop:-10,
    fontSize: 26,
    color: '#000',
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    color: '#8B0000',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFAC1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
  },
  orText: {
    marginHorizontal: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    justifyContent: 'center',
    height: 50,
  },
  socialButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomLink: {
    textAlign: 'center',
    color: '#000',
    marginTop: 10,
    fontSize: 14,
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});