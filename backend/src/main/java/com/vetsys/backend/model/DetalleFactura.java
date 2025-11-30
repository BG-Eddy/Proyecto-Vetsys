package com.vetsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_factura")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleFactura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;

    // Relación con la Factura Padre
    @ManyToOne
    @JoinColumn(name = "id_factura", nullable = false)
    @JsonIgnore // ¡Importante para evitar errores de recursión!
    private Factura factura;

    // Qué servicio se vendió
    @ManyToOne
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;

    // A qué mascota se le aplicó
    @ManyToOne
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}