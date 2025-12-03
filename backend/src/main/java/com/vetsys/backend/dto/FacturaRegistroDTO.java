package com.vetsys.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class FacturaRegistroDTO {
    // ID del propietario al que se le hace la factura
    private Long idPropietario;

    // Opcional: ID de la cita si la factura viene de una consulta
    private Long idCita;

    // Lista de items (servicios/productos) que se van a facturar
    private List<DetalleFacturaDTO> items;
}