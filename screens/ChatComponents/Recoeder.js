import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {vh, vw} from '../../utitils/theme';

const Recorder = ({onPressCancel, duration}) => {
  return (
    <View style={styles.container}>
      <View style={styles.recorderView}>
        <View style={styles.simpleRow}>
          <Ionicons name={'mic-outline'} size={30} color={'white'} />
          <Text style={styles.time}>{duration}</Text>
        </View>
        <TouchableOpacity onPress={onPressCancel}>
          <Text style={styles.time}> Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Recorder;

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: vh * 15,
    backgroundColor: '#8aa899',
  },
  recorderView: {
    paddingHorizontal: vw * 3,
    width: '80%',
    borderRadius: vw * 2,
    alignItems: 'center',
    backgroundColor: '#5c6e58',
    height: vh * 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: '#fff',
  },
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
