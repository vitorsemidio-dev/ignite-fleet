import { useNavigation } from '@react-navigation/native';
import { useUser } from '@realm/react';
import {
  LocationAccuracy,
  LocationObjectCoords,
  LocationSubscription,
  requestBackgroundPermissionsAsync,
  useForegroundPermissions,
  watchPositionAsync,
} from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { LicensePlateInput } from '@components/LicensePlateInput';
import { TextAreaInput } from '@components/TextInput';
import { useRealm } from '@libs/realm';
import { Historic } from '@libs/realm/schemas/Historic';
import { startLocationTask } from '@tasks/backgroundLocationTask';
import { licensePlateValidate } from '@utils/licensePlateValidate';

import { Loading } from '@components/Loading';
import { LocationInfo } from '@components/LocationInfo';
import { Map } from '@components/Map';
import { getAddressLocation } from '@utils/getAddressLocation';
import { Car } from 'phosphor-react-native';
import { Container, Content, Message } from './styles';

export function Departure() {
  const [currentAddressStreet, setCurrentAddressStreet] = useState<
    string | null
  >(null);
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [locationForegroundPermissions, requestLocationForegroundPermissions] =
    useForegroundPermissions();

  const realm = useRealm();
  const user = useUser();
  const { goBack } = useNavigation();

  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  async function handleDepartureRegister() {
    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert(
          'Placa inválida',
          'A placa é inválida. Por favor, informa a placa correta.',
        );
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert(
          'Finalidade',
          'Por favor, informe a finalidade da utilização do veículo',
        );
      }

      if (!currentCoords?.latitude || !currentCoords?.longitude) {
        return Alert.alert(
          'Localização',
          'Não foi possível obter a localização atual. Por favor, tente novamente.',
        );
      }

      setIsRegistering(true);

      const backgroundLocation = await requestBackgroundPermissionsAsync();

      if (!backgroundLocation.granted) {
        return Alert.alert(
          'Permissão de localização',
          'Para registrar a saída do veículo, é necessário conceder a permissão de localização em segundo plano.',
        );
      }

      await startLocationTask();

      realm.write(() => {
        realm.create(
          'Historic',
          Historic.generate({
            user_id: user!.id,
            license_plate: licensePlate,
            description,
          }),
        );
      });

      Alert.alert('Saída', 'Saída do veículo registrada com sucesso.');

      goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não possível registrar a saída do veículo.');
      setIsRegistering(false);
    }
  }

  useEffect(() => {
    requestLocationForegroundPermissions();
  }, []);

  useEffect(() => {
    if (!locationForegroundPermissions?.granted) {
      return () => {};
    }
    let sub: LocationSubscription;

    watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval: 1000,
      },
      (location) => {
        getAddressLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
          .then((address) => {
            setCurrentCoords(location.coords);
            const addressStreet = address?.street ?? null;
            setCurrentAddressStreet(addressStreet);
          })
          .finally(() => {
            setIsLoading(false);
          });
      },
    ).then((response) => {
      sub = response;
    });

    return () => {
      sub?.remove();
    };
  }, [locationForegroundPermissions]);

  if (!locationForegroundPermissions?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <Message>
          Para acessar essa funcionalidade, é necessário permitir que o
          aplicativo tenha acesso à sua localização. Por favor, vá até as
          configurações do seu dispositivo e conceda a permissão de localização
          ao aplicativo.
        </Message>
      </Container>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          {currentCoords && <Map coordinates={[currentCoords]} />}
          <Content>
            {currentAddressStreet && (
              <LocationInfo
                icon={Car}
                label="Localização atual"
                description={currentAddressStreet}
              />
            )}

            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veículo"
              placeholder="BRA1234"
              onSubmitEditing={() => {
                descriptionRef.current?.focus();
              }}
              returnKeyType="next"
              onChangeText={setLicensePlate}
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Finalizade"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="send"
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              title="Registar Saída"
              onPress={handleDepartureRegister}
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}
