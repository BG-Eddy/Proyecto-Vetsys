package com.vetsys.backend.listener;

import com.vetsys.backend.event.CitaAgendadaEvent;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificacionListener {

    private final EmailService emailService;

    @EventListener
    public void manejarCitaAgendada(CitaAgendadaEvent evento) {
        Cita cita = evento.getCita();

        // Extraemos los datos necesarios
        String emailPropietario = cita.getMascota().getPropietario().getEmail();
        String nombreMascota = cita.getMascota().getNombre();
        String fecha = cita.getFechaHora().toString();
        String medico = cita.getVeterinario().getNombre() + " " + cita.getVeterinario().getApellido();

        // Construimos el mensaje
        String asunto = "Confirmación de Cita - Happy Animals";
        String mensaje = String.format(
                "Hola! \n\nTu cita para %s ha sido agendada con éxito.\n" +
                        "Fecha: %s\n" +
                        "Veterinario: Dr. %s\n" +
                        "Motivo: %s\n\n" +
                        "¡Te esperamos!",
                nombreMascota, fecha, medico, cita.getMotivo()
        );

        // Llamamos al servicio de correo
        System.out.println("🔔 [OBSERVER] Se detectó una nueva cita. Procesando notificación...");

        // Validamos que tenga correo antes de intentar enviar
        if (emailPropietario != null && !emailPropietario.isEmpty()) {
            emailService.enviarCorreo(emailPropietario, asunto, mensaje);
        } else {
            System.out.println("⚠️ El propietario no tiene email registrado.");
        }
    }
}