package com.vetsys.backend.service;

import com.vetsys.backend.model.Propietario;
import com.vetsys.backend.repository.PropietarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropietarioService {

    private final PropietarioRepository propietarioRepository;

    public Propietario guardarPropietario(Propietario propietario) {
        return propietarioRepository.save(propietario);
    }

    public List<Propietario> listarTodos() {
        return propietarioRepository.findAll();
    }

    public Propietario buscarPorId(Long id) {
        return propietarioRepository.findById(id).orElse(null);
    }

    // --- NUEVO: Método para ELIMINAR (Este es el que te faltaba) ---
    public void eliminarPropietario(Long id) {
        propietarioRepository.deleteById(id);
    }

    // --- NUEVO: Método para ACTUALIZAR (Mejor tenerlo aquí que en el controlador) ---
    public Propietario actualizarPropietario(Long id, Propietario nuevosDatos) {
        Propietario existente = propietarioRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombre(nuevosDatos.getNombre());
            existente.setApellido(nuevosDatos.getApellido());
            existente.setTelefono(nuevosDatos.getTelefono());
            existente.setEmail(nuevosDatos.getEmail());
            return propietarioRepository.save(existente);
        }
        return null;
    }
}