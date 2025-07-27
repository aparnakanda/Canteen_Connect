import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';


const Splash = ({ navigation }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Signup');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/Splash.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        isLooping
        shouldPlay
        isMuted
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FD7807',
  },
});
