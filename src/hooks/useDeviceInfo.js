import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceName: 'Unknown',
    brand: 'Unknown',
    modelName: 'Unknown',
    osName: 'Unknown',
    osVersion: 'Unknown',
    ipAddress: 'Unknown',
    networkType: 'Unknown',
    installationId: 'Unknown',
    isLoading: true,
  });

  useEffect(() => {
    async function fetchDeviceInfo() {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        const networkState = await Network.getNetworkStateAsync();
        
        let installId = 'Unknown';
        if (Platform.OS === 'android') {
          installId = Application.androidId;
        } else if (Platform.OS === 'ios') {
          installId = await Application.getIosIdForVendorAsync();
        }

        setDeviceInfo({
          deviceName: Device.deviceName || 'Unknown',
          brand: Device.brand || 'Unknown',
          modelName: Device.modelName || 'Unknown',
          osName: Device.osName || 'Unknown',
          osVersion: Device.osVersion || 'Unknown',
          ipAddress: ipAddress || 'Unknown',
          networkType: networkState.type || 'Unknown',
          installationId: installId ? String(installId).substring(0, 16) : 'Unknown',
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to get device info:', error);
        setDeviceInfo(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchDeviceInfo();
  }, []);

  return deviceInfo;
}
