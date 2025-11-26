package com.vetsys.backend.repository;

import com.vetsys.backend.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {

    // Método extra útil: Buscar veterinarios activos
    // Spring crea la query automáticamente al leer "findByEstado"
    List<Veterinario> findByEstado(String estado);
}