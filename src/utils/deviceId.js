import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'wallet_device_id';

function generateId() {
  return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function getDevicePayload() {
  return {
    device_id: await getDeviceId(),
    device_name: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
    platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  };
}
