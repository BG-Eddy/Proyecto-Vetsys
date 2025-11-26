package com.vetsys.backend.service;

import com.vetsys.backend.dto.HistorialRegistroDTO;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.model.HistorialClinico;
import com.vetsys.backend.repository.CitaRepository;
import com.vetsys.backend.repository.HistorialClinicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante para asegurar que ambas cosas pasen

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialService {

    private final HistorialClinicoRepository historialRepository;
    private final CitaRepository citaRepository;

    @Transactional // Si falla algo, deshace todo (Rollback)
    public HistorialClinico registrarAtencion(HistorialRegistroDTO dto) {

        // 1. Buscar la Cita
        Cita cita = citaRepository.findById(dto.getIdCita())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // 2. Verificar que la cita no tenga historial ya (Opcional, pero recomendado)
        if (historialRepository.findByCita_IdCita(dto.getIdCita()).isPresent()) {
            throw new RuntimeException("Esta cita ya tiene un historial registrado");
        }

        // 3. Crear el Historial
        HistorialClinico historial = HistorialClinico.builder()
                .cita(cita)
                .diagnostico(dto.getDiagnostico())
                .tratamiento(dto.getTratamiento())
                .observaciones(dto.getObservaciones())
                .proximoControl(dto.getProximoControl())
                .build();

        // 4. ACTUALIZAR ESTADO DE LA CITA
        cita.setEstado(EstadoCita.REALIZADA);
        citaRepository.save(cita); // Guardamos la actualización de la cita

        // 5. Guardar y retornar el historial
        return historialRepository.save(historial);
    }

    // Ver historial específico de una mascota (Futuro)
    public List<HistorialClinico> buscarPorMascota(Long idMascota) {
        // Esto requeriría una query personalizada en el repositorio,
        // por ahora dejémoslo pendiente o usa findAll()
        return historialRepository.findAll();
    }
}