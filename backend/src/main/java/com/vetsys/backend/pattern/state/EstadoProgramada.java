package com.vetsys.backend.pattern.state;

import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.model.Cita;

public class EstadoProgramada implements CitaState {

    @Override
    public void confirmar(Cita cita) {
        // Lógica de confirmar (ej: enviar WhatsApp)
        // Podríamos cambiar a un estado CONFIRMADA si existiera
        System.out.println("Cita confirmada. Esperando al paciente.");
    }

    @Override
    public void cancelar(Cita cita) {
        // ¡Aquí ocurre la transición de estado!
        cita.setEstado(EstadoCita.CANCELADA);
        System.out.println("La cita ha sido cancelada exitosamente.");
    }

    @Override
    public void finalizar(Cita cita) {
        // Transición a Realizada (esto lo usa el HistorialService)
        cita.setEstado(EstadoCita.REALIZADA);
        System.out.println("Atención finalizada. Pasando a historial.");
    }
}