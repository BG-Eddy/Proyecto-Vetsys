package com.vetsys.backend.pattern.state;

import com.vetsys.backend.model.Cita;

public class EstadoRealizada implements CitaState {

    @Override
    public void confirmar(Cita cita) {
        throw new RuntimeException("Acción inválida: La cita ya fue realizada.");
    }

    @Override
    public void cancelar(Cita cita) {
        throw new RuntimeException("Acción inválida: No puedes cancelar una cita que ya ocurrió.");
    }

    @Override
    public void finalizar(Cita cita) {
        throw new RuntimeException("Acción inválida: La cita ya estaba finalizada.");
    }
}