package com.vetsys.backend.dto;

import lombok.Data;

@Data
public class DetalleFacturaDTO {
    private Long idServicio; // Qué compró
    private Long idMascota;  // A quién se le aplicó
    private Integer cantidad; // Cuántos
}