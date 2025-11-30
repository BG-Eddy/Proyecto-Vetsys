package com.vetsys.backend.controller;

import com.vetsys.backend.model.Servicio;
import com.vetsys.backend.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioService servicioService;

    @PostMapping
    public Servicio crear(@RequestBody Servicio servicio) {
        return servicioService.guardarServicio(servicio);
    }

    @GetMapping
    public List<Servicio> listar() {
        return servicioService.listarTodos();
    }
}