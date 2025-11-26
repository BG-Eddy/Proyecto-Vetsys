package com.vetsys.backend.controller;

import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.service.VeterinarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarios")
@RequiredArgsConstructor
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    // POST: http://localhost:8080/api/veterinarios
    @PostMapping
    public Veterinario crear(@RequestBody Veterinario veterinario) {
        return veterinarioService.guardarVeterinario(veterinario);
    }

    // GET: http://localhost:8080/api/veterinarios
    @GetMapping
    public List<Veterinario> listar() {
        return veterinarioService.listarTodos();
    }

    // GET: http://localhost:8080/api/veterinarios/{id}
    @GetMapping("/{id}")
    public Veterinario buscarUno(@PathVariable Long id) {
        return veterinarioService.buscarPorId(id);
    }
}