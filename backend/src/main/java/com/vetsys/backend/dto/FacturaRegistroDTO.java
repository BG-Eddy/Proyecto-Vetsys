package com.vetsys.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class FacturaRegistroDTO {
    private Long idPropietario; // Quién paga
    private Long idCita;        // Opcional: si viene de una cita
    private List<DetalleFacturaDTO> items; // La lista de compras
}