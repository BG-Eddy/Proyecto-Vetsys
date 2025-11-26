package com.vetsys.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data // Genera getters y setters automáticamente
public class MascotaRegistroDTO {

    // Solo ponemos los datos que el usuario ingresa en el formulario
    private String nombre;
    private String especie;
    private String raza;
    private String sexo;
    private LocalDate fechaNacimiento;

    // AQUÍ ESTÁ LA CLAVE: Recibimos el ID del dueño como un campo más
    private Long idPropietario;
}