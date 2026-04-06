import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.snapora.app',
  appName: 'Snapora',
  webDir: 'dist',
  server: {
    // Remove this block for production builds
    // Uncomment for live reload during development (replace with your Mac's IP):
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },
  ios: {
    contentInset: 'always', // Respects iPhone notch and home indicator
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
}

export default config
