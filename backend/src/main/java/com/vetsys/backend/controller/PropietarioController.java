package com.vetsys.backend.controller;

import com.vetsys.backend.model.Propietario;
import com.vetsys.backend.service.PropietarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException; // Importante
import org.springframework.http.ResponseEntity; // Importante
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propietarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PropietarioController {

    private final PropietarioService propietarioService;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Propietario propietario) {
        try {
            Propietario nuevo = propietarioService.guardarPropietario(propietario);
            return ResponseEntity.ok(nuevo);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Error: La cédula ya está registrada.");
        }
    }

    @GetMapping
    public List<Propietario> listar() {
        return propietarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Propietario buscarUno(@PathVariable Long id) {
        return propietarioService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Propietario propietario) {
        try {
            Propietario actualizado = propietarioService.actualizarPropietario(id, propietario);
            return ResponseEntity.ok(actualizado);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Error: La cédula ya pertenece a otro propietario.");
        }
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        propietarioService.eliminarPropietario(id);
    }
}