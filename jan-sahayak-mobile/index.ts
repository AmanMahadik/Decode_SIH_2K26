import { registerRootComponent } from 'expo';
import { NativeModules } from 'react-native';

// Polyfill native ExpoCryptoAES for Expo Go compatibility
try {
  if (!NativeModules.ExpoCryptoAES) {
    NativeModules.ExpoCryptoAES = {
      encryptAsync: async () => '',
      decryptAsync: async () => '',
      getRandomBytes: () => new Uint8Array(16),
    };
  }

  const g = global as any;
  if (g.ExpoModules && !g.ExpoModules.ExpoCryptoAES) {
    g.ExpoModules.ExpoCryptoAES = {
      encryptAsync: async () => '',
      decryptAsync: async () => '',
      getRandomBytes: () => new Uint8Array(16),
    };
  }
} catch (e) {
  // Safe fallback
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
