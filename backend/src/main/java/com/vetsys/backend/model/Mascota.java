package com.vetsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // <--- IMPORTANTE
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mascotas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMascota;


    @ManyToOne(fetch = FetchType.LAZY) // Recomendado Lazy
    @JoinColumn(name = "id_propietario", nullable = false)

    @JsonIgnoreProperties({"mascotas", "hibernateLazyInitializer", "handler"})
    private Propietario propietario;

    @Column(nullable = false, length = 100)
    private String nombre;

    private String especie;
    private String raza;

    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    private String sexo;
    private String estado;

    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.estado == null) this.estado = "ACTIVO";
    }
}