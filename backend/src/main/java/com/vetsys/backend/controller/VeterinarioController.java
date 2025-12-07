package com.vetsys.backend.controller;

import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.service.VeterinarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarios")
@RequiredArgsConstructor
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Veterinario veterinario) {
        try {
            Veterinario nuevo = veterinarioService.guardarVeterinario(veterinario);
            return ResponseEntity.ok(nuevo);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Error: La cédula ya está registrada.");
        }
    }

    @GetMapping
    public List<Veterinario> listar() {
        return veterinarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Veterinario buscarUno(@PathVariable Long id) {
        return veterinarioService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Veterinario veterinario) {
        try {
            Veterinario actualizado = veterinarioService.actualizarVeterinario(id, veterinario);
            return ResponseEntity.ok(actualizado);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Error: La cédula ya pertenece a otro veterinario.");
        }
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        veterinarioService.eliminarVeterinario(id);
    }
}