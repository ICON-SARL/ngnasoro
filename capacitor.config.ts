import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6419ce7ac12b4202935f2f82ad556905',
  appName: 'N\'GNA SÔRÔ!',
  webDir: 'dist',
  server: {
    // Mode développement avec hot-reload depuis le sandbox Lovable
    url: 'https://6419ce7a-c12b-4202-935f-2f82ad556905.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    },
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Optimisations Android
    backgroundColor: '#0D6A51'
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    // Optimisations iOS
    backgroundColor: '#0D6A51'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#0D6A51',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#FFAB2E',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0D6A51',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    App: {
      // Configuration de l'app lifecycle
    }
  }
};

export default config;
