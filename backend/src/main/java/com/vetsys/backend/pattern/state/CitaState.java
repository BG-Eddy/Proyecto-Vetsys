package com.vetsys.backend.pattern.state;

import com.vetsys.backend.model.Cita;

public interface CitaState {
    // Definimos las acciones que cambian el flujo de la cita
    void confirmar(Cita cita);
    void cancelar(Cita cita);
    void finalizar(Cita cita);
}