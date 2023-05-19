import { useNavigation, useRoute } from '@react-navigation/native';
import { X } from 'phosphor-react-native';
import { BSON } from 'realm';

import { Button } from '@components/Button';
import { ButtonIcon } from '@components/ButtonIcon';
import { Header } from '@components/Header';
import { useObject, useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';

import {
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles';
import { Alert } from 'react-native';

type RouteParamProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();
  const realm = useRealm();
  const { goBack } = useNavigation();

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

  function handleArrivalRegister() {
    try {
      realm.write(() => {
        if (!historic) {
          return Alert.alert(
            'Error',
            'Não foi possível obter os dados para registrar a chegada',
          );
        }
        historic.status = 'arrival';
        historic.updated_at = new Date();
        Alert.alert('Chegada', 'Chegada do veículo registrada com sucesso.');
        goBack();
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Não foi possível registrar a chegada do veículo.');
    }
  }

  return (
    <Container>
      <Header title={title} />
      <Content>
        <Label>Placa do veículo</Label>

        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>

        <Description>{historic?.description}</Description>

        {historic?.status === 'departure' && (
          <Footer>
            <ButtonIcon icon={X} onPress={handleCancelVehicleUsage} />

            <Button title="Registrar chegada" onPress={handleArrivalRegister} />
          </Footer>
        )}
      </Content>
    </Container>
  );
}
