import React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import {HomeNavigator} from './home-tabs';
import Modal from '../components/Modal';
import Map from '../screens/ChatComponents/Map';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Group>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Home"
            component={HomeNavigator}
            options={{headerBackVisible: false, headerShown: false}}
            theme={DarkTheme}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{presentation: 'modal'}}>
          <Stack.Screen
            name="New Chat"
            component={Modal}
            options={{animation: 'slide_from_bottom'}}
          />
          <Stack.Screen
            name="Map"
            component={Map}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'transparentModal',
              modalPresentationStyle: 'overFullScreen',
              headerShown: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default AppNavigator;
