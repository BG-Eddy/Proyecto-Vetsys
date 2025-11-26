package com.vetsys.backend.service;

import com.vetsys.backend.model.Propietario;
import com.vetsys.backend.repository.PropietarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    // Método útil para cuando vayamos a crear una Mascota vinculada
    public Propietario buscarPorId(Long id) {
        return propietarioRepository.findById(id).orElse(null);
    }
}