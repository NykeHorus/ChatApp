import {io} from 'socket.io-client';
const socket = io.connect('http://192.168.2.8:4000');
export default socket;

let instance = null;

export const setSocket = _instance => {
  if (_instance) {
    instance = _instance;
  }
};

export const getSocket = () => {
  if (instance) {
    return instance;
  }
};
