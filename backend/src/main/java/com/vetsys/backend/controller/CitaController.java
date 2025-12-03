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
@CrossOrigin(origins = "http://localhost:5173") // Ajusta esto a tu puerto de React
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

    // 4. Finalizar Cita (ACTUALIZADO CON 3 CAMPOS SEPARADOS)
    @PutMapping("/{id}/finalizar")
    public Cita finalizarCita(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        // Extraemos los datos de texto
        String observaciones = payload.get("observaciones");
        String tratamiento = payload.get("tratamiento");

        // Extraemos y convertimos la fecha del próximo control
        String fechaControlStr = payload.get("proximoControl");
        LocalDate proximoControl = null;

        if (fechaControlStr != null && !fechaControlStr.isEmpty()) {
            try {
                // Parsea el string "YYYY-MM-DD" que viene del input type="date"
                proximoControl = LocalDate.parse(fechaControlStr);
            } catch (DateTimeParseException e) {
                System.err.println("Error al parsear la fecha de control: " + e.getMessage());
                // Si la fecha viene mal, la dejamos en null para no romper el flujo
                proximoControl = null;
            }
        }

        // Llamamos al servicio con los 4 argumentos (id, obs, trat, fecha)
        // Nota: Asegúrate de que tu CitaService.finalizarCita acepte (Long, String, String, LocalDate)
        return citaService.finalizarCita(id, observaciones, tratamiento, proximoControl);
    }

    // 5. Reprogramar Cita
    @PutMapping("/{id}/reprogramar")
    public Cita reprogramarCita(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String fechaStr = (String) payload.get("fechaHora");
        String motivo = (String) payload.get("motivo");

        LocalDateTime nuevaFecha = LocalDateTime.parse(fechaStr);

        return citaService.reprogramarCita(id, nuevaFecha, motivo);
    }
}