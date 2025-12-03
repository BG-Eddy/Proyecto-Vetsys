package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaRegistroDTO {
    private LocalDateTime fechaHora;
    private String motivo;

    // Nuevo campo agregado para recibir el precio desde el Frontend
    private Double precio;

    private Long idMascota;
    private Long idVeterinario;
}