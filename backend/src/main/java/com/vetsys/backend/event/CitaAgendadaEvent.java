package com.vetsys.backend.event;

import com.vetsys.backend.model.Cita;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CitaAgendadaEvent extends ApplicationEvent {

    private final Cita cita;

    public CitaAgendadaEvent(Object source, Cita cita) {
        super(source);
        this.cita = cita;
    }
}