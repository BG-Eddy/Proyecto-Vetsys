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
    private final PropietarioRepository propietarioRepository;

    public List<Mascota> listarTodas() {
        return mascotaRepository.findAll();
    }

    public Mascota registrarMascota(MascotaRegistroDTO dto) {
        // Ya no necesitamos Long.valueOf() porque en el DTO es Long
        Propietario propietario = propietarioRepository.findById(dto.getIdPropietario())
                .orElseThrow(() -> new RuntimeException("El propietario no existe"));

        Mascota mascota = Mascota.builder()
                .nombre(dto.getNombre())
                .especie(dto.getEspecie())
                .raza(dto.getRaza())
                .sexo(dto.getSexo())
                .fechaNacimiento(dto.getFechaNacimiento())
                .propietario(propietario)
                .estado("ACTIVO") // Aseguramos estado
                .build();

        return mascotaRepository.save(mascota);
    }

    public Mascota buscarPorId(Long id) {
        return mascotaRepository.findById(id).orElse(null);
    }

    public Mascota actualizarMascota(Long id, MascotaRegistroDTO dto) {
        Mascota mascota = mascotaRepository.findById(id).orElse(null);
        if (mascota != null) {
            mascota.setNombre(dto.getNombre());
            mascota.setEspecie(dto.getEspecie());
            mascota.setRaza(dto.getRaza());
            mascota.setSexo(dto.getSexo());
            mascota.setFechaNacimiento(dto.getFechaNacimiento());

            if (dto.getIdPropietario() != null) {
                Propietario nuevoPropietario = propietarioRepository.findById(dto.getIdPropietario())
                        .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));
                mascota.setPropietario(nuevoPropietario);
            }
            return mascotaRepository.save(mascota);
        }
        return null;
    }

    public void eliminarMascota(Long id) {
        mascotaRepository.deleteById(id);
    }
}