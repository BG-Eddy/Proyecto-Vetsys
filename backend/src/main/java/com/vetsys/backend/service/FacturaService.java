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
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final PropietarioRepository propietarioRepository;
    private final ServicioRepository servicioRepository;
    private final MascotaRepository mascotaRepository;
    private final CitaRepository citaRepository;

    // --- 1. Generar Factura (Lógica de Negocio) ---
    @Transactional
    public Factura generarFactura(FacturaRegistroDTO dto) {

        // A. Buscar quién paga (Propietario)
        Propietario propietario = propietarioRepository.findById(dto.getIdPropietario())
                .orElseThrow(() -> new RuntimeException("Propietario no encontrado ID: " + dto.getIdPropietario()));

        // B. Crear la estructura base de la Factura
        Factura factura = Factura.builder()
                .propietario(propietario)
                .detalles(new ArrayList<>()) // Lista vacía lista para recibir ítems
                .total(BigDecimal.ZERO)      // Total inicia en 0.00
                .build();

        // C. Vincular con Cita (si viene el ID en el JSON)
        if (dto.getIdCita() != null) {
            Cita cita = citaRepository.findById(dto.getIdCita())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada ID: " + dto.getIdCita()));
            factura.setCita(cita);
        }

        // D. Procesar la lista de productos/servicios (El carrito de compras)
        if (dto.getItems() != null) {
            for (DetalleFacturaDTO itemDTO : dto.getItems()) {

                // 1. Buscar Servicio (Para obtener el precio real de la BD)
                Servicio servicio = servicioRepository.findById(itemDTO.getIdServicio())
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado ID: " + itemDTO.getIdServicio()));

                // 2. Buscar a qué Mascota se aplicó
                Mascota mascota = mascotaRepository.findById(itemDTO.getIdMascota())
                        .orElseThrow(() -> new RuntimeException("Mascota no encontrada ID: " + itemDTO.getIdMascota()));

                // 3. Cálculos matemáticos (Precio * Cantidad)
                BigDecimal precioUnitario = servicio.getPrecio(); // Asumiendo que Servicio tiene un campo 'precio' BigDecimal
                BigDecimal cantidad = new BigDecimal(itemDTO.getCantidad());
                BigDecimal subtotal = precioUnitario.multiply(cantidad);

                // 4. Crear el objeto DetalleFactura
                DetalleFactura detalle = DetalleFactura.builder()
                        .factura(factura)       // Enlace Padre -> Hijo
                        .servicio(servicio)
                        .mascota(mascota)
                        .cantidad(itemDTO.getCantidad())
                        .precioUnitario(precioUnitario)
                        .subtotal(subtotal)
                        .build();

                // 5. Agregarlo a la lista de la factura y sumar al total global
                factura.getDetalles().add(detalle);
                factura.setTotal(factura.getTotal().add(subtotal));
            }
        }

        // E. Guardar en Base de Datos
        // Al usar CascadeType.ALL en la entidad Factura, esto guarda la factura Y sus detalles automáticamente.
        return facturaRepository.save(factura);
    }

    // --- 2. Listar todas las facturas ---
    public List<Factura> listarTodas() {
        return facturaRepository.findAll();
    }
}