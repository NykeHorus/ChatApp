import React, {useState, useCallback, useEffect, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GiftedChat, Bubble, Actions} from 'react-native-gifted-chat';
import socket from '../utitils/socket';
import {StyleSheet, View, TouchableOpacity, Image, Linking} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenLoader from '../components/FullScreenLoader';
import {vh, vw} from '../utitils/theme';
import AttachmentSelectionModal from './ChatComponents/AttachmentSelectionModal';
import Recorder from './ChatComponents/Recoeder';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {post} from '../api/fetchHelpers';
import {base_url, endpoints} from '../api/config';
import Sound from 'react-native-sound';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import MapView, {Marker} from 'react-native-maps';

//--------------------------------------------------------------------------------------------------------------------------------

const Messages = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [type, setType] = useState(null);
  const [showAttachmentSelectionModal, setShowAttachmentSelectionModal] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const userName = useMemo(() => AsyncStorage.getItem('username'), []);

  const {roomId} = route.params;
  const {coords} = route.params;

  // Audio part
  const audioRecorderPlayer = useMemo(() => {
    return new AudioRecorderPlayer();
  }, []);

  const onStartRecord = async () => {
    await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener(e => {
      const minutes = Math.floor(e?.currentPosition / 60000);
      const remainingMilliseconds = e?.currentPosition % 60000;
      const seconds = Math.floor(remainingMilliseconds / 1000);

      setDuration(`${minutes}:${seconds}`);

      // console.log(
      //   e?.currentPosition,
      //   audioRecorderPlayer?.mmss(Math.floor(e?.currentPosition)),
      // );
      // this.setState({
      //   recordSecs: e.currentPosition,
      //   recordTime: this.audioRecorderPlayer.mmssss(
      //     Math.floor(e.currentPosition),
      //   ),
      // });
      return;
    });
  };

  const uid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const onStopRecord = async () => {
    try {
      const res = await audioRecorderPlayer.stopRecorder();
      const fileContent = await RNFS.readFile(res, 'base64');
      const fileInfo = await RNFS.stat(res);
      const image = {
        uri: fileInfo?.path,
        type: 'audio/mpeg',
        name: 'sound.mp3',
      };
      setLoading(true);
      const _res = await post(endpoints.account.uploadImage, {image}, true);
      if (_res) {
        let newMessage = [
          {
            _id: uid(),
            text: '',
            image: null,
            doc: null,
            media: _res?.imageUrl,
            user: {
              _id: userName._j,
              name: userName._j,
              avatar:
                'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
            },
            createdAt: new Date(),
          },
        ];
        onSend(newMessage);
      }
      audioRecorderPlayer.removeRecordBackListener();
      setType(null);
      setDuration(`00:00`);
      setLoading(false);
    } catch (e) {
      audioRecorderPlayer.removeRecordBackListener();
      setType(null);
      setDuration(`00:00`);
      console.log('Error', e);
      setLoading(false);
    }
  };

  //----------------------------------------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base_url}/room/${roomId}/messages`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
      });
      let jsonRes = await res.json();
      // console.log(jsonRes);
      setMessages(jsonRes);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type?.name === 'Voice') {
      onStartRecord();
    }
  }, [type]);

  useEffect(() => {
    loadData();
    if (roomId) {
      socket.emit('joinRoom', roomId, () => {});
    }
    socket.on('roomMessage', newMessage => {
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [newMessage]),
      );
    });
  }, [roomId]);

  const onSelectImage = async type => {
    try {
      let option = {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      };
      if (type == 'Camera') {
        option = {...option, cameraType: 'back'};
      }
      const res =
        type === 'Camera'
          ? await launchCamera(option)
          : await launchImageLibrary(option);
      const image = {
        uri: res?.assets[0]?.uri,
        type: res?.assets[0]?.type,
        name: res?.assets[0]?.fileName,
      };

      setLoading(true);
      const _res = await post(endpoints.account.uploadImage, {image}, true);
      let newMessage = [
        {
          _id: uid(),
          text: null,
          image: _res?.imageUrl,
          doc: null,
          media: null,
          user: {
            _id: userName._j,
            name: userName._j,
            avatar:
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
          },
          createdAt: new Date(),
        },
      ];
      onSend(newMessage);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log('Error', e);
    }
  };

  const onSelectDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.allFiles,
      });

      const doc = {
        uri: res?.uri,
        // type: 'application/pdf',
        type: res?.type,
        name: res?.name,
      };
      setLoading(true);
      const _res = await post(
        endpoints.account.uploadImage,
        {image: doc},
        true,
      );
      let newMessage = [
        {
          _id: uid(),
          text: null,
          image: null,
          media: null,
          doc: _res?.imageUrl,
          user: {
            _id: userName._j,
            name: userName._j,
            avatar:
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
          },
          createdAt: new Date(),
        },
      ];
      onSend(newMessage);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log('Error', e);
    }
  };

  useEffect(() => {
    if (coords) {
      let newMessage = [
        {
          _id: uid(),
          text: null,
          image: null,
          media: null,
          doc: null,
          location: coords,
          user: {
            _id: userName._j,
            name: userName._j,
            avatar:
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
          },
          createdAt: new Date(),
        },
      ];
      onSend(newMessage);
    }
  }, [coords]);

  const onSend = useCallback((newMessages = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    socket.emit('newMessage', {
      room_id: roomId,
      message: newMessages[0].text,
      image: newMessages[0]?.image ? newMessages[0]?.image : null,
      media: newMessages[0]?.media ? newMessages[0]?.media : null,
      doc: newMessages[0]?.doc ? newMessages[0]?.doc : null,
      location: newMessages[0]?.location ? newMessages[0]?.location : null,
      user: {
        _id: userName._j,
        name: userName._j,
        avatar:
          'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
      },
      createdAt: new Date(),
    });
  }, []);

  const renderActions = props => {
    return (
      <Actions
        {...props}
        icon={() => (
          <Ionicons name={'attach-outline'} size={25} color={'black'} />
        )}
        onPressActionButton={() => setShowAttachmentSelectionModal(true)}
      />
    );
  };

  const renderBubble = props => {
    return (
      <View>
        <Bubble
          {...props}
          textStyle={{
            left: styles.time,
            right: styles.time,
          }}
          wrapperStyle={{
            left: styles.wrapperStyle,
            right: [styles.buble_view, {backgroundColor: 'white'}],
          }}
        />
      </View>
    );
  };

  const renderCustomView = ({currentMessage}) => {
    if (currentMessage.media) {
      // Check if the message contains media (in this case audio)
      return (
        <View
          style={{
            width: vw * 60,
            borderRadius: vw * 2,
            paddingTop: vh,
            paddingLeft: vw * 2,
            justifyContent: 'center',
            backgroundColor: 'lightgreen',
          }}>
          {/* Render your custom view here */}
          {/* You can access currentMessage.media and render the audio player */}
          <TouchableOpacity
            onPress={() => {
              let allMessages = [...messages];
              let index = allMessages?.findIndex(
                item => item?._id == currentMessage?._id,
              );
              let audio;
              setSelectedPlayerId(index);
              if (allMessages.some(obj => obj.playing === true)) {
                audio.stop();
                audio.release;
              }
              if (!allMessages[index].playing) {
                allMessages[index].playing = true;
                setIsPlaying(true);
                setMessages(allMessages);
                audio = new Sound(
                  allMessages[index]?.media,
                  undefined,
                  error => {
                    if (error) {
                      console.log(error);
                    } else {
                      audio.play(() => {
                        setMessages(allMessages);
                        setIsPlaying(false);
                        audio.release();
                      });
                    }
                    allMessages[index].playing = false;
                  },
                );
              } else {
              }
              // allMessages[index].playing = !allMessages[index].playing;
              // setMessages(allMessages);
            }}
            style={styles.playPaseContainer}>
            <Ionicons
              // name={currentMessage?.playing ? 'pause' : 'play' + '-outline'}
              name={
                isPlaying && currentMessage?.playing
                  ? 'pause'
                  : 'play' + '-outline'
              }
              size={25}
              color={'black'}
            />
          </TouchableOpacity>
        </View>
      );
    }
    if (currentMessage?.doc) {
      const handleDownload = () => {
        Linking.openURL(currentMessage?.doc);
      };
      // name = currentMessage.doc.split('/').pop();
      const fileType = currentMessage?.doc?.split('.').pop();
      return (
        <View style={styles.documentContainer}>
          <TouchableOpacity onPress={() => handleDownload()}>
            <Ionicons name={'download-outline'} size={25} color={'black'} />
          </TouchableOpacity>
          <Image
            source={
              fileType === 'pdf'
                ? require('../assets/images/pdf.png')
                : {uri: currentMessage?.doc}
            }
            style={styles.imageContainer}
          />
        </View>
      );
    }
    if (currentMessage?.location?.latitude) {
      console.log(Number(currentMessage.location.latitude));
      return (
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() =>
            navigation.navigate({
              name: 'Map',
              params: {location: currentMessage?.location},
            })
          }>
          <MapView
            style={styles.map}
            customMapStyle={darkMapStyle}
            // disableDefaultUI:false
            initialRegion={{
              latitude: Number(currentMessage.location.latitude),
              longitude: Number(currentMessage.location.longitude),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}>
            <Marker
              coordinate={{
                latitude: Number(currentMessage.location.latitude),
                longitude: Number(currentMessage.location.longitude),
              }}>
              <Ionicons name={'pin-sharp'} size={35} color={'red'} />
            </Marker>
          </MapView>
        </TouchableOpacity>
      );
    } else {
      return;
    }
  };
  const renderChatFooter = useCallback(() => {
    // console.log(message.doc);
    if (messages.doc) {
      return (
        <View style={styles.chatFooter}>
          <Image source={{uri: imagePath}} style={{height: 75, width: 75}} />
          <TouchableOpacity
            onPress={() => {}}
            style={styles.buttonFooterChatImg}>
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
  });

  return (
    <View style={styles.chatScreen}>
      <GiftedChat
        renderBubble={renderBubble}
        messages={messages}
        timeTextStyle={{left: {color: 'white'}, right: {color: 'blue'}}}
        renderActions={renderActions}
        shouldUpdateMessage={(props, nextProps) => {
          return props.currentMessage.playing ==
            nextProps.currentMessage.playing
            ? true
            : false;
        }}
        renderChatFooter={renderChatFooter}
        renderCustomView={renderCustomView}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: userName._j,
          avatar:
            'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
        }}
      />
      {type?.name == 'Voice' && (
        <Recorder duration={duration} onPressCancel={() => onStopRecord()} />
      )}
      <FullScreenLoader loading={loading} />
      <AttachmentSelectionModal
        onPressAttachment={value => {
          if (value?.name == 'Photos' || value?.name == 'Camera') {
            onSelectImage(value?.name);
            return;
          }
          if (value?.name == 'Document') {
            onSelectDocument();
            return;
          }
          if (value?.name == 'Location') {
            navigation.navigate('Map');
            console.log('acnjn');
            return;
          }
          setType(value);
        }}
        onPressBackground={() => setShowAttachmentSelectionModal(false)}
        showAttachmentSelection={showAttachmentSelectionModal}
      />
    </View>
  );
};
export default Messages;

const styles = StyleSheet.create({
  attachmentIcon: {
    height: vh * 3.5,
    width: vw * 8,
    resizeMode: 'contain',
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#6e8270', // Change this to the desired background color
  },
  wrapperStyle: {
    backgroundColor: 'white',
    borderRadius: vw * 2,
  },
  playPaseContainer: {
    height: vh * 4,
    width: vw * 10,
    justifyContent: 'center',
    alignContent: 'center',
  },
  documentContainer: {
    paddingLeft: vw * 2,
    flexDirection: 'row',
    alignItems: 'center',
    height: vh * 15,
    width: vw * 40,
    borderRadius: vw * 2,
    backgroundColor: 'red',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  chatFooter: {
    shadowColor: '#1F2687',
    shadowOpacity: 0.37,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'blue',
  },
  textFooterChat: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
  },
  locationContainer: {
    alignItems: 'center',
    height: vh * 20,
    width: vw * 50,
    borderRadius: vw * 2,
    // backgroundColor: 'red',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
});

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];
