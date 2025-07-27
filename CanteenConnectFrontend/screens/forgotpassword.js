import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateEmailOrPhone = (input) => {
    // Validate email format OR 10-digit phone number
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Email or phone number is required.');
      setEmailError('');
      return;
    }
    if (!validateEmailOrPhone(email.trim())) {
      setErrorMessage('Enter a valid email or 10-digit phone number.');
      setEmailError('');
      return;
    }

    setEmailError('');
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await fetch("http://192.168.55.104:3101/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const text = await response.text();
      console.log("Raw response:", text);

      const data = JSON.parse(text);
      console.log("Forgot password response:", data);

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          navigation.navigate('ResetPassword', { email });
        }, 3000);
      } else {
        setErrorMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }

  };




  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View animation="fadeInDown" duration={800} style={styles.container}>

          {/* Success Message */}
          {successMessage ? (
            <Animatable.View animation="fadeInDown" duration={500} style={styles.successMessageContainer}>
              <Text style={styles.successMessageText}>{successMessage}</Text>
            </Animatable.View>
          ) : null}
          {errorMessage ? (
            <Animatable.View animation="fadeInDown" duration={500} style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </Animatable.View>
          ) : null}


          {/* Top: Animated Background Image */}
          <Animatable.View animation="fadeInDown" delay={200} style={styles.topContainer}>
            <ImageBackground
              source={require('../assets/forgotpdImg.jpg')}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            />
          </Animatable.View>

          {/* Bottom: Animated Form */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.bottomContainer}>

            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>

            {/* Title */}
            <Animatable.Text animation="fadeInDown" delay={600} style={styles.title}>
              Forgot Your Password?
            </Animatable.Text>

            {/* Description */}
            <Animatable.Text animation="fadeIn" delay={800} style={styles.description}>
              Enter your email address or phone number to receive instructions for creating a new password.
            </Animatable.Text>

            {/* Input */}
            <Animatable.View animation="fadeInLeft" delay={1000} style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="gray" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="default"
                autoCapitalize="none"
              />
            </Animatable.View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Submit Button */}
            <Animatable.View animation="fadeInUp" delay={1200}>
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  successMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4BB543',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 9999,
    elevation: 10,
    alignItems: 'center',
  },
  successMessageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topContainer: {
    flex: 1,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  bottomContainer: {
    flex: 1.2,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: -50,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FFAC1C',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
