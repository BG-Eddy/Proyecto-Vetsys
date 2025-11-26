package com.vetsys.backend.controller;

import com.vetsys.backend.dto.HistorialRegistroDTO;
import com.vetsys.backend.model.HistorialClinico;
import com.vetsys.backend.service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final HistorialService historialService;

    @PostMapping
    public HistorialClinico crearHistorial(@RequestBody HistorialRegistroDTO dto) {
        return historialService.registrarAtencion(dto);
    }
}