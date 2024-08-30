import ReactNativeToastMessage from 'react-native-toast-message';
// const TAG = "__API__";

function ToastMessage() {
  this.success = message => {
    if (typeof message !== 'string') {
      message = 'An error occured. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'success',
      position: 'top',
      text1: 'Success',
      text2: message,
      props: {
        style: {
          backgroundColor: 'green',
        },
      },
    });
  };

  this.error = message => {
    if (typeof message !== 'string') {
      message = 'An error occured. Please try again later';
    }

    ReactNativeToastMessage.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: message,
      props: {
        style: {
          backgroundColor: 'red',
        },
      },
    });
  };
}

export const Toast = new ToastMessage();

// export const LOG = (label, data) => {
//   if (__DEV__) {
//     console.log(TAG + `__${label}__ :`, data);
//   }
// };

export const showToast = msg => {
  presentToast(getMessage(msg));
};

// export const showGlobalToast = msg => {};
export const presentToast = message => {
  setTimeout(() => {
    // Toast.show(message);
    Toast.error(message);
  }, 500);

  // EventRegister.emit(events.showToast, getMessage(message))
};

export const handleResponse = ({response, jsonResponse}) => {
  switch (response.status) {
    case 200:
    case 201: {
      if (
        Object.prototype.hasOwnProperty.call(jsonResponse, 'errors') ||
        Object.prototype.hasOwnProperty.call(jsonResponse, 'error')
      ) {
        const message = getMessage(jsonResponse);
        return Promise.reject(message);
      } else {
        return Promise.resolve(jsonResponse);
      }
    }
    case 401: {
      //   EventRegister.emit('throwOut');
      const message = getMessage(jsonResponse);
      return Promise.reject(message);
    }
    default: {
      const message = getMessage(jsonResponse);
      return Promise.reject(message);
    }
  }
};

export const performNetworkRequest = async (url, configs) => {
  url = encodeURI(url);

  try {
    const response = await fetch(url, configs);
    const jsonResponse = await response.json();
    return Promise.resolve({response, jsonResponse});
  } catch (e) {
    return Promise.reject(e);
  }
};

export const message = 'Something went wrong';

export const getMessage = json => {
  switch (typeof json) {
    case 'string': {
      return json;
    }
    case 'object': {
      if (Array.isArray(json)) {
        var data = json[0];
        return getMessage(data);
      } else {
        if (json.errors) {
          const data = json.errors;
          if (typeof data === 'object') {
            const values = Object.values(data);
            return getMessage(values);
          } else {
            return getMessage(data);
          }
        } else {
          if (json.validation_error || typeof json.message === 'object') {
            if (json.validation_error) {
              let errorKeys = Object.keys(json.validation_error);
              return getMessage(json.validation_error[errorKeys[0]][0]);
            }
            // ye check hatana hai jab backend fix hoga tab
            else {
              let errorKeys = Object.keys(json.message);
              return getMessage(json.message[errorKeys[0]][0]);
            }
          }
          if (json.message) {
            return getMessage(json.message);
          } else if (json.error) {
            return getMessage(json.error);
          } else {
            return message;
          }
        }
      }
    }
    default: {
      return message;
    }
  }
};

export const jsonToFormdata = json => {
  var data = new FormData();
  const entries = Object.entries(json);
  entries.forEach(entry => {
    data.append(entry[0], entry[1]);
  });
  return data;
};

export const getConfigs = (method, body, formData = true) => {
  var headers = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  };
  if (formData == true) {
    headers['Content-Type'] = 'multipart/form-data';
    headers['redirect'] = 'follow';
  }

  var configs = {
    method: method,
    headers: headers,
  };
  if (body) {
    if (method == 'POST' || method == 'PUT') {
      if (formData == true) {
        configs['body'] = jsonToFormdata(body);
      } else {
        configs['body'] = JSON.stringify(body);
      }
    }
  }
  return configs;
};

export const dataToQueryParameter = data => {
  if (typeof data === 'object') {
    if (!Array.isArray(data)) {
      var params = '?';
      const dataArray = Object.entries(data);
      if (dataArray.length > 0) {
        dataArray.forEach((entry, index) => {
          var amp = index < dataArray.length - 1 ? '&' : '';
          params = `${params}${entry[0]}=${entry[1]}${amp}`;
        });
        return params;
      }
    }
  } else if (typeof data === 'string') {
    return data;
  }
  return '';
};
