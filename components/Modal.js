import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import socket from '../utitils/socket';

const Modal = ({navigation}) => {
  const [chatName, setChatName] = useState('');

  const handleCreateRoom = () => {
    // sends a message containing the group name to the server
    socket.emit('createRoom', chatName);
    navigation.goBack();
  };
  console.log(chatName);
  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalsubheading}>Enter Username</Text>
      <TextInput
        style={styles.modalinput}
        placeholder="Username"
        onChangeText={value => setChatName(value)}
      />

      <View style={styles.modalbuttonContainer}>
        <TouchableOpacity style={styles.modalbutton} onPress={handleCreateRoom}>
          <Text style={styles.modaltext}>CREATE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalbutton, {backgroundColor: '#E14D2A'}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.modaltext}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Modal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    elevation: 1,
    backgroundColor: '#fff',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  modalinput: {
    borderWidth: 2,
    padding: 15,
  },
  modalsubheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modaltext: {
    color: '#fff',
  },
  modalbutton: {
    width: '40%',
    height: 45,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
});
