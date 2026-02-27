package com.appcovoiturage.backend.entity;

import java.util.Arrays;
import java.util.Comparator;

public enum UserLevel {

    DEBUTANT(1, "Débutant", 0, "Accès basique au covoiturage"),
    EXPLORATEUR(2, "Explorateur", 200, "Badge Explorateur débloqué"),
    VOYAGEUR(3, "Voyageur", 600, "Badge Voyageur + priorité de recherche"),
    EXPERT(4, "Expert", 1500, "Réduction 15% sur les réservations passager"),
    AMBASSADEUR(5, "Ambassadeur", 4000, "Bonus +25% gains conducteur + Réduction 15% passager");

    private final int rank;
    private final String label;
    private final int threshold;
    private final String avantages;

    UserLevel(int rank, String label, int threshold, String avantages) {
        this.rank = rank;
        this.label = label;
        this.threshold = threshold;
        this.avantages = avantages;
    }

    public int getRank() { return rank; }
    public String getLabel() { return label; }
    public int getThreshold() { return threshold; }
    public String getAvantages() { return avantages; }

    public static UserLevel fromTotalPoints(int totalPoints) {
        return Arrays.stream(values())
                .sorted(Comparator.comparingInt(UserLevel::getThreshold).reversed())
                .filter(level -> totalPoints >= level.threshold)
                .findFirst()
                .orElse(DEBUTANT);
    }

    public UserLevel nextLevel() {
        return Arrays.stream(values())
                .filter(level -> level.rank == this.rank + 1)
                .findFirst()
                .orElse(null);
    }

    public int pointsToNextLevel(int totalPoints) {
        UserLevel next = nextLevel();
        if (next == null) return 0;
        return Math.max(0, next.threshold - totalPoints);
    }
}
