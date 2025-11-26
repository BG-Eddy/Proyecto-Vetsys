package com.vetsys.backend.service;

import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.repository.MascotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // Lombok crea el constructor con el Repository automáticamente
public class MascotaService {

    private final MascotaRepository mascotaRepository;

    // Método para guardar una mascota
    public Mascota registrarMascota(Mascota mascota) {
        // Aquí podrías poner validaciones (ej: validar que no exista el nombre)
        return mascotaRepository.save(mascota);
    }

    // Método para listar todas
    public List<Mascota> listarTodas() {
        return mascotaRepository.findAll();
    }
}