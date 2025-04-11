
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6419ce7ac12b4202935f2f82ad556905',
  appName: 'ngnasoro',
  webDir: 'dist',
  server: {
    url: 'https://6419ce7a-c12b-4202-935f-2f82ad556905.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreAliasPassword: null,
      releaseType: null,
    }
  }
};

export default config;
