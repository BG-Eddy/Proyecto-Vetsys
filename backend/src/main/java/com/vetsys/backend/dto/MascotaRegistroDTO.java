package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MascotaRegistroDTO {
    private String nombre;
    private String especie;
    private String raza;
    private String sexo;
    private LocalDate fechaNacimiento;

    // Cambiamos a Long directamente, es más seguro
    private Long idPropietario;
}