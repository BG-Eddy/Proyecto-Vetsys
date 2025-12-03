package com.vetsys.backend.controller;

import com.vetsys.backend.dto.FacturaRegistroDTO;
import com.vetsys.backend.model.Factura;
import com.vetsys.backend.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Ajusta esto si tu React corre en otro puerto
public class FacturaController {

    private final FacturaService facturaService;

    // 1. Crear Factura (POST)
    @PostMapping
    public Factura crear(@RequestBody FacturaRegistroDTO dto) {
        return facturaService.generarFactura(dto);
    }

    // 2. Listar Facturas (GET) - Necesario para FacturasList.jsx
    @GetMapping
    public List<Factura> listar() {
        return facturaService.listarTodas();
    }
}