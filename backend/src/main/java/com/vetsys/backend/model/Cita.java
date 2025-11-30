package com.vetsys.backend.model;

import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.pattern.state.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Enumerated(EnumType.STRING)
    private EstadoCita estado;

    // Relación con Mascota
    @ManyToOne
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    // Relación con Veterinario
    @ManyToOne
    @JoinColumn(name = "id_veterinario", nullable = false)
    private Veterinario veterinario;

    // Implementación STATE
    // Este método convierte el Enum (Dato) en una Clase Lógica (Comportamiento)
    public CitaState obtenerComportamiento() {
        switch (this.estado) {
            case PROGRAMADA:
                return new EstadoProgramada();
            case REALIZADA:
                return new EstadoRealizada();
            case CANCELADA:
                return new EstadoCancelada();
            default:
                // Por defecto asumimos programada o lanzamos error
                return new EstadoProgramada();
        }
    }
}