import React, {useState, useCallback, useEffect, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GiftedChat, Actions} from 'react-native-gifted-chat';
import socket from '../utitils/socket';
import {Image, Platform, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenLoader from '../components/FullScreenLoader';
import {jsonToFormdata, vh, vw} from '../utitils/theme';
import AttachmentSelectionModal from './ChatComponents/AttachmentSelectionModal';
import Recorder from './ChatComponents/Recoeder';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVModeIOSOption,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
const Messages = ({route}) => {
  const [messages, setMessages] = useState([]);
  const [type, setType] = useState(null);
  const [showAttachmentSelectionModal, setShowAttachmentSelectionModal] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState('00:00');

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

  const onStopRecord = async () => {
    // const dirs = RNFetchBlob.fs.dirs;
    // const path = Platform.select({
    //   ios: 'hello.m4a',
    //   android: `${dirs.CacheDir}/hello.mp3`,
    // });
    // console.log(path);
    const res = await audioRecorderPlayer.stopRecorder();

    const fileContent = await RNFS.readFile(res, 'base64');
    const fileInfo = await RNFS.stat(res);
    const vnData = {
      fileCopyUri: fileInfo?.path,
      size: fileInfo?.size,
      type: 'audio/mpeg',
      name: Math.random() + '.aac',
    };

    const _res = await fetch(`http://192.168.8.63:4000/api/general/upload`, {
      method: 'POST',
      body: jsonToFormdata(vnData),
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        redirect: 'follow',
        'Content-Type': 'multipart/form-data',
      },
    });
    const _jsonRes = await _res.json();
    console.log('ressssss', _jsonRes);
    audioRecorderPlayer.removeRecordBackListener();
    setType(null);
    setDuration(`00:00`);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://192.168.8.63:4000/api/room/${roomId}/messages`,
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
      socket.emit('joinRoom', roomId);
    }
    socket.on('roomMessage', newMessage => {
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [newMessage]),
      );
    });
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    // Send new messages to the server
    socket.emit('newMessage', {
      room_id: roomId,
      message: newMessages[0].text,
      // You can replace this with actual user data
      user: {
        _id: userName._j,
        name: userName._j,
        avatar:
          'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
      },
      createdAt: {hour: new Date().getHours(), mins: new Date().getMinutes()},
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

  return (
    <>
      <GiftedChat
        renderUsernameOnMessage
        messages={messages}
        renderActions={renderActions}
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
    </>
  );
};
export default Messages;

const styles = StyleSheet.create({
  attachmentIcon: {
    height: vh * 3.5,
    width: vw * 8,
    resizeMode: 'contain',
  },
});
