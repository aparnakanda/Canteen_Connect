import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [topAlert, setTopAlert] = useState({ message: '', type: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputs = [];


  const handleOtpChange = (text, index) => {
    const newOtp = [...otpDigits];
    newOtp[index] = text;
    setOtpDigits(newOtp);

    if (text && index < 5) {
      otpInputs[index + 1].focus(); // Auto move to next input
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpInputs[index - 1].focus();
    }
  };

  // Email is passed from Forgot Password screen
  const email = route.params?.email;

  useEffect(() => {
    if (topAlert.message) {
      const timer = setTimeout(() => {
        setTopAlert({ message: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [topAlert]);

  const showAlert = (message, type = 'error') => {
    setTopAlert({ message, type });
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      showAlert('Please enter the full 6-digit OTP.');
      return;
    }

    try {
      const response = await fetch('http://192.168.55.104:3101/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      const data = JSON.parse(text);
      if (data.success) {
        setOtpVerified(true);
        showAlert('OTP verified successfully', 'success');
      } else {
        showAlert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      showAlert('Server error. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setNewPasswordError('');
    setConfirmPasswordError('');

    let valid = true;

    if (!newPassword) {
      setNewPasswordError('New password is required.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      valid = false;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch(`http://192.168.55.104:3101/reset-password/${email}/${otp}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Password has been reset.', 'success');
        setTimeout(() => navigation.navigate('Login'), 1000);
      } else {
        showAlert(data.message || 'Something went wrong.');
      }
    } catch (error) {
      showAlert('Server error. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {topAlert.message ? (
        <Animatable.View
          animation="fadeInDown"
          duration={500}
          style={[
            styles.alertBanner,
            topAlert.type === 'success' ? styles.successBanner : styles.errorBanner,
          ]}
        >
          <Text style={styles.alertText}>{topAlert.message}</Text>
        </Animatable.View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Animatable.View animation="fadeInDown" duration={800} style={styles.container}>
            <Animatable.View animation="fadeInDown" delay={200} style={styles.topContainer}>
              <ImageBackground
                source={require('../assets/forgotpdImg.jpg')}
                style={styles.imageBackground}
                imageStyle={styles.imageStyle}
              />
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={400} style={styles.bottomContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={25} color="#000" />
              </TouchableOpacity>

              <Animatable.Text animation="fadeInDown" delay={600} style={styles.title}>
                Reset Your Password
              </Animatable.Text>

              <Animatable.Text animation="fadeIn" delay={800} style={styles.description}>
                {otpVerified
                  ? 'Enter your new password.'
                  : 'Enter the OTP sent to your email.'}
              </Animatable.Text>

              {/* OTP input (always shown first) */}
              {/* <View style={styles.otpContainer}>
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit !== '' ? styles.otpInputActive : null,
                    ]}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    value={digit}
                  />
                ))}
              </View>

              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null} */}
              {/* OTP input - show only if not verified */}
{!otpVerified && (
  <>
    <View style={styles.otpContainer}>
      {otpDigits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (otpInputs[index] = ref)}
          style={[
            styles.otpInput,
            digit !== '' ? styles.otpInputActive : null,
          ]}
          keyboardType="numeric"
          maxLength={1}
          onChangeText={(text) => handleOtpChange(text, index)}
          onKeyPress={(e) => handleOtpKeyPress(e, index)}
          value={digit}
        />
      ))}
    </View>
    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
  </>
)}

              {!otpVerified ? (
                <Animatable.View animation="fadeInUp" delay={1100}>
                  <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  </TouchableOpacity>
                </Animatable.View>
              ) : (
                <>
                  {/* New Password */}
                  <Animatable.View animation="fadeInLeft" delay={1200} style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="gray" style={styles.icon} />
                    <TextInput
                      placeholder="New Password"
                      placeholderTextColor="#999"
                      style={styles.input}
                      value={newPassword}
                      secureTextEntry={!showNewPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (text) setNewPasswordError('');
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Ionicons
                        name={showNewPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                  {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

                  {/* Confirm Password */}
                  <Animatable.View animation="fadeInLeft" delay={1300} style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="gray" style={styles.icon} />
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      style={styles.input}
                      value={confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (text) setConfirmPasswordError('');
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}

                  {/* Reset Password Button */}
                  <Animatable.View animation="fadeInUp" delay={1400}>
                    <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                      <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>
                  </Animatable.View>
                </>
              )}
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- No UI changes below ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 9999,
    elevation: 10,
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#4BB543',
  },
  errorBanner: {
    backgroundColor: '#FF3B30',
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topContainer: {
    height: 230,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: 'hidden',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
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
    flex: 1,
    padding: 25,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 13,
    left: 10,
    backgroundColor: '#fff',
    padding: 1,
    borderRadius: 20,
    elevation: 4,
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginVertical: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  otpInputActive: {
    borderColor: '#800080',
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
