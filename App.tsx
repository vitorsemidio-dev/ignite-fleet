import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import { AppProvider, UserProvider } from '@realm/react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';

import { Loading } from '@components/Loading';
import { REALM_APP_ID } from '@env';
import { Home } from '@screens/Home';
import SignIn from '@screens/SignIn';
import theme from '@theme/index';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }
  return (
    <AppProvider id={REALM_APP_ID}>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <UserProvider fallback={SignIn}>
          <Home />
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
