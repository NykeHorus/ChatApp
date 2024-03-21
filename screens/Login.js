import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({navigation}) => {
  const [userName, setUserName] = useState(null);

  //--------------------------------------------------------------------------
  // saves the username to AsyncStorage and redirect to the Chat page
  const storeUsername = async () => {
    try {
      await AsyncStorage.setItem('username', userName);
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error! While saving username');
    }
  };

  //--------------------------------------------------------------------------
  //handle Login
  const onLogin = () => {
    if (userName?.trim()) {
      storeUsername();
    } else {
      Alert.alert('Username is required.');
    }
  };
  //--------------------------------------------------------------------------

  useEffect(() => {
    const getUsername = async () => {
      try {
        const value = await AsyncStorage.getItem('username');
        if (value !== null) {
          navigation.navigate('Home');
        }
      } catch (e) {
        console.error('Error while loading username!');
      }
    };
    getUsername();
  }, []);
  console.log(userName);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <TextInput
        style={styles.input}
        onChangeText={text => setUserName(text)}
        placeholder="UserName"
      />
      <View style={styles.spacing} />

      <TouchableOpacity style={styles.area} onPress={() => onLogin()}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#32527b',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    width: '80%',
    paddingVertical: '2%',
    borderRadius: 20,
    textAlign: 'center',
  },
  area: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: '30%',
    paddingVertical: '2%',
    alignItems: 'center',
  },
  spacing: {
    margin: '2%',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});
