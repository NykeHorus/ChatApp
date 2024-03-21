import {FlatList, TouchableOpacity, Platform} from 'react-native';
import React, {useState, useEffect} from 'react';
import ChatList from '../components/Chat-screen.component';
import socket from '../utitils/socket';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Chats = ({navigation}) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // function fetchUsers() {
    // const iosUrl = 'http://localhost:4000/api';
    // const androidUrl = 'http://10.0.2.2:4000/api';
    // const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
    // axios
    //   .get(url)
    //   .then(response => {
    //     setRooms(response.data);
    //     console.log(response.data);
    //   })
    //   .catch(err => console.error(err));
    // }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://192.168.2.7:4000/api', {
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

// const [myData, setMyData] = useState(null);
// const [userName, setUserName] = useState(null);
// const rooms = [
//   {
//     id: 1,
//     name: 'Rick',
//     messages: [
//       {
//         id: '1A',
//         text: 'Jab Barish hoti hai tw pani ata hai',
//         time: '07:50',
//         user: 'Rick',
//       },
//     ],
//     image: require('../assets/images/371245.png'),
//   },
//   {
//     id: 2,
//     name: 'Morty',
//     messages: [
//       {
//         id: '2A',
//         text: 'Valar Mogulas',
//         time: '03:50',
//         user: 'Morty',
//       },
//     ],
//     image: require('../assets/images/208375.jpg'),
//   },
//   {
//     id: 3,
//     name: 'Summer',
//     messages: [
//       {
//         id: '3A',
//         text: 'Aftari Krne Chalo',
//         time: '02:50',
//         user: 'Summer',
//       },
//     ],
//     image: require('../assets/images/229654.jpg'),
//   },
// ];
// import {
//   getDatabase,
//   ref,
//   push,
//   update,
//   ref as sRef,
//   child,
//   get,
// } from 'firebase/database';

//const onAddFriend = async username => {
//   try {
//     //find user and add it to my friends and also add me to his friends
//     const database = getDatabase();

//     const user = await findUser(username);

//     if (user) {
//       if (user.username === myData.username) {
//         // don't let user add himself
//         return;
//       }

//       if (
//         myData.friends &&
//         myData.friends.findIndex(f => f.username === user.username) > 0
//       ) {
//         // don't let user add a user twice
//         return;
//       }
//       // create a chatroom and store the chatroom id

//       const newChatroomRef = push(ref(database, 'chatrooms'), {
//         firstUser: myData.username,
//         secondUser: user.username,
//         messages: [],
//       });

//       const newChatroomId = newChatroomRef.key;

//       const userFriends = user.friends || [];
//       //join myself to this user friend list
//       update(ref(database, `users/${user.username}`), {
//         friends: [
//           ...userFriends,
//           {
//             username: myData.username,
//             avatar: myData.avatar,
//             chatroomId: newChatroomId,
//           },
//         ],
//       });

//       const myFriends = myData.friends || [];
//       //add this user to my friend list
//       update(ref(database, `users/${myData.username}`), {
//         friends: [
//           ...myFriends,
//           {
//             username: user.username,
//             avatar: user.avatar,
//             chatroomId: newChatroomId,
//           },
//         ],
//       });
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// const findUser = async username => {
//   try {
//     const dbRef = sRef(getDatabase());
//     const snapshot = await get(child(dbRef, `users/${userName}`));

//     if (snapshot.exists()) {
//       console.log(snapshot.val());
//       return snapshot.val();
//     } else {
//       console.log('No data available');
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
