package com.vetsys.backend.controller;

import com.vetsys.backend.model.Propietario;
import com.vetsys.backend.service.PropietarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propietarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Importante para que React no te de error de conexión
public class PropietarioController {

    private final PropietarioService propietarioService;

    @PostMapping
    public Propietario crear(@RequestBody Propietario propietario) {
        return propietarioService.guardarPropietario(propietario);
    }

    @GetMapping
    public List<Propietario> listar() {
        return propietarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Propietario buscarUno(@PathVariable Long id) {
        return propietarioService.buscarPorId(id);
    }

    // --- ACTUALIZAR (Llama al servicio nuevo) ---
    @PutMapping("/{id}")
    public Propietario actualizar(@PathVariable Long id, @RequestBody Propietario propietario) {
        return propietarioService.actualizarPropietario(id, propietario);
    }

    // --- ELIMINAR  ---
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        propietarioService.eliminarPropietario(id);
    }
}