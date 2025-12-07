package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AtencionDirectaDTO {
    // Datos de identificación
    private Long idMascota;
    private Long idVeterinario;

    // Datos básicos
    private String motivo;

    // Datos de cierre (Clínicos y Financieros)
    private Double precio;
    private String observaciones; // Diagnóstico
    private String tratamiento;

    // Datos de seguimiento (Opcional)
    private LocalDate proximoControl;
    private String motivoProximoControl;
}