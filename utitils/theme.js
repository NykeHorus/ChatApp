import {Dimensions} from 'react-native';

export const vh = Dimensions.get('screen').height / 100;
export const vw = Dimensions.get('screen').width / 100;

export const jsonToFormdata = json => {
  var data = new FormData();
  const entries = Object.entries(json);
  entries.forEach(entry => {
    data.append(entry[0], entry[1]);
  });
  return data;
};
