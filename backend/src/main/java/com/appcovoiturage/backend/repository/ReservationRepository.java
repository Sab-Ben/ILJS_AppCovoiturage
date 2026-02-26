package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByPassagerId(Long passagerId);

    List<Reservation> findByTrajetId(Long trajetId);

    Optional<Reservation> findByTrajetIdAndPassagerId(Long trajetId, Long passagerId);

    boolean existsByTrajetIdAndPassagerId(Long trajetId, Long passagerId);

    long countByTrajetId(Long trajetId);
}