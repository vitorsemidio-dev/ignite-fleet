import { LocationGeocodedLocation, reverseGeocodeAsync } from 'expo-location';

export async function getAddressLocation(coords: LocationGeocodedLocation) {
  try {
    const addressResponse = await reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    const address = addressResponse[0];

    const { name, street, region, city, country } = address;

    return {
      name,
      street,
      region,
      city,
      country,
    };
  } catch (error) {
    console.log(error);
  }
}
