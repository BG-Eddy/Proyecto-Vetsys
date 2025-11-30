package com.vetsys.backend.pattern.state;

import com.vetsys.backend.model.Cita;

public class EstadoCancelada implements CitaState {

    @Override
    public void confirmar(Cita cita) {
        throw new RuntimeException("Acción inválida: La cita está cancelada.");
    }

    @Override
    public void cancelar(Cita cita) {
        throw new RuntimeException("Acción inválida: La cita ya estaba cancelada.");
    }

    @Override
    public void finalizar(Cita cita) {
        throw new RuntimeException("Acción inválida: No se puede finalizar una cita cancelada.");
    }
}