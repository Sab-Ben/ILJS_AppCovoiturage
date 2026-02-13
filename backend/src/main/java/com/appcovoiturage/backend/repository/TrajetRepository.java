package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDateTime;
import java.util.List;
public interface TrajetRepository extends JpaRepository<Trajet, Long> {
    List<Trajet> findByConducteurId(Long conducteurId);
    @Query("select t from Trajet t " +
            "where lower(t.villeDepart) like lower(concat('%', :from, '%')) " +
            "and lower(t.villeArrivee) like lower(concat('%', :to, '%')) " +
            "and t.dateHeureDepart between :start and :end " +
            "and t.dateHeureDepart >= :now " +
            "order by t.dateHeureDepart asc")


    List<Trajet> findByConducteurIdAndDateHeureDepartBeforeOrderByDateHeureDepartDesc(Long conducteurId, LocalDateTime now);

    @Query("select t from Trajet t " +
            "where lower(t.villeDepart) like lower(concat('%', :from, '%')) " +
            "and lower(t.villeArrivee) like lower(concat('%', :to, '%')) " +
            "and t.dateHeureDepart between :start and :end " +
            "and t.dateHeureDepart >= :now " +
            "order by t.dateHeureDepart asc")

    List<Trajet> searchUpcoming(
            @Param("from") String from,
            @Param("to") String to,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("now") LocalDateTime now
    );
}

