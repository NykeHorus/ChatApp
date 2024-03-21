import React from 'react';
import {StyleSheet, Modal, View, ActivityIndicator} from 'react-native';
const FullScreenLoader = ({loading = false}) => {
  return (
    <Modal transparent statusBarTranslucent visible={loading}>
      <View style={styles.container}>
        <ActivityIndicator color={'white'} size={'large'} />
      </View>
    </Modal>
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000' + '88',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
