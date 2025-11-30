package com.vetsys.backend.service;

import com.vetsys.backend.dto.DetalleFacturaDTO;
import com.vetsys.backend.dto.FacturaRegistroDTO;
import com.vetsys.backend.model.*;
import com.vetsys.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final PropietarioRepository propietarioRepository;
    private final ServicioRepository servicioRepository;
    private final MascotaRepository mascotaRepository;
    private final CitaRepository citaRepository; // Opcional

    @Transactional
    public Factura generarFactura(FacturaRegistroDTO dto) {

        // 1. Buscar Propietario
        Propietario propietario = propietarioRepository.findById(dto.getIdPropietario())
                .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

        // 2. Crear la Cabecera de la Factura
        Factura factura = Factura.builder()
                .propietario(propietario)
                .detalles(new ArrayList<>()) // Inicializamos la lista vacía
                .total(BigDecimal.ZERO)      // Inicializamos en 0
                .build();

        // 3. Vincular Cita (si existe)
        if (dto.getIdCita() != null) {
            Cita cita = citaRepository.findById(dto.getIdCita()).orElse(null);
            factura.setCita(cita);
        }

        // 4. Procesar cada ítem de la lista (Loop)
        for (DetalleFacturaDTO item : dto.getItems()) {

            // Buscar Servicio y Mascota
            Servicio servicio = servicioRepository.findById(item.getIdServicio())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado ID: " + item.getIdServicio()));

            Mascota mascota = mascotaRepository.findById(item.getIdMascota())
                    .orElseThrow(() -> new RuntimeException("Mascota no encontrada ID: " + item.getIdMascota()));

            // Calcular Subtotales (Precio * Cantidad)
            // En Java con BigDecimal no se usa '*', se usa .multiply()
            BigDecimal precioUnitario = servicio.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(new BigDecimal(item.getCantidad()));

            // Crear el Detalle
            DetalleFactura detalle = DetalleFactura.builder()
                    .factura(factura) // Vinculamos hacia arriba
                    .servicio(servicio)
                    .mascota(mascota)
                    .cantidad(item.getCantidad())
                    .precioUnitario(precioUnitario)
                    .subtotal(subtotal)
                    .build();

            // Agregar a la lista de la factura
            factura.getDetalles().add(detalle);

            // Sumar al total general
            factura.setTotal(factura.getTotal().add(subtotal));
        }

        // 5. Guardar todo (Gracias al CascadeType.ALL, al guardar factura se guardan los detalles)
        return facturaRepository.save(factura);
    }
}