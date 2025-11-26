package com.vetsys.backend.repository;

import com.vetsys.backend.model.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropietarioRepository extends JpaRepository<Propietario, Long> {
    // Aquí podríamos agregar búsquedas personalizadas en el futuro
    // Ejemplo: Propietario findByTelefono(String telefono);
}