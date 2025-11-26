package com.vetsys.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity // 1. Le dice a Spring: "Esto es una tabla en la base de datos"
@Table(name = "mascotas") // 2. (Opcional) Define el nombre exacto de la tabla en MySQL
@Data // 3. Lombok: Genera automáticamente Getters, Setters, toString, etc.
@Builder // 4. Patrón Builder: Para crear objetos fácilmente
@NoArgsConstructor // 5. Constructor vacío (Obligatorio para JPA)
@AllArgsConstructor // 6. Constructor con todos los argumentos
public class Mascota {

    @Id // Marca este campo como la Llave Primaria (PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementable (1, 2, 3...)
    private Long idMascota;

    @ManyToOne // Muchas mascotas pertenecen a Un propietario
    @JoinColumn(name = "id_propietario", nullable = false) // Crea la columna 'id_propietario' en la BD (Llave Foránea)
    @JsonIgnore
    private Propietario propietario;

    @Column(nullable = false, length = 100) // Configuración de la columna
    private String nombre;

    private String especie; // Ej: Perro, Gato
    private String raza;    // Ej: Labrador

    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    private String sexo;

    private String estado; // Ej: Activo, Fallecido

    // Este método se ejecuta justo antes de guardar en la BD por primera vez
    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
        if(this.estado == null) this.estado = "ACTIVO";
    }
}