package com.vetsys.backend.controller;

import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas") // La URL base será: http://localhost:8080/api/mascotas
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;
    private final com.vetsys.backend.service.PropietarioService propietarioService;

    // Endpoint para CREAR (POST)
    @PostMapping("/{idPropietario}") // Modificamos la URL para recibir el ID del dueño
    public Mascota crearMascota(@RequestBody Mascota mascota, @PathVariable Long idPropietario) {

        // 1. Buscamos al dueño en la BD
        com.vetsys.backend.model.Propietario dueño = propietarioService.buscarPorId(idPropietario);

        if (dueño == null) {
            throw new RuntimeException("Propietario no encontrado");
        }

        // 2. Asignamos el dueño a la mascota
        mascota.setPropietario(dueño);

        // 3. Guardamos
        return mascotaService.registrarMascota(mascota);
    }

    // Endpoint para LEER (GET)
    @GetMapping
    public List<Mascota> listarMascotas() {
        return mascotaService.listarTodas();
    }
}