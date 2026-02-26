package com.appcovoiturage.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendReservationCreatedEmail(String conducteurEmail, String trajetLabel, String passagerEmail) {
        String subject = "Nouvelle réservation sur votre trajet";
        String body = "Bonjour,\n\n"
                + "Une nouvelle réservation a été effectuée par " + passagerEmail
                + " pour votre trajet " + trajetLabel + ".\n\n"
                + "Cordialement,\nApp Covoiturage";
        sendSimpleEmail(conducteurEmail, subject, body);
    }

    public void sendTrajetDeletedEmail(String passagerEmail, String trajetLabel) {
        String subject = "Trajet supprimé";
        String body = "Bonjour,\n\n"
                + "Le trajet " + trajetLabel + " a été supprimé par le conducteur.\n\n"
                + "Cordialement,\nApp Covoiturage";
        sendSimpleEmail(passagerEmail, subject, body);
    }
}