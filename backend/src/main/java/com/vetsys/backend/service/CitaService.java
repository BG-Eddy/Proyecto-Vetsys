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
                .precio(null)
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

    @Transactional
    public Cita finalizarCita(Long id, String observaciones, String tratamiento, LocalDate proximoControl, Double precioFinal, String motivoProximoControl) {
        // A. Buscamos la cita actual
        Cita citaActual = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // B. Guardamos datos clínicos y FINANCIEROS
        citaActual.setObservaciones(observaciones);
        citaActual.setTratamiento(tratamiento);
        citaActual.setProximoControl(proximoControl);
        citaActual.setPrecio(precioFinal); // <--- AQUÍ SE ASIGNA EL PRECIO REAL

        // C. Cambiamos estado a REALIZADA
        citaActual.obtenerComportamiento().finalizar(citaActual);

        // --- D. GENERACIÓN AUTOMÁTICA DE FACTURA ---
        Factura facturaAuto = Factura.builder()
                .fechaFactura(LocalDateTime.now())
                .propietario(citaActual.getMascota().getPropietario())
                .cita(citaActual)
                // Usamos el precioFinal que acaba de llegar
                .total(precioFinal != null ? BigDecimal.valueOf(precioFinal) : BigDecimal.ZERO)
                .detalles(new ArrayList<>())
                .build();

        facturaRepository.save(facturaAuto);

        if (proximoControl != null) {
            // Usamos el motivo personalizado si existe, si no, uno genérico
            String motivoCita = (motivoProximoControl != null && !motivoProximoControl.isEmpty())
                    ? motivoProximoControl
                    : "CONTROL: Seguimiento de cita #" + citaActual.getIdCita();

            Cita nuevaCitaControl = Cita.builder()
                    .fechaHora(LocalDateTime.of(proximoControl, LocalTime.of(9, 0)))
                    .motivo(motivoCita) // <--- USA EL MOTIVO PERSONALIZADO
                    .estado(EstadoCita.PROGRAMADA)
                    .mascota(citaActual.getMascota())
                    .veterinario(citaActual.getVeterinario())
                    .precio(null) // Las nuevas citas nacen sin precio
                    .build();

            citaRepository.save(nuevaCitaControl);
        }

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

    public void eliminarCita(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (cita.getEstado() != EstadoCita.CANCELADA) {
            throw new RuntimeException("Solo se pueden eliminar citas que han sido CANCELADAS.");
        }

        citaRepository.delete(cita);
    }

    @Transactional
    public Cita crearAtencionDirecta(com.vetsys.backend.dto.AtencionDirectaDTO dto) {
        // 1. Validar existencias
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        // 2. Crear la Cita ya REALIZADA
        Cita cita = Cita.builder()
                .fechaHora(LocalDateTime.now())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.REALIZADA)
                .mascota(mascota)
                .veterinario(veterinario)
                .precio(dto.getPrecio())
                .observaciones(dto.getObservaciones())
                .tratamiento(dto.getTratamiento())
                .proximoControl(dto.getProximoControl())
                .build();

        Cita citaGuardada = citaRepository.save(cita);

        // 3. Generar Factura Automática
        Factura factura = Factura.builder()
                .fechaFactura(LocalDateTime.now())
                .propietario(mascota.getPropietario())
                .cita(citaGuardada)
                .total(BigDecimal.valueOf(dto.getPrecio()))
                .detalles(new ArrayList<>())
                .build();

        facturaRepository.save(factura);

        // 4. Agendar Próximo Control (Si aplica)
        if (dto.getProximoControl() != null) {
            String motivoControl = (dto.getMotivoProximoControl() != null && !dto.getMotivoProximoControl().isEmpty())
                    ? dto.getMotivoProximoControl()
                    : "CONTROL: Seguimiento de urgencia #" + citaGuardada.getIdCita();

            Cita citaControl = Cita.builder()
                    .fechaHora(LocalDateTime.of(dto.getProximoControl(), LocalTime.of(9, 0)))
                    .motivo(motivoControl)
                    .estado(EstadoCita.PROGRAMADA)
                    .mascota(mascota)
                    .veterinario(veterinario)
                    .precio(null)
                    .build();

            citaRepository.save(citaControl);
        }

        return citaGuardada;
    }
}