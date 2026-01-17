package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrajetRepository extends JpaRepository<Trajet, Long> {
    List<Trajet> findByConducteurId(Long conducteurId);
}