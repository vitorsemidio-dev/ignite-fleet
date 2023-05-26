import '@libs/dayjs';
import 'react-native-get-random-values';

import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import { useNetInfo } from '@react-native-community/netinfo';
import { AppProvider, UserProvider } from '@realm/react';
import { WifiSlash } from 'phosphor-react-native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components';

import { Loading } from '@components/Loading';
import { TopMessage } from '@components/TopMessage';
import { REALM_APP_ID } from '@env';
import { Routes } from '@routes/index';
import SignIn from '@screens/SignIn';
import theme from '@theme/index';
import { RealmProvider, syncConfig } from './src/libs/realm';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const netInfo = useNetInfo();

  if (!fontsLoaded) {
    return <Loading />;
  }
  return (
    <AppProvider id={REALM_APP_ID}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          {!netInfo.isConnected && (
            <TopMessage title="Você está off-line" icon={WifiSlash} />
          )}
          <UserProvider fallback={SignIn}>
            <RealmProvider sync={syncConfig} fallback={Loading}>
              <Routes />
            </RealmProvider>
          </UserProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
