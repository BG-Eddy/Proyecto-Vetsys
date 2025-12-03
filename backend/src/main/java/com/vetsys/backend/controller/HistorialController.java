package com.vetsys.backend.controller;

import com.vetsys.backend.dto.HistorialRegistroDTO;
import com.vetsys.backend.model.HistorialClinico;
import com.vetsys.backend.service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Permite conexión desde React
public class HistorialController {

    private final HistorialService historialService;


    @GetMapping
    public List<HistorialClinico> listar() {
        // Usamos el método que ya tienes en el servicio
        return historialService.buscarPorMascota(null);
    }

    @PostMapping
    public HistorialClinico crearHistorial(@RequestBody HistorialRegistroDTO dto) {
        return historialService.registrarAtencion(dto);
    }
}