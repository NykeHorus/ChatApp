import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';

const ChatList = ({item, navigation}) => {
  const [messages, setMessages] = useState({});

  //Retrieves the last message in the array
  useEffect(() => {
    setMessages(item?.messages[item?.messages.length - 1]);
    console.log(item.messages.text);
  }, [item]);

  ///👇🏻 Navigates to the Messaging screen
  const handleNavigation = () => {
    navigation.navigate('Msg', {
      roomId: item?.id,
      name: item?.name,
    });
  };

  return (
    <TouchableOpacity onPress={handleNavigation} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={item?.image} style={styles.image} />
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{item?.name}</Text>
          <Text style={styles.text}>{messages?.time}</Text>
        </View>
        <Text style={styles.message}>{messages?.text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  image: {
    flex: 1,
    height: 60,
    width: 60,
    resizeMode: 'contain',
    borderRadius: 50,
  },
  imageContainer: {
    backgroundColor: 'black',
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
  },
  rightContainer: {flex: 1},
  text: {
    fontSize: 10,
    justifyContent: 'flex-end',
    color: 'grey',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
  },
});
