package com.appcovoiturage.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @PostConstruct
    void setTimezone() {
        TimeZone.setDefault(TimeZone.getTimeZone("Africa/Casablanca"));
    }
}
