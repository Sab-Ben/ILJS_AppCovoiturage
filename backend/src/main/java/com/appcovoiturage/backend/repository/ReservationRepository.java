package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // ✅ Reservation.trajet.id
    List<Reservation> findByTrajet_Id(Long trajetId);

    // (optionnel mais souvent utile)
    // List<Reservation> findByPassager_Id(Long passagerId);
}
