import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components';

import SignIn from '@screens/SignIn';
import theme from '@theme/index';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="auto" />
      <SignIn />
    </ThemeProvider>
  );
}
