import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Departure } from '@screens/Departure';
import { Home } from '@screens/Home';

const { Navigator, Screen } = createNativeStackNavigator();

export function AppRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name="home" component={Home} />
      <Screen name="departure" component={Departure} />
    </Navigator>
  );
}
