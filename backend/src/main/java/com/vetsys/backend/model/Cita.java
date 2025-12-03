package com.vetsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.pattern.state.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate; // Importante: LocalDate
import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCita;

    @Column(nullable = false)
    private LocalDateTime fechaHora;
    private String motivo;
    private Double precio;


    // --- CAMPOS DE FINALIZACIÓN ---
    @Column(columnDefinition = "TEXT")
    private String observaciones; // Diagnóstico

    @Column(columnDefinition = "TEXT")
    private String tratamiento;   // Receta / Medicación

    private LocalDate proximoControl; // NUEVO CAMPO (Solo Fecha)
    // ------------------------------

    @Enumerated(EnumType.STRING)
    private EstadoCita estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false)
    @JsonIgnoreProperties({"citas", "hibernateLazyInitializer", "handler"})
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false)
    @JsonIgnoreProperties({"citas", "hibernateLazyInitializer", "handler"})
    private Veterinario veterinario;

    public CitaState obtenerComportamiento() {
        if (this.estado == null) return new EstadoProgramada();
        switch (this.estado) {
            case PROGRAMADA: return new EstadoProgramada();
            case REALIZADA: return new EstadoRealizada();
            case CANCELADA: return new EstadoCancelada();
            default: return new EstadoProgramada();
        }
    }
}