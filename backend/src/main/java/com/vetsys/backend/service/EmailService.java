package com.vetsys.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarCorreo(String destinatario, String asunto, String cuerpo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(cuerpo);
            message.setFrom("no-reply@vetsys.com");

            mailSender.send(message);
            System.out.println("✅ Correo enviado exitosamente a: " + destinatario);
        } catch (Exception e) {
            // Capturamos el error para que NO rompa el programa si se ha configurado el SMTP
            System.err.println("⚠️ Error enviando correo (Revisar credenciales SMTP): " + e.getMessage());
        }
    }
}