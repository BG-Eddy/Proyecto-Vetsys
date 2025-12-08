package com.vetsys.backend.config;

import org.springframework.beans.factory.annotation.Value; // Importante para @Value
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays; // Importante para procesar la lista de URLs
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // --- 1. INYECCIÓN DE VARIABLES DESDE APPLICATION.PROPERTIES ---

    @Value("${vetsys.admin.username}")
    private String adminUsername;

    @Value("${vetsys.admin.password}")
    private String adminPassword;

    @Value("${vetsys.cors.allowed-origins}")
    private String allowedOrigins; // Recibe un String, ej: "http://localhost:5173,https://mi-web.vercel.app"

    // --- 2. DEFINICIÓN DEL USUARIO EN MEMORIA (DINÁMICO) ---
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withDefaultPasswordEncoder()
                .username(adminUsername) // <--- Usa el valor inyectado
                .password(adminPassword) // <--- Usa el valor inyectado
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user);
    }

    // --- 3. FILTRO DE SEGURIDAD ---
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Permite pre-vuelo (OPTIONS) para que React pueda preguntar permisos antes de conectar
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // --- 4. CONFIGURACIÓN CORS (DINÁMICA) ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}