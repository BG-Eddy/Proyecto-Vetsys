package com.vetsys.backend.service;

import com.vetsys.backend.dto.CitaRegistroDTO;
import com.vetsys.backend.event.CitaAgendadaEvent;
import com.vetsys.backend.enums.EstadoCita;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.model.Factura; // Importar Modelo Factura
import com.vetsys.backend.model.Mascota;
import com.vetsys.backend.model.Veterinario;
import com.vetsys.backend.repository.CitaRepository;
import com.vetsys.backend.repository.FacturaRepository; // Importar Repo Factura
import com.vetsys.backend.repository.MascotaRepository;
import com.vetsys.backend.repository.VeterinarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal; // Importante para el dinero
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;

    // 1. INYECTAMOS EL REPOSITORIO DE FACTURAS
    private final FacturaRepository facturaRepository;

    private final ApplicationEventPublisher eventPublisher;

    public Cita agendarCita(CitaRegistroDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .precio(dto.getPrecio())
                .estado(EstadoCita.PROGRAMADA)
                .mascota(mascota)
                .veterinario(veterinario)
                .build();

        Cita guardada = citaRepository.save(cita);
        eventPublisher.publishEvent(new CitaAgendadaEvent(this, guardada));
        return guardada;
    }

    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }

    public Cita cancelarCita(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        cita.obtenerComportamiento().cancelar(cita);
        return citaRepository.save(cita);
    }

    // --- MÉTODO ACTUALIZADO: AHORA GENERA FACTURA ---
    @Transactional
    public Cita finalizarCita(Long id, String observaciones, String tratamiento, LocalDate proximoControl) {
        // A. Buscamos la cita actual
        Cita citaActual = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // B. Guardamos datos clínicos
        citaActual.setObservaciones(observaciones);
        citaActual.setTratamiento(tratamiento);
        citaActual.setProximoControl(proximoControl);

        // C. Cambiamos estado a REALIZADA
        citaActual.obtenerComportamiento().finalizar(citaActual);

        // --- D. GENERACIÓN AUTOMÁTICA DE FACTURA ---
        // Creamos una factura vinculada a esta cita y a su dueño
        Factura facturaAuto = Factura.builder()
                .fechaFactura(LocalDateTime.now()) // Fecha de hoy
                .propietario(citaActual.getMascota().getPropietario()) // Dueño de la mascota
                .cita(citaActual) // Vinculamos la cita (Origen)
                // Convertimos el precio Double a BigDecimal. Si es null, ponemos 0.
                .total(citaActual.getPrecio() != null ? BigDecimal.valueOf(citaActual.getPrecio()) : BigDecimal.ZERO)
                .detalles(new ArrayList<>()) // Lista vacía de detalles extra por ahora
                .build();

        facturaRepository.save(facturaAuto);
        // -------------------------------------------

        // E. Lógica de Próximo Control (Cita Automática)
        if (proximoControl != null) {
            Cita nuevaCitaControl = Cita.builder()
                    .fechaHora(LocalDateTime.of(proximoControl, LocalTime.of(9, 0)))
                    .motivo("CONTROL: Seguimiento de cita #" + citaActual.getIdCita())
                    .estado(EstadoCita.PROGRAMADA)
                    .mascota(citaActual.getMascota())
                    .veterinario(citaActual.getVeterinario())
                    .precio(0.0) // Los controles a veces son gratis, o puedes poner precio base
                    .build();

            citaRepository.save(nuevaCitaControl);
        }

        // F. Guardamos la cita original finalizada
        return citaRepository.save(citaActual);
    }

    public Cita reprogramarCita(Long id, LocalDateTime nuevaFecha, String nuevoMotivo) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        cita.setFechaHora(nuevaFecha);
        if (nuevoMotivo != null && !nuevoMotivo.isEmpty()) {
            cita.setMotivo(nuevoMotivo);
        }
        return citaRepository.save(cita);
    }
}