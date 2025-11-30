package com.vetsys.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Desactivamos CSRF porque es una API REST sin estado (necesario para POST/PUT/DELETE)
                .csrf(AbstractHttpConfigurer::disable)
                // Configuramos los permisos
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated() // "Cualquier petición requiere login"
                )
                // Activamos HTTP Basic (El modo simple para Postman y Frontends básicos)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // Inyectamos valores desde application.properties
    @org.springframework.beans.factory.annotation.Value("${vetsys.admin.username}")
    private String adminUsername;

    @org.springframework.beans.factory.annotation.Value("${vetsys.admin.password}")
    private String adminPassword;

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.withDefaultPasswordEncoder()
                .username(adminUsername)
                .password(adminPassword)
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}