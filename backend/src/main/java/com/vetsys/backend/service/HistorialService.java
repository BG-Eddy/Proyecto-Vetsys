package com.vetsys.backend.service;

import com.vetsys.backend.dto.HistorialRegistroDTO;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.model.HistorialClinico;
import com.vetsys.backend.repository.CitaRepository;
import com.vetsys.backend.repository.HistorialClinicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialService {

    private final HistorialClinicoRepository historialRepository;
    private final CitaRepository citaRepository;

    @Transactional
    public HistorialClinico registrarAtencion(HistorialRegistroDTO dto) {
        Cita cita = citaRepository.findById(dto.getIdCita())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (historialRepository.findByCita_IdCita(dto.getIdCita()).isPresent()) {
            throw new RuntimeException("Esta cita ya tiene un historial registrado");
        }

        HistorialClinico historial = HistorialClinico.builder()
                .cita(cita)
                .diagnostico(dto.getDiagnostico())
                .tratamiento(dto.getTratamiento())
                .observaciones(dto.getObservaciones())
                .proximoControl(dto.getProximoControl())
                .build();


        cita.setEstado(EstadoCita.REALIZADA);
        citaRepository.save(cita);

        return historialRepository.save(historial);
    }

    public List<HistorialClinico> buscarPorMascota(Long idMascota) {
        // Devuelve todo el historial por ahora
        return historialRepository.findAll();
    }
}