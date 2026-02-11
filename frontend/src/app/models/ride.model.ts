export interface Ride {
  id: number | string;

  from: string;
  to: string;
  date: string;                // ex: 2026-02-11
  departureTime?: string;      // ex: 08:30
  availableSeats?: number;
  price?: number;
  driverName?: string;

  // ✅ nécessaire pour la carte/itinéraire
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}
