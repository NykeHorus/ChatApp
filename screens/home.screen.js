import {FlatList, TouchableOpacity, Platform} from 'react-native';
import React, {useState, useEffect} from 'react';
import ChatList from '../components/Chat-screen.component';
import socket from '../utitils/socket';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {base_url} from '../api/config';

const Chats = ({navigation}) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${base_url}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
      });
      let jsonRes = await res.json();
      setRooms(jsonRes);
    } catch (e) {
      console.log('Error', e);
    }
  };

  //👇🏻 Runs whenever there is new trigger from the backend
  useEffect(() => {
    socket.on('roomsList', room => {
      setRooms(room);
    });
  }, [socket]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('New Chat')}>
          <Ionicons name="add-outline" size={30} color="green" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  // console.log(rooms[0]);
  console.log(rooms);

  return (
    rooms.length > 0 && (
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ChatList item={item} navigation={navigation} />
        )}
      />
    )
  );
};

export default Chats;
