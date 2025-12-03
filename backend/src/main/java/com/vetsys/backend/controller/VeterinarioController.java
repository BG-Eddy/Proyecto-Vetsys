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

    @PostMapping
    public Veterinario crear(@RequestBody Veterinario veterinario) {
        return veterinarioService.guardarVeterinario(veterinario);
    }

    @GetMapping
    public List<Veterinario> listar() {
        return veterinarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Veterinario buscarUno(@PathVariable Long id) {
        return veterinarioService.buscarPorId(id);
    }

    // --- NUEVO: PUT para editar ---
    @PutMapping("/{id}")
    public Veterinario actualizar(@PathVariable Long id, @RequestBody Veterinario veterinario) {
        return veterinarioService.actualizarVeterinario(id, veterinario);
    }

    // --- NUEVO: DELETE para eliminar ---
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        veterinarioService.eliminarVeterinario(id);
    }
}