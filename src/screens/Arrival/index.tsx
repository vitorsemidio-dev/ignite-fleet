import { useRoute } from '@react-navigation/native';

import {
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ButtonIcon } from '@components/ButtonIcon';
import { X } from 'phosphor-react-native';

type RouteParamProps = {
  id: string;
};

export function Arrival() {
  const route = useRoute();

  const { id } = route.params as RouteParamProps;

  return (
    <Container>
      <Header title="Chegada" />
      <Content>
        <Label>Placa do veículo</Label>

        <LicensePlate>XXX0000</LicensePlate>

        <Label>Finalidade</Label>

        <Description>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem
          libero esse velit iste, inventore iusto ab voluptatibus maiores quam
          voluptatem beatae eaque est modi vel dolor! Fugiat est saepe illo?
          Placeat sint quod beatae quibusdam, iusto ullam ut magnam, fugiat
          velit porro vero itaque nihil. Perspiciatis tenetur, et inventore
          sapiente iusto deserunt quidem veritatis at amet minima suscipit, cum
          quae!
        </Description>

        <Footer>
          <ButtonIcon icon={X} />
          <Button title="Registrar chegada" />
        </Footer>
      </Content>
    </Container>
  );
}
