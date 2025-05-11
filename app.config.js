import 'dotenv/config';

export default {
  expo: {
    name: "glicosleep",
    slug: "glicosleep",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSBluetoothAlwaysUsageDescription: "Este app usa Bluetooth para conectar com smartwatch e medidor de glicose.",
        NSBluetoothPeripheralUsageDescription: "Precisamos do Bluetooth para conectar aos seus dispositivos de saúde."
      }
    },
    android: {
      permissions: [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_CONNECT",
        "BLUETOOTH_SCAN",
        "ACCESS_FINE_LOCATION",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.glicosleep.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "cover",
          backgroundColor: "#ffffff",
          enableFullScreenImage_legacy: true
        }
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Rubik-Bold.ttf",
            "./assets/fonts/Rubik-Medium.ttf",
            "./assets/fonts/Rubik-Regular.ttf",
            "./assets/fonts/Rubik-Light.ttf",
            "./assets/fonts/Rubik-ExtraBold.ttf",
            "./assets/fonts/Rubik-SemiBold.ttf"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      eas: {
        projectId: "f77af591-72ea-48e5-a2fe-6ef66d56115e"
      },
      router: {
        origin: false
      }
    }
  }
}
