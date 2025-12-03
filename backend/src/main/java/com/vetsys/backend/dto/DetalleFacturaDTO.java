package com.vetsys.backend.dto;

import lombok.Data;

@Data
public class DetalleFacturaDTO {
    private Long idServicio;
    private Long idMascota;
    private Integer cantidad;
}