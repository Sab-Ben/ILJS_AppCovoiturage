package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Reservation;
import com.appcovoiturage.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByPassager(User passager);

    List<Reservation> findByTrajetId(Long trajetId);
}