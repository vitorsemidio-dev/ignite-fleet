import backgroundImg from '@assets/background.png';
import { Button } from '@components/Button';

import { Container, Slogan, Title } from './styles';

export default function SignIn() {
  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>
      <Button title="Entrar com o Google" />
    </Container>
  );
}
