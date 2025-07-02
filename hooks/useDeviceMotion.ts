import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { DeviceMotionData } from '@/types/movie';

export function useDeviceMotion() {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  useEffect(() => {
    let subscription: any;

    const subscribe = async () => {
      if (Platform.OS === 'web') {
        console.warn('DeviceMotion is not supported on web.');
        return;
      }

      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.warn('DeviceMotion is not available on this device.');
        return;
      }

      DeviceMotion.setUpdateInterval(16); // 60fps update rate

      subscription = DeviceMotion.addListener((data: DeviceMotionData) => {
        if (!data?.rotation) return;

        tiltX.value = withSpring((data.rotation.gamma ?? 0) * 4);
        tiltY.value = withSpring((data.rotation.beta ?? 0) * 4);
      });
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return { tiltX, tiltY };
}
