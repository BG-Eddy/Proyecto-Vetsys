package com.vetsys.backend.controller;

import com.vetsys.backend.dto.FacturaRegistroDTO;
import com.vetsys.backend.model.Factura;
import com.vetsys.backend.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @PostMapping
    public Factura crear(@RequestBody FacturaRegistroDTO dto) {
        return facturaService.generarFactura(dto);
    }
}