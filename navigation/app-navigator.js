import React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/Login';
import {HomeNavigator} from './home-tabs';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
