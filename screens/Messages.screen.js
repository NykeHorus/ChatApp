import React, {useState, useCallback, useEffect, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GiftedChat, Bubble, Actions} from 'react-native-gifted-chat';
import socket from '../utitils/socket';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenLoader from '../components/FullScreenLoader';
import {vh, vw} from '../utitils/theme';
import AttachmentSelectionModal from './ChatComponents/AttachmentSelectionModal';
import Recorder from './ChatComponents/Recoeder';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {post} from '../api/fetchHelpers';
import {endpoints} from '../api/config';
import Sound from 'react-native-sound';
import {message} from '../api/APIHelpers';

const Messages = ({route}) => {
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
            media: _res?.imageUrl,
            text: '',
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

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://192.168.2.6:4000/api/room/${roomId}/messages`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
          },
        },
      );
      let jsonRes = await res.json();
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

  const onSend = useCallback((newMessages = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    // Send new messages to the server
    socket.emit('newMessage', {
      room_id: roomId,
      message: newMessages[0].text,
      media: newMessages[0]?.media ? newMessages[0]?.media : null,
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
          // <Image
          //   style={styles.attachmentIcon}
          //   source={require('../assets/images/pin.png')}
          // />
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
            right: [styles.buble_view, {backgroundColor: 'red'}],
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
            backgroundColor: '#fff',
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
              console.log(allMessages);
              if (allMessages.some(obj => obj.playing === true)) {
                console.log('hey');
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
    } else {
      // If the message does not contain media, return null (no custom view)
      return null;
    }
  };

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
        onPressAttachment={setType}
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
});
