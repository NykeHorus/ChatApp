import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {vh, vw} from '../../utitils/theme';

export default function AttachmentSelectionModal({
  showAttachmentSelection = false,
  onPressBackground,
  onPressAttachment,
}) {
  const attachments = [
    {
      name: 'Photos',
      value: 1,
      image: require('../../assets/images/photos.png'),
    },
    {
      name: 'Camera',
      value: 2,
      image: require('../../assets/images/camera.png'),
    },
    {
      name: 'Location',
      value: 3,
      image: require('../../assets/images/location.png'),
    },
    {
      name: 'Document',
      value: 4,
      image: require('../../assets/images/document.png'),
    },
    {
      name: 'Voice',
      value: 5,
      image: require('../../assets/images/mic.png'),
    },
  ];
  return (
    <Modal
      animationType="fade"
      visible={showAttachmentSelection}
      statusBarTranslucent
      transparent>
      <TouchableWithoutFeedback onPress={onPressBackground}>
        <View style={styles.container}>
          <View style={styles.innerView}>
            {attachments?.map((attachment, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => {
                    onPressBackground();
                    onPressAttachment(attachment);
                  }}
                  style={styles.attachment}>
                  <Image
                    style={styles.attahcmentImage}
                    source={attachment?.image}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#000000' + '88',
  },
  innerView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingVertical: vh * 2,
    paddingHorizontal: vw * 3,
    borderTopLeftRadius: vw * 3,
    borderTopRightRadius: vw * 3,
    width: '100%',
    backgroundColor: '#8aa899',
    height: vh * 20,
  },
  attachment: {
    height: vw * 18,
    width: vw * 18,
    marginRight: vw * 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vh * 1.5,
    borderRadius: (vw * 18) / 2,
    backgroundColor: '#ffffff',
  },
  attahcmentImage: {
    width: '40%',
    height: '40%',
    resizeMode: 'contain',
  },
});
