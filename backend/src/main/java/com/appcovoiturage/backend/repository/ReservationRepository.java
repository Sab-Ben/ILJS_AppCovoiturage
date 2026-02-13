package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByRideId(Long rideId);

}
