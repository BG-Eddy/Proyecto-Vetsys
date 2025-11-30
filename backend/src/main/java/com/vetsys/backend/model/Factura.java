package com.vetsys.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "facturas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFactura;

    @ManyToOne
    @JoinColumn(name = "id_propietario", nullable = false)
    private Propietario propietario;

    @OneToOne
    @JoinColumn(name = "id_cita", nullable = true)
    private Cita cita;

    private LocalDateTime fechaEmision;
    private BigDecimal total;
    private String estado;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleFactura> detalles;

    @PrePersist
    public void prePersist() {
        this.fechaEmision = LocalDateTime.now();
        if(this.estado == null) this.estado = "PENDIENTE";
    }
}