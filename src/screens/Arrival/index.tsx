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

  return (
    <Container>
      <Header title="Chegada" />
      <Content>
        <Label>Placa do veículo</Label>

        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>

        <Description>{historic?.description}</Description>

        <Footer>
          <ButtonIcon icon={X} onPress={handleCancelVehicleUsage} />
          <Button title="Registrar chegada" />
        </Footer>
      </Content>
    </Container>
  );
}
