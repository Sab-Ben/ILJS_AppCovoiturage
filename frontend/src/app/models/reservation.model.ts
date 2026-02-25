export interface ReservationModel {
  id: number;
  seats: number;
  desiredRoute: string;
  createdAt: string;

  trajet?: any;
  passager?: any;
}
