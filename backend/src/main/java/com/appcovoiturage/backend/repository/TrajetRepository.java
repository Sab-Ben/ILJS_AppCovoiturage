package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TrajetRepository extends JpaRepository<Trajet, Long> {

    List<Trajet> findByConducteurIdOrderByDateHeureDepartDesc(Long conducteurId);

    // ✅ trajets passés du conducteur (historique)
    List<Trajet> findByConducteurIdAndDateHeureDepartBeforeOrderByDateHeureDepartDesc(
            Long conducteurId,
            LocalDateTime now
    );

    List<Trajet> findByPointsCreditesFalse();

    @Query("select t from Trajet t " +
            "where lower(t.villeDepart) like lower(concat('%', :from, '%')) " +
            "and lower(t.villeArrivee) like lower(concat('%', :to, '%')) " +
            "and t.dateHeureDepart between :start and :end " +
            "order by t.dateHeureDepart asc")
    List<Trajet> searchUpcoming(
            @Param("from") String from,
            @Param("to") String to,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("select t from Trajet t " +
            "where lower(t.villeDepart) like lower(concat('%', :from, '%')) " +
            "and lower(t.villeArrivee) like lower(concat('%', :to, '%')) " +
            "order by t.dateHeureDepart desc")
    List<Trajet> searchByVilles(
            @Param("from") String from,
            @Param("to") String to
    );
}
