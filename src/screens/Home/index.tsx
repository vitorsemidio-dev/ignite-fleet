import { useNavigation } from '@react-navigation/native';
import { useUser } from '@realm/react';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';

import { CarStatus } from '@components/CarStatus';
import { HistoricCard, HistoricCardProps } from '@components/HistoricCard';
import { HomeHeader } from '@components/HomeHeader';
import { useQuery, useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';

import { Container, Content, Label, Title } from './styles';

export function Home() {
  const [vehicleInuse, setVehicleInUse] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>(
    [],
  );

  const { navigate } = useNavigation();
  const realm = useRealm();
  const historic = useQuery(Historic);
  const user = useUser();

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

  function fetchHistoric() {
    try {
      const response = historic.filtered(
        "status='arrival' SORT(created_at DESC)",
      );
      const formattedHistoric = response.map((item) => {
        return {
          id: item._id.toString(),
          licensePlate: item.license_plate,
          isSync: false,
          created: dayjs(item.created_at).format(
            '[Saída em] DD/MM/YYYY [às] HH:mm',
          ),
        };
      });
      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.');
    }
  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id });
  }

  useEffect(() => {
    fetchVehicleInUse();
  }, []);

  useEffect(() => {
    fetchHistoric();
  }, [historic]);

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse());

    return () => realm.removeListener('change', fetchVehicleInUse);
  }, []);

  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm
        .objects<Historic>('Historic')
        .filtered(`user_id = '${user!.id}'`);

      mutableSubs.add(historicByUserQuery, {
        name: 'historicByUser',
      });
    });
  }, [realm]);

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInuse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>Histórico</Title>

        <FlatList
          data={vehicleHistoric}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              data={item}
              onPress={() => handleHistoricDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Label>Nenhum registro de utilização.</Label>}
        />
      </Content>
    </Container>
  );
}
