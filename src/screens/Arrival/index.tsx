import { useNavigation, useRoute } from '@react-navigation/native';
import { X } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { BSON } from 'realm';

import { Button } from '@components/Button';
import { ButtonIcon } from '@components/ButtonIcon';
import { Header } from '@components/Header';
import { getLastAsyncTimestamp } from '@libs/asyncStorage/syncStorage';
import { useObject, useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';
import { stopLocationTask } from '../../tasks/backgroundLocationTask';

import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles';

type RouteParamProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();
  const realm = useRealm();
  const { goBack } = useNavigation();
  const [dataNotSynced, setDataNotSynced] = useState(false);

  const { id } = route.params as RouteParamProps;

  const historic = useObject(Historic, new BSON.UUID(id));
  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes';

  function handleCancelVehicleUsage() {
    Alert.alert('Cancelar', 'Deseja realmente cancelar o uso do veículo?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: cancelVehicleUsage,
      },
    ]);
  }

  function cancelVehicleUsage() {
    realm.write(() => {
      realm.delete(historic);
    });

    goBack();
  }

  async function handleArrivalRegister() {
    try {
      await realm.write(async () => {
        if (!historic) {
          return Alert.alert(
            'Error',
            'Não foi possível obter os dados para registrar a chegada',
          );
        }
        historic.status = 'arrival';
        historic.updated_at = new Date();
        await stopLocationTask();
        Alert.alert('Chegada', 'Chegada do veículo registrada com sucesso.');
        goBack();
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Não foi possível registrar a chegada do veículo.');
    }
  }

  useEffect(() => {
    getLastAsyncTimestamp().then((lastSync) =>
      setDataNotSynced(historic!.updated_at.getTime() > lastSync),
    );
  }, []);

  return (
    <Container>
      <Header title={title} />
      <Content>
        <Label>Placa do veículo</Label>

        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>

        <Description>{historic?.description}</Description>
      </Content>
      {historic?.status === 'departure' && (
        <Footer>
          <ButtonIcon icon={X} onPress={handleCancelVehicleUsage} />

          <Button title="Registrar chegada" onPress={handleArrivalRegister} />
        </Footer>
      )}
      {dataNotSynced && (
        <AsyncMessage>
          Sincronização da{' '}
          {historic?.status === 'departure' ? 'partida' : 'chegada'} pendente
        </AsyncMessage>
      )}
    </Container>
  );
}
