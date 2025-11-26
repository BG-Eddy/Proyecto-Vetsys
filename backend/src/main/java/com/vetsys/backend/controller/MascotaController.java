package com.vetsys.backend.controller;

import com.vetsys.backend.dto.MascotaRegistroDTO;
import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;

    @PostMapping
    public Mascota crearMascota(@RequestBody MascotaRegistroDTO dto) {
        return mascotaService.registrarMascota(dto);
    }

    @GetMapping
    public List<Mascota> listarMascotas() {
        return mascotaService.listarTodas();
    }
}