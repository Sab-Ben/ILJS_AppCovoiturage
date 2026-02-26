export interface Ride {
  id: number | string;

  from: string;
  to: string;
  date: string;
  departureTime?: string;
  availableSeats?: number;
  price?: number;
  driverName?: string;

  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}
