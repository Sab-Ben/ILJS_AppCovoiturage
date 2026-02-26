export type ReservationStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface CreateReservationRequest {
    rideId: number;
    seats: number;
    desiredRoute: string;
}

export interface Reservation {
    id: number;
    seats: number;
    status: ReservationStatus;
    desiredRoute?: string;
    createdAt?: string;

    ride: {
        id: number;
        from: string;
        to: string;
        date: string;
        departureTime?: string;
        availableSeats?: number;
        price?: number;
        driverName?: string;
    };
}