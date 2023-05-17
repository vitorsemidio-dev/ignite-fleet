import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { CarStatus } from '@components/CarStatus';
import { HomeHeader } from '@components/HomeHeader';
import { useQuery, useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';

import { Container, Content } from './styles';

export function Home() {
  const [vehicleInuse, setVehicleInUse] = useState<Historic | null>(null);

  const { navigate } = useNavigation();
  const realm = useRealm();
  const historic = useQuery(Historic);

  function handleRegisterMovement() {
    if (vehicleInuse?._id) {
      return navigate('arrival', { id: vehicleInuse._id.toString() });
    }
    navigate('departure');
  }

  function fetchVehicleInUse() {
    const vehicles = historic.filtered("status = 'departure'");
    if (vehicles?.length > 0) {
      setVehicleInUse(vehicles[0]);
    } else {
      setVehicleInUse(null);
    }
  }

  useEffect(() => {
    fetchVehicleInUse();
  }, []);

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse());

    return () => realm.removeListener('change', fetchVehicleInUse);
  }, []);

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInuse?.license_plate}
          onPress={handleRegisterMovement}
        />
      </Content>
    </Container>
  );
}
