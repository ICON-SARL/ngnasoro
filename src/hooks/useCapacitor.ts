import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

interface CapacitorInfo {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
}

interface UseCapacitorReturn extends CapacitorInfo {
  hideSplashScreen: () => Promise<void>;
  setStatusBarStyle: (style: 'light' | 'dark') => Promise<void>;
  hideKeyboard: () => Promise<void>;
  isKeyboardVisible: boolean;
  addBackButtonListener: (callback: () => void) => () => void;
}

export const useCapacitor = (): UseCapacitorReturn => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';

  // Gérer les événements du clavier
  useEffect(() => {
    if (!isNative) return;

    const showListener = Keyboard.addListener('keyboardWillShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showListener.then(l => l.remove());
      hideListener.then(l => l.remove());
    };
  }, [isNative]);

  // Masquer le splash screen
  const hideSplashScreen = useCallback(async () => {
    if (!isNative) return;
    try {
      await SplashScreen.hide({ fadeOutDuration: 500 });
    } catch (error) {
      console.warn('Error hiding splash screen:', error);
    }
  }, [isNative]);

  // Configurer le style de la status bar
  const setStatusBarStyle = useCallback(async (style: 'light' | 'dark') => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ 
        style: style === 'light' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.warn('Error setting status bar style:', error);
    }
  }, [isNative]);

  // Masquer le clavier
  const hideKeyboard = useCallback(async () => {
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Error hiding keyboard:', error);
    }
  }, [isNative]);

  // Écouter le bouton retour Android
  const addBackButtonListener = useCallback((callback: () => void) => {
    if (!isNative || platform !== 'android') return () => {};

    const listenerPromise = App.addListener('backButton', () => {
      callback();
    });

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, [isNative, platform]);

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    hideSplashScreen,
    setStatusBarStyle,
    hideKeyboard,
    isKeyboardVisible,
    addBackButtonListener
  };
};

// Hook pour initialiser Capacitor au démarrage de l'app
export const useCapacitorInit = () => {
  const { isNative, hideSplashScreen, setStatusBarStyle, isAndroid } = useCapacitor();

  useEffect(() => {
    const initCapacitor = async () => {
      if (!isNative) return;

      try {
        // Configurer la status bar
        await setStatusBarStyle('light');
        
        if (isAndroid) {
          await StatusBar.setBackgroundColor({ color: '#0D6A51' });
        }

        // Masquer le splash screen après un délai
        setTimeout(async () => {
          await hideSplashScreen();
        }, 500);
      } catch (error) {
        console.warn('Error initializing Capacitor:', error);
      }
    };

    initCapacitor();
  }, [isNative, hideSplashScreen, setStatusBarStyle, isAndroid]);
};

export default useCapacitor;
