package com.vetsys.backend.controller;

import com.vetsys.backend.dto.CitaRegistroDTO;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @PostMapping
    public Cita agendar(@RequestBody CitaRegistroDTO dto) {
        return citaService.agendarCita(dto);
    }

    @GetMapping
    public List<Cita> listar() {
        return citaService.listarCitas();
    }
}