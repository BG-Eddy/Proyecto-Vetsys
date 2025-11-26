package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HistorialRegistroDTO {
    private Long idCita; // El ID de la cita que se está atendiendo
    private String diagnostico;
    private String tratamiento;
    private String observaciones;
    private LocalDate proximoControl;
}