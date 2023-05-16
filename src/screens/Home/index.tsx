import React from 'react';

import { CarStatus } from '@components/CarStatus';
import { HomeHeader } from '@components/HomeHeader';
import { Container, Content } from './styles';

export function Home() {
  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus licensePlate="XXX-1234" />
      </Content>
    </Container>
  );
}
