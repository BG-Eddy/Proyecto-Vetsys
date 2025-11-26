package com.vetsys.backend.repository;

import com.vetsys.backend.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    // ¡Listo! Al extender de JpaRepository, ya tienes métodos como:
    // .save(), .findAll(), .findById(), .delete() sin escribir código.
}