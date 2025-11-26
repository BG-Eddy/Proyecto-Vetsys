package com.vetsys.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List; // Importante para la lista

@Entity
@Table(name = "propietarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Propietario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPropietario;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    private String telefono;

    private String email;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    private String estado;

    // --- LA RELACIÓN ---
    // Un Propietario "tiene" muchas Mascotas.
    // 'mappedBy' dice: "La dueña de la relación es la variable 'propietario' en la clase Mascota"
    @OneToMany(mappedBy = "propietario", cascade = CascadeType.ALL)
    private List<Mascota> mascotas;

    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
        if(this.estado == null) this.estado = "ACTIVO";
    }
}