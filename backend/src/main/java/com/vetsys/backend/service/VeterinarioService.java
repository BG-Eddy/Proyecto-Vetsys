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

    public Veterinario guardarVeterinario(Veterinario veterinario) {
        return veterinarioRepository.save(veterinario);
    }

    public List<Veterinario> listarTodos() {
        return veterinarioRepository.findAll();
    }

    public Veterinario buscarPorId(Long id) {
        return veterinarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));
    }

    public Veterinario actualizarVeterinario(Long id, Veterinario veterinarioActualizado) {
        Veterinario veterinario = buscarPorId(id);

        veterinario.setCedula(veterinarioActualizado.getCedula());
        veterinario.setNombre(veterinarioActualizado.getNombre());
        veterinario.setApellido(veterinarioActualizado.getApellido());
        veterinario.setTelefono(veterinarioActualizado.getTelefono());
        veterinario.setEmail(veterinarioActualizado.getEmail());
        veterinario.setEspecialidad(veterinarioActualizado.getEspecialidad());
        veterinario.setEstado(veterinarioActualizado.getEstado());

        return veterinarioRepository.save(veterinario);
    }

    public void eliminarVeterinario(Long id) {
        veterinarioRepository.deleteById(id);
    }
}