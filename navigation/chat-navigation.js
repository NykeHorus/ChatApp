import React from 'react';
import Chats from '../screens/home.screen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Messages from '../screens/Messages.screen';

const ChatStack = createNativeStackNavigator();

const ChatsNavigator = () => {
  return (
    <ChatStack.Navigator initialRouteName="Chats">
      <ChatStack.Group>
        <ChatStack.Screen name="Chat" component={Chats} />
        <ChatStack.Screen
          name="Msg"
          component={Messages}
          options={({route}) => ({title: route.params.name})}
        />
      </ChatStack.Group>
    </ChatStack.Navigator>
  );
};

export default ChatsNavigator;
