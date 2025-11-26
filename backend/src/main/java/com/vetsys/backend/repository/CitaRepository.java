package com.vetsys.backend.repository;

import com.vetsys.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // Método útil para el futuro: Ver citas de una mascota específica
    List<Cita> findByMascota_IdMascota(Long idMascota);

    // Método útil para el futuro: Ver citas de un veterinario específico
    List<Cita> findByVeterinario_IdVeterinario(Long idVeterinario);
}