import React, {useState, useEffect} from 'react';
import {
  Actions,
  Bubble,
  Day,
  GiftedChat,
  InputToolbar,
  Send,
  Time,
} from 'react-native-gifted-chat';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  SafeAreaView,
  Platform,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faFilePdf,
  faPlay,
  faPaperclip,
  faDownload,
  faHeadphonesAlt,
} from '@fortawesome/free-solid-svg-icons';
import {faPaperPlane} from '@fortawesome/free-regular-svg-icons';
import {launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import I18n from '../../i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
  FileModal,
  VideoModal,
  PreviewModal,
  AvatarModal,
  LoaderModal,
} from './component';
import SocketIOClient from 'socket.io-client';

import {uuid} from '../../utils/functions';
import {COLORS, FONTS, SIZES} from '../../constants';
import {ModalHandler, uploadFile} from '../../redux/actions/modal-action';
import {Header, Loader, Text} from '../../components';
import {chatConfig} from '../../config';

let socket;
socket = SocketIOClient(chatConfig.BASE_URL);

const Chat = ({navigation}) => {
  const dispatch = useDispatch();

  const [previewModal, setPreviewModal] = useState(false);
  const [source, setSource] = useState(null);
  const [size, setSize] = useState(false);
  const [type, setType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [backgroundLoader, setBackgroundLoader] = useState(null);
  const [avatar, setAvatar] = useState({
    show: false,
    image: null,
  });

  const {user} = useSelector(state => state.AuthReducer);
  const {appointment_id} = useSelector(state => state.AppointmentReducer);
  const {doc_board_id} = useSelector(state => state.AppointmentReducer);

  useEffect(() => {
    let msg = [];
    socket.emit(
      'join',
      {
        name: user?.id,
        friendlyName: user?.name,
        room: appointment_id ? appointment_id : doc_board_id,
      },
      message => {
        message.map(item => {
          msg.push({
            _id: item?._id ? item?._id : uuid(),
            createdAt: item?.createdOn,
            text: item?.text,
            doc: {
              file: item?.doc,
              file_name: item?.doc
                ? item?.doc.split('/')[item?.doc?.split('/').length - 1]
                : null,
            },
            image: item?.image,
            player: item?.player,
            sound: {
              uri: item?.sound,
              file_name: item?.sound
                ? item?.sound.split('/')[item?.sound.split('/').length - 1]
                : null,
            },
            pending: false,
            sent: true,
            received: true,
            user: {
              _id: item?.user,
              name: item?.userFriendlyName ? item?.userFriendlyName : 'Admin',
              avatar: 'https://placeimg.com/140/140/any',
            },
          });
        });
        setMessages(msg.reverse());
      },
    );

    socket.on('message', message => {
      if (message) {
        setBackgroundLoader(false);
        setMessages(messages => [
          {
            _id: uuid(),
            createdAt: new Date(),
            text: message?.text ? message?.text : null,
            doc: {
              file: message?.doc ? message?.doc : null,
              file_name: message?.doc
                ? message?.doc.split('/')[message?.doc.split('/').length - 1]
                : null,
            },
            image: message?.image ? message?.image : null,
            player: message?.player ? message?.player : null,
            sound: {
              uri: message?.sound ? message?.sound : null,
              file_name: message?.sound
                ? message?.sound.split('/')[
                    message?.sound.split('/').length - 1
                  ]
                : null,
            },
            pending: false,
            sent: true,
            received: true,
            user: {
              _id: message?.user,
              name: message?.userFriendlyName
                ? message?.userFriendlyName
                : 'Admin',
              avatar: 'https://placeimg.com/140/140/any',
            },
          },
          ...messages,
        ]);
      }
    });

    return () => {
      socket.emit('disconnect-user');
      socket.off();
      setMessages([]);
    };
  }, [appointment_id, user?.id, user?.name]);

  const onSend = message => {
    if (message) {
      const messageToSend = message?.map(v => ({
        text: v?.text ? v.text : null,
        image: v?.image ? v.image : null,
        player: v?.player ? v.player : null,
        doc: v?.doc?.file ? v.doc.file : null,
        sound: v?.sound?.uri ? v.sound?.uri : null,
        createdOn: v?.createdAt,
      }));
      socket.emit('sendMessage', messageToSend[0], () => {
        console.log('Message Sent Successfully');
      });
    }
  };
  const getUrlofFile = async ({file, type, time, size}) => {
    if (size <= chatConfig.ATTACHMENT_SIZE_LIMIT) {
      try {
        setBackgroundLoader(true);
        const url = await uploadFile(file);
        const apiData = {
          text: null,
          image: type == 'image' ? url : null,
          player: type == 'video' ? url : null,
          doc: type == 'document' ? url : null,
          sound: type == 'audio' ? url : null,
          createdOn: time,
        };
        socket.emit('sendMessage', apiData, () => {
          console.log('Message Sent Successful');
        });
      } catch (e) {
        setBackgroundLoader(false);
        dispatch(
          ModalHandler({
            show: true,
            message: e,
            type: 'Error',
          }),
        );
      }
    } else {
      dispatch(
        ModalHandler({
          message: I18n.t('file_size_error_text'),
          show: true,
          type: 'Error',
        }),
      );
    }
  };
  const chooseFile = type => {
    var options;
    if (type === 'image') {
      options = {
        storageOptions: {
          skipBackup: true,
          path: 'all',
        },
      };
    } else {
      options = {
        title: 'Video Picker',
        mediaType: 'video',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };
    }
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        launchImageLibrary(options, response => {
          if (response.didCancel) {
            console.log(response.didCancel);
          } else if (response.errorCode) {
            console.log(response.errorCode);
          } else if (response.errorMessage) {
            console.log(response.errorMessage);
          } else {
            const sourceProps = {
              uri: response.assets[0]?.uri,
              type: response.assets[0]?.type,
              name: response.assets[0]?.fileName,
              size: response.assets[0]?.fileSize,
            };
            setSource(sourceProps);
            if (type === 'image') {
              setPreviewModal(true);
              setType('image');
              setSize(sourceProps?.size);
            } else {
              setPreviewModal(true);
              setType('video');
              setSize(sourceProps?.size);
            }
          }
        });
      }, 100);
    } else {
      launchImageLibrary(options, response => {
        console.log('Image Library Executed', response);
        if (response.didCancel) {
          console.log(response.didCancel);
        } else if (response.errorCode) {
          console.log(response.errorCode);
        } else if (response.errorMessage) {
          console.log(response.errorMessage);
        } else {
          const sourceProps = {
            uri: response.assets[0]?.uri,
            type: response.assets[0]?.type,
            name: response.assets[0]?.fileName,
            size: response.assets[0]?.fileSize,
          };
          setSource(sourceProps);
          if (type === 'image') {
            setPreviewModal(true);
            setType('image');
            setSize(sourceProps?.size);
          } else {
            setPreviewModal(true);
            setType('video');
            setSize(sourceProps?.size);
          }
        }
      });
    }
  };
  const selectOneFile = async type => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          type == 'audio'
            ? DocumentPicker.types.audio
            : DocumentPicker.types.pdf,
        ],
      });
      const obj = {
        uri: res[0]?.uri,
        type: res[0]?.type,
        name: res[0]?.name,
      };
      setSource(obj);
      if (type == 'audio') {
        if (res[0]?.type === 'audio/mpeg') {
          setPreviewModal(true);
          setSize(res[0]?.size);
          setType(type);
        } else {
          dispatch(
            ModalHandler({
              message: I18n.t('audio_not_support'),
              show: true,
              type: 'Error',
            }),
          );
        }
      } else if (type == 'document') {
        if (
          res[0].type === 'application/pdf' ||
          res[0].type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          setPreviewModal(true);
          setSize(res[0]?.size);
          setType(type);
        } else {
          dispatch(
            ModalHandler({
              message: I18n.t('invalid_document_text'),
              show: true,
              type: 'Error',
            }),
          );
        }
      }
    } catch (err) {
      console.log('Unknown Error: ', err);
    }
  };
  const renderSend = props => {
    return (
      <Send {...props} containerStyle={{}}>
        <View style={{marginRight: 10, marginBottom: 12}}>
          <FontAwesomeIcon
            color={COLORS.primary}
            size={20}
            icon={faPaperPlane}
          />
        </View>
      </Send>
    );
  };
  const renderCustomView = props => {
    const {currentMessage} = props;
    return currentMessage?.doc?.file ? (
      <View style={{padding: 10}}>
        <View style={styles.documet_row}>
          <FontAwesomeIcon icon={faFilePdf} color="white" />
          <TouchableOpacity
            onPress={() => Linking.openURL(currentMessage?.doc?.file)}>
            <FontAwesomeIcon icon={faDownload} color="white" />
          </TouchableOpacity>
        </View>
        <Text
          text={currentMessage?.doc?.file_name}
          style={[styles.time, {...FONTS.Light12, marginTop: 10}]}
          numberOfLines={1}
        />
      </View>
    ) : currentMessage?.player ? (
      <TouchableOpacity
        onPress={() => {
          setVideoModal(true);
          setVideoUri(currentMessage?.player);
        }}
        style={styles.video}>
        <View style={styles.play_view}>
          <FontAwesomeIcon
            icon={faPlay}
            size={25}
            color={
              currentMessage?.user?._id === user?.id
                ? COLORS.secondary
                : COLORS.primary
            }
          />
        </View>
      </TouchableOpacity>
    ) : currentMessage?.sound?.uri ? (
      <View style={{padding: 10}}>
        <View style={styles.documet_row}>
          <FontAwesomeIcon icon={faHeadphonesAlt} color={COLORS.white} />
          <TouchableOpacity
            onPress={() => Linking.openURL(currentMessage?.sound?.uri)}>
            <FontAwesomeIcon icon={faDownload} color="white" />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.time, {...FONTS.Light12, marginTop: 10}]}
          text={currentMessage?.sound?.file_name}
          numberOfLines={1}
        />
      </View>
    ) : null;
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
            left: styles.buble_view,
            right: [styles.buble_view, {backgroundColor: COLORS.secondary}],
          }}
        />
      </View>
    );
  };
  const renderInputToolbar = props => {
    return <InputToolbar {...props} containerStyle={styles.input_toolbar} />;
  };
  const renderActions = props => {
    return (
      <Actions
        {...props}
        icon={() => (
          <FontAwesomeIcon
            color={COLORS.primary}
            size={20}
            icon={faPaperclip}
          />
        )}
        onPressActionButton={() => setShowModal(true)}
      />
    );
  };
  const renderTime = props => {
    return <Time {...props} timeFormat={'hh:mm'} />;
  };
  const renderDay = props => {
    return (
      <Day
        {...props}
        textStyle={{
          color: COLORS.secondary,
        }}
      />
    );
  };
  const renderLoading = props => {
    return (
      <View style={styles.loadingContainer}>
        <Loader style={{marginTop: 0}} color={COLORS.primary} />
      </View>
    );
  };
  const user_obj = {
    _id: user?.id,
    name: 'React Native',
    avatar: 'https://placeimg.com/140/140/any',
  };

  return (
    <SafeAreaView style={styles.safe_area}>
      <View style={styles.main_view}>
        <Header
          headTitle={I18n.t('chat_head')}
          onPressBack={() => navigation.goBack()}
          nav={navigation}
        />
        <LoaderModal visible={backgroundLoader} />
        <FileModal
          onPressBackground={() => setShowModal(false)}
          visible={showModal}
          onPressIcon={type => {
            setShowModal(false);
            if (type === 'image' || type === 'video') {
              chooseFile(type);
            } else {
              if (Platform.OS == 'ios') {
                setTimeout(() => {
                  selectOneFile(type);
                }, 100);
              } else {
                selectOneFile(type);
              }
            }
          }}
        />
        <VideoModal
          closeVideoModal={() => setVideoModal(false)}
          uri={videoUri}
          visible={videoModal}
        />
        <PreviewModal
          visible={previewModal}
          fileName={source?.name}
          uri={source?.uri}
          type={type}
          onPressCancel={() => setPreviewModal(false)}
          onPressSend={() => {
            setPreviewModal(false);
            getUrlofFile({
              file: source,
              size: size,
              time: new Date(),
              type: type,
            });
          }}
        />
        <AvatarModal
          visible={avatar?.show}
          onPressClose={() => setAvatar({...avatar, show: false})}
          uri={avatar?.image}
        />

        <GiftedChat
          onPressAvatar={props => setAvatar({show: true, image: props?.avatar})}
          renderMessageVideo={props => renderMessageVideo(props)}
          messages={messages}
          alwaysShowSend={true}
          renderSend={props => renderSend(props)}
          renderTime={props => renderTime(props)}
          renderBubble={props => renderBubble(props)}
          renderCustomView={props => renderCustomView(props)}
          renderInputToolbar={props => renderInputToolbar(props)}
          renderActions={props => renderActions(props)}
          renderDay={props => renderDay(props)}
          timeTextStyle={{
            left: styles.time,
            right: styles.time,
          }}
          infiniteScroll={true}
          isLoadingEarlier={true}
          onSend={messages => onSend(messages)}
          user={user_obj}
          renderLoading={() => renderLoading()}
          renderUsernameOnMessage
        />
      </View>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
  },
  main_view: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  buble_view: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: SIZES.padding2,
    borderBottomLeftRadius: SIZES.padding2,
    borderBottomRightRadius: 0,
  },
  input_toolbar: {
    marginHorizontal: 5,
    marginBottom: Platform.OS === 'ios' ? 5 : 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.padding,
  },
  send_img: {
    height: SIZES.radius,
    width: SIZES.radius,
  },
  play_view: {
    height: SIZES.padding * 2,
    width: SIZES.padding * 2,
    borderRadius: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  documet_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  video: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center_align: {
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: SIZES.padding * 5,
    height: SIZES.padding * 5,
  },
  time: {
    textAlign: 'left',
    color: COLORS.white,
  },
  text: {
    textAlign: 'left',
    ...FONTS.Light12,
  },
});
