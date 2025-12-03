import React, { useState } from "react";
import {
  Grid, Paper, TextField, Button, Typography, Box, Alert, Stack, CssBaseline, Container
} from "@mui/material";
import PetsIcon from '@mui/icons-material/Pets'; 
import { useAuth } from "../context/AuthContext";

// URL de imagen de alta calidad
const PET_IMAGE_URL = "https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const exito = await login(username, password);
    if (!exito) setError("Usuario o contraseña incorrectos");
  };

  return (
    <Grid 
      container 
      component="main" 
      sx={{ 
        height: '100vh',
        width: '100vw',
        // 1. AJUSTE DE IMAGEN 
        backgroundImage: `url(${PET_IMAGE_URL})`,
        backgroundRepeat: 'no-repeat',
       
        backgroundSize: 'cover',     
        backgroundPosition: 'center center', // Centrado horizontal y verticalmente
        
        // 2. ALINEACIÓN A LA DERECHA DEL LOGIN
        display: 'flex',
        justifyContent: 'flex-end', // Empuja el contenido a la derecha
        alignItems: 'center',       // Centra verticalmente
      }}
    >
      <CssBaseline />

      {/* CONTENEDOR DEL FORMULARIO */}
      <Container 
        maxWidth="sm" 
        sx={{ 
            mr: { xs: 2, md: 10 }, // Margen derecho responsivo
            ml: { xs: 2, md: 0 },   // Margen izquierdo en móviles
            display: 'flex',
            justifyContent: 'center', // Centra el Paper dentro del Container
        }} 
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            width: '100%', // Ocupa todo el ancho del container
            maxWidth: '400px', // Ancho máximo del formulario
            // 3. ESTILO "GLASSMORPHISM"
            backgroundColor: 'rgba(255, 255, 255, 0.85)', // Un poco más opaco para legibilidad
            backdropFilter: 'blur(8px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Icono */}
          <Box sx={{ bgcolor: '#1E3A5F', p: 1.5, borderRadius: '50%', mb: 1, boxShadow: 3 }}>
            <PetsIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: '800', color: '#1E3A5F', textShadow: '0px 1px 1px rgba(255,255,255,0.8)' }}>
            VetSys
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#1E3A5F', fontWeight: '500' }}>
            Acceso Administrativo
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={3}>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              
              <TextField
                label="Usuario"
                variant="outlined"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                sx={{ 
                    backgroundColor: 'rgba(255,255,255, 0.6)', 
                    '& .MuiOutlinedInput-root': { borderRadius: 2 } 
                }}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ 
                    backgroundColor: 'rgba(255,255,255, 0.6)',
                    '& .MuiOutlinedInput-root': { borderRadius: 2 } 
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  backgroundColor: '#1E3A5F',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#152b47' },
                  boxShadow: '0 4px 15px rgba(30, 58, 95, 0.3)'
                }}
              >
                INICIAR SESIÓN
              </Button>
            </Stack>
          </form>
          
          <Box mt={4} textAlign="center">
            <Typography variant="caption" sx={{ color: '#1E3A5F', fontWeight: 'bold' }}>
                © 2025 VetSys Gestión Integral
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Grid>
  );
};

export default Login;