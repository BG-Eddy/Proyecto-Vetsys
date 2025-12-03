package com.vetsys.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @GetMapping
    public String login(Principal principal) {
        // Si llega aquí, es que la contraseña es correcta
        return "Login exitoso: " + principal.getName();
    }
}