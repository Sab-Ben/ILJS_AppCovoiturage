package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Style Spring Data recommandé (propriétés imbriquées)
    List<Reservation> findByPassager_Id(Long passagerId);
    List<Reservation> findByTrajet_Id(Long trajetId);
    Optional<Reservation> findByTrajet_IdAndPassager_Id(Long trajetId, Long passagerId);

    boolean existsByTrajet_IdAndPassager_Id(Long trajetId, Long passagerId);
    long countByTrajet_Id(Long trajetId);

    // (Optionnel)
    default List<Reservation> findByPassagerId(Long passagerId) {
        return findByPassager_Id(passagerId);
    }

    default List<Reservation> findByTrajetId(Long trajetId) {
        return findByTrajet_Id(trajetId);
    }

    default Optional<Reservation> findByTrajetIdAndPassagerId(Long trajetId, Long passagerId) {
        return findByTrajet_IdAndPassager_Id(trajetId, passagerId);
    }

    default boolean existsByTrajetIdAndPassagerId(Long trajetId, Long passagerId) {
        return existsByTrajet_IdAndPassager_Id(trajetId, passagerId);
    }

    default long countByTrajetId(Long trajetId) {
        return countByTrajet_Id(trajetId);
    }
}