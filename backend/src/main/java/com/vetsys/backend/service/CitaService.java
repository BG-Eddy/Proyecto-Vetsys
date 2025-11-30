package com.vetsys.backend.service;

import com.vetsys.backend.dto.CitaRegistroDTO;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.event.CitaAgendadaEvent;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.repository.CitaRepository;
import com.vetsys.backend.repository.MascotaRepository;
import com.vetsys.backend.repository.VeterinarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;

    // Inyectamos el Publicador de Eventos
    private final ApplicationEventPublisher eventPublisher;

    // Método 1: Agendar Cita (Creación estándar)
    public Cita agendarCita(CitaRegistroDTO dto) {

        // Validar Mascota
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        // Validar Veterinario
        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        // Construir
        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.PROGRAMADA)
                .mascota(mascota)
                .veterinario(veterinario)
                .build();

        // Guardamos la cita primero
        Cita citaGuardada = citaRepository.save(cita);

        // --- PUBLICAR EVENTO (Observer Pattern) ---
        // Esto dispara el listener sin bloquear la respuesta al usuario
        eventPublisher.publishEvent(new CitaAgendadaEvent(this, citaGuardada));

        return citaGuardada;
    }

    // Método 2: Listar todas
    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }

    // Método 3: Cancelar Cita (USANDO PATRÓN STATE)
    public Cita cancelarCita(Long idCita) {
        // 1. Buscar la cita
        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + idCita));

        // 2. Delegar la lógica al estado actual
        cita.obtenerComportamiento().cancelar(cita);

        // 3. Guardar el cambio de estado
        return citaRepository.save(cita);
    }
}