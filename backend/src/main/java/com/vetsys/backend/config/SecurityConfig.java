package com.vetsys.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer; // <--- Importante para .withDefaults()
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

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. DEFINIMOS EL USUARIO Y CONTRASEÑA (EN MEMORIA)
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withDefaultPasswordEncoder() // Solo para desarrollo
                .username("admin")       // <--- TU USUARIO
                .password("admin123")    // <--- TU CONTRASEÑA
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user);
    }

    // 2. CONFIGURAMOS EL FILTRO DE SEGURIDAD
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Permite acceso libre a OPTIONS (necesario para React)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Todo lo demás requiere contraseña
                        .anyRequest().authenticated()
                )
                // Activamos Autenticación Básica (ventana emergente o header Auth)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // 3. CONFIGURACIÓN CORS (Mantenemos la que ya tenías)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Tus puertos de React
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Importante: Authorization debe estar permitido (el * lo cubre, pero es bueno saberlo)
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}