import {io} from 'socket.io-client';
const socket = io.connect('http://172.20.10.14:4000');
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
