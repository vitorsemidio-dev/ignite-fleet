import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Realm, useApp } from '@realm/react';

import backgroundImg from '@assets/background.png';
import { Button } from '@components/Button';
import { ANDROID_CLIENT_ID, IOS_CLIENT_ID } from '@env';

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Container, Slogan, Title } from './styles';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const app = useApp();

  const [_, response, googleSignIn] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  function handleGoogleSignIn() {
    setIsAuthenticated(true);
    googleSignIn().then((response) => {
      if (response.type !== 'success') {
        setIsAuthenticated(false);
        return;
      }
    });
  }

  useEffect(() => {
    if (response?.type === 'success') {
      if (response.authentication?.idToken) {
        const credentials = Realm.Credentials.jwt(
          response.authentication.idToken,
        );
        app.logIn(credentials).catch((error) => {
          console.log(error);
          Alert.alert(
            'Entrar',
            'Não foi possível conectar-se a sua conta Google',
          );
          setIsAuthenticated(false);
        });
      } else {
        Alert.alert(
          'Entrar',
          'Não foi possível conectar-se a sua conta Google',
        );
        setIsAuthenticated(false);
      }
    }
  }, [response]);

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>
      <Button
        title="Entrar com o Google"
        onPress={handleGoogleSignIn}
        isLoading={isAuthenticated}
      />
    </Container>
  );
}
