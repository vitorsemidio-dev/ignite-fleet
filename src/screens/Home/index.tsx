import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { CarStatus } from '@components/CarStatus';
import { HomeHeader } from '@components/HomeHeader';
import { Container, Content } from './styles';

export function Home() {
  const { navigate } = useNavigation();

  function handleRegisterMovement() {
    navigate('departure');
  }

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus licensePlate="XXX-1234" onPress={handleRegisterMovement} />
      </Content>
    </Container>
  );
}
