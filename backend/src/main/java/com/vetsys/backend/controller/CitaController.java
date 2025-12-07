package com.vetsys.backend.controller;

import com.vetsys.backend.dto.CitaRegistroDTO;
import com.vetsys.backend.model.Cita;
import com.vetsys.backend.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    private final CitaService citaService;

    // 1. Crear Cita
    @PostMapping
    public Cita agendar(@RequestBody CitaRegistroDTO dto) {
        return citaService.agendarCita(dto);
    }

    // 2. Listar Citas
    @GetMapping
    public List<Cita> listar() {
        return citaService.listarCitas();
    }

    // 3. Cancelar Cita
    @PutMapping("/{id}/cancelar")
    public Cita cancelarCita(@PathVariable Long id) {
        return citaService.cancelarCita(id);
    }

    // 4. Finalizar Cita
    @PutMapping("/{id}/finalizar")
    public Cita finalizarCita(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String observaciones = payload.get("observaciones");
        String tratamiento = payload.get("tratamiento");

        String motivoProximoControl = payload.get("motivoProximoControl");
        String precioStr = payload.get("precio");
        Double precioFinal = (precioStr != null && !precioStr.isEmpty()) ? Double.valueOf(precioStr) : 0.0;

        String fechaControlStr = payload.get("proximoControl");
        LocalDate proximoControl = null;

        if (fechaControlStr != null && !fechaControlStr.isEmpty()) {
            try {
                proximoControl = LocalDate.parse(fechaControlStr);
            } catch (DateTimeParseException e) {
                proximoControl = null;
            }
        }

        return citaService.finalizarCita(id, observaciones, tratamiento, proximoControl, precioFinal, motivoProximoControl);
    }

    // 5. Reprogramar Cita
    @PutMapping("/{id}/reprogramar")
    public Cita reprogramarCita(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String fechaStr = (String) payload.get("fechaHora");
        String motivo = (String) payload.get("motivo");

        LocalDateTime nuevaFecha = LocalDateTime.parse(fechaStr);

        return citaService.reprogramarCita(id, nuevaFecha, motivo);
    }

    // 6. Eliminar Cita
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        citaService.eliminarCita(id);
    }

    // 7. Atención Directa
    @PostMapping("/urgencia")
    public Cita crearAtencionDirecta(@RequestBody com.vetsys.backend.dto.AtencionDirectaDTO dto) {
        return citaService.crearAtencionDirecta(dto);
    }
}