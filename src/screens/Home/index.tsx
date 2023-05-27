import { useNavigation } from '@react-navigation/native';
import { useUser } from '@realm/react';
import dayjs from 'dayjs';
import { CloudArrowUp } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import Toast from 'react-native-toast-message';

import { CarStatus } from '@components/CarStatus';
import { HistoricCard, HistoricCardProps } from '@components/HistoricCard';
import { HomeHeader } from '@components/HomeHeader';
import {
  getLastAsyncTimestamp,
  saveLastSyncTimestamp,
} from '@libs/asyncStorage/syncStorage';
import { useQuery, useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';

import { TopMessage } from '@components/TopMessage';
import { Container, Content, Label, Title } from './styles';

export function Home() {
  const [percentageToSync, setPercentageToSync] = useState<string | null>(null);
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

  async function fetchHistoric() {
    try {
      const lastSync = await getLastAsyncTimestamp();
      const response = historic.filtered(
        "status='arrival' SORT(created_at DESC)",
      );
      const formattedHistoric = response.map((item) => {
        return {
          id: item._id.toString(),
          licensePlate: item.license_plate,
          isSync: lastSync > item.updated_at!.getTime(),
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

  async function progressNotification(
    transferred: number,
    transferable: number,
  ) {
    const PERCENTAGE_COMPLETE_VALUE = 1;
    const percentageValue = transferred / transferable;

    if (percentageValue === PERCENTAGE_COMPLETE_VALUE) {
      await saveLastSyncTimestamp();
      await fetchHistoric();
      setPercentageToSync(null);
      Toast.show({
        type: 'info',
        text1: 'Todos os dados estão sincronizado.',
      });
    }
    if (percentageValue < PERCENTAGE_COMPLETE_VALUE) {
      const percentage = percentageValue.toLocaleString('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 0,
      });
      setPercentageToSync(`${percentage} sincronizado`);
    }
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

  useEffect(() => {
    const syncSession = realm.syncSession;

    if (!syncSession) {
      return;
    }

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification,
    );

    return () => {
      syncSession.removeProgressNotification(progressNotification);
    };
  }, []);

  return (
    <Container>
      {percentageToSync && (
        <TopMessage title={percentageToSync} icon={CloudArrowUp} />
      )}
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
