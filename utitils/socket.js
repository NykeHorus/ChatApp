import {io} from 'socket.io-client';
import {socket_url} from '../api/config';

const socket = io.connect(`${socket_url}`);
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
