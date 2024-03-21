import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Text} from 'react-native';
import ChatsNavigator from './chat-navigation';

const TAB_ICON = {
  Contacts: 'happy-outline',
  Chats: 'chatbubbles-outline',
  Settings: 'cog-outline',
};

const createScreenOptions = ({route}) => {
  const iconName = TAB_ICON[route.name];
  return {
    tabBarIcon: ({size, color}) => (
      <Ionicons name={iconName} size={size} color={color} />
    ),
    headerShown: false,
    tabBarActiveTintColor: 'tomato',
    tabBarInactiveTintColor: 'gray',
  };
};

const Tab = createBottomTabNavigator();

const Profiles = () => <Text>Contacts</Text>;
const Settings = () => <Text>Settings</Text>;

export const HomeNavigator = () => {
  return (
    <Tab.Navigator screenOptions={createScreenOptions} initialRouteName="Chats">
      <Tab.Screen name="Contacts" component={Profiles} />
      <Tab.Screen name="Chats" component={ChatsNavigator} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};
