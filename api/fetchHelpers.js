import {base_url} from './config';
import {
  dataToQueryParameter,
  getConfigs,
  getMessage,
  handleResponse,
  performNetworkRequest,
} from './APIHelpers';
export const post = async (endpoint, body, formData, queryParams) => {
  const url = base_url + endpoint + dataToQueryParameter(queryParams);
  console.log('URLLLLLL POSTTT=======>>>>>>>', url);
  const configs = getConfigs('POST', body, formData);
  try {
    const networkResult = await performNetworkRequest(url, configs);
    const result = await handleResponse(networkResult);
    return Promise.resolve(result);
  } catch (e) {
    const message = getMessage(e);
    return Promise.reject(message);
  }
};
export const get = async (endpoint, queryParams) => {
  const url = base_url + endpoint + dataToQueryParameter(queryParams);
  console.log('URLLLLLL GEETTT=======>>>>>>>', url);
  const configs = getConfigs('GET');

  try {
    const networkResult = await performNetworkRequest(url, configs);
    const result = await handleResponse(networkResult);
    return Promise.resolve(result);
  } catch (e) {
    const message = getMessage(e);
    return Promise.reject(message);
  }
};
export const put = async (endpoint, body, formData, queryParams) => {
  const url = base_url + endpoint + dataToQueryParameter(queryParams);
  const configs = getConfigs('PUT', body, formData);
  try {
    const networkResult = await performNetworkRequest(url, configs);
    const result = await handleResponse(networkResult);
    return Promise.resolve(result);
  } catch (e) {
    const message = getMessage(e);
    return Promise.reject(message);
  }
};
export const deleteRequest = async (endpoint, queryParams) => {
  const url = base_url + endpoint + dataToQueryParameter(queryParams);
  const configs = getConfigs('DELETE');
  try {
    const networkResult = await performNetworkRequest(url, configs);
    const result = await handleResponse(networkResult);
    return Promise.resolve(result);
  } catch (e) {
    const message = getMessage(e);
    return Promise.reject(message);
  }
};
const Api = {
  post: post,
  get: get,
  put: put,
  delete: deleteRequest,
};
export default Api;
