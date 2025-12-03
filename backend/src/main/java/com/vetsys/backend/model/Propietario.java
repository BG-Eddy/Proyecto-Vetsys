package com.vetsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importante
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString; // Importante

import java.time.LocalDateTime;
import java.util.List;

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



    @OneToMany(mappedBy = "propietario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // 1. Quitamos @JsonIgnore
    // 2. Ponemos @JsonIgnoreProperties para romper el bucle DENTRO de la mascota
    @JsonIgnoreProperties({"propietario", "citas", "hibernateLazyInitializer", "handler"})
    @ToString.Exclude // Evita que la consola se sature si imprimes el objeto
    private List<Mascota> mascotas;

    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.estado == null) this.estado = "ACTIVO";
    }
}