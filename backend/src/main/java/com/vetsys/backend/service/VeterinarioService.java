package com.vetsys.backend.service;

import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.repository.VeterinarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeterinarioService {

    private final VeterinarioRepository veterinarioRepository;

    // Crear o Actualizar
    public Veterinario guardarVeterinario(Veterinario veterinario) {
        return veterinarioRepository.save(veterinario);
    }

    // Listar todos
    public List<Veterinario> listarTodos() {
        return veterinarioRepository.findAll();
    }

    // Buscar por ID (con manejo de error simple)
    public Veterinario buscarPorId(Long id) {
        return veterinarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado con ID: " + id));
    }

    // Listar solo los activos (usando el método custom del repo)
    public List<Veterinario> listarActivos() {
        return veterinarioRepository.findByEstado("ACTIVO");
    }
}