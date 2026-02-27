package com.appcovoiturage.backend.repository;

import com.appcovoiturage.backend.entity.PointTransaction;
import com.appcovoiturage.backend.entity.PointTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PointTransaction pt " +
            "WHERE pt.user.id = :userId AND pt.amount > 0")
    int sumPositiveAmountsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PointTransaction pt " +
            "WHERE pt.user.id = :userId AND pt.type = :type " +
            "AND CAST(pt.createdAt AS localdate) = :date AND pt.amount > 0")
    int sumDailyGainsByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") PointTransactionType type,
            @Param("date") LocalDate date);

    boolean existsByUserIdAndTrajetIdAndType(Long userId, Long trajetId, PointTransactionType type);
}
