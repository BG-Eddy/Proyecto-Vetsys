package com.vetsys.backend.service;

import com.vetsys.backend.dto.CitaRegistroDTO;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.repository.CitaRepository;
import com.vetsys.backend.repository.MascotaRepository;
import com.vetsys.backend.repository.VeterinarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;

    public Cita agendarCita(CitaRegistroDTO dto) {
        // 1. Validar Mascota
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        // 2. Validar Veterinario
        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        // 3. Construir la Cita
        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.PROGRAMADA)
                .mascota(mascota)        // Asignamos el objeto completo
                .veterinario(veterinario) // Asignamos el objeto completo
                .build();

        return citaRepository.save(cita);
    }

    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }
}