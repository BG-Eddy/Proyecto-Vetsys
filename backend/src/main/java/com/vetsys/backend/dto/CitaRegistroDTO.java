package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaRegistroDTO {
    private LocalDateTime fechaHora;
    private String motivo;
    private Long idMascota;
    private Long idVeterinario;
}