package com.vetsys.backend.service;

import com.vetsys.backend.dto.MascotaRegistroDTO;
import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.model.Propietario;
import com.vetsys.backend.repository.MascotaRepository;
import com.vetsys.backend.repository.PropietarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final PropietarioRepository propietarioRepository; // Inyectamos el repositorio de dueños

    public Mascota registrarMascota(MascotaRegistroDTO dto) {

        // 1. Buscamos al Propietario usando el ID que viene en el DTO
        Propietario propietario = propietarioRepository.findById(dto.getIdPropietario())
                .orElseThrow(() -> new RuntimeException("El propietario no existe"));

        // 2. Convertimos (Mapeamos) DTO -> Entidad
        // Usamos el Builder para crear la Mascota limpia
        Mascota mascota = Mascota.builder()
                .nombre(dto.getNombre())
                .especie(dto.getEspecie())
                .raza(dto.getRaza())
                .sexo(dto.getSexo())
                .fechaNacimiento(dto.getFechaNacimiento())
                .propietario(propietario) // Asignamos el objeto propietario encontrado
                .build();

        // 3. Guardamos la entidad real en la BD
        return mascotaRepository.save(mascota);
    }

    public List<Mascota> listarTodas() {
        return mascotaRepository.findAll();
    }
}