package com.vetsys.backend.repository;

import com.vetsys.backend.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {
    // Buscar historial por ID de cita (para ver si ya tiene uno)
    Optional<HistorialClinico> findByCita_IdCita(Long idCita);
}