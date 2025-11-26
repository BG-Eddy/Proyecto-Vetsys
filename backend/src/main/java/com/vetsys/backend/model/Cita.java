package com.vetsys.backend.model;

import com.vetsys.backend.enums.EstadoCita; // Importamos el Enum
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

    // Usamos el ENUM. En la BD se guardará como texto ("PROGRAMADA")
    @Enumerated(EnumType.STRING)
    private EstadoCita estado;

    // RELACIÓN 1: Mascota
    @ManyToOne
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    // RELACIÓN 2: Veterinario
    @ManyToOne
    @JoinColumn(name = "id_veterinario", nullable = false)
    private Veterinario veterinario;

    @PrePersist
    public void prePersist() {
        if(this.estado == null) this.estado = EstadoCita.PROGRAMADA;
    }
}