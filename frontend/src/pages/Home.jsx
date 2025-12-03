import React from 'react';
import { 
  Box, Grid, Typography, Paper, Button, Container, Stack, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta si es necesario

// Iconos
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PetsIcon from '@mui/icons-material/Pets';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Para mostrar el nombre del usuario si quieres

  // Datos para las tarjetas de acceso rápido
  const menuItems = [
    { 
      title: 'Nueva Cita', 
      desc: 'Agendar consulta o control', 
      icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />, 
      path: '/citas',
      color: '#1E3A5F' // Azul
    },
    { 
      title: 'Registrar Paciente', 
      desc: 'Ingresar nueva mascota', 
      icon: <PetsIcon sx={{ fontSize: 40 }} />, 
      path: '/mascotas',
      color: '#D4A373' // Dorado
    },
    { 
      title: 'Propietarios', 
      desc: 'Gestión de clientes', 
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />, 
      path: '/propietarios',
      color: '#607D8B' // Gris Azulado
    },
    { 
      title: 'Facturación', 
      desc: 'Ver cobros y pagos', 
      icon: <ReceiptLongIcon sx={{ fontSize: 40 }} />, 
      path: '/facturas',
      color: '#2E7D32' // Verde elegante
    },
    { 
      title: 'Historial Clínico', 
      desc: 'Consultar expedientes', 
      icon: <MedicalInformationIcon sx={{ fontSize: 40 }} />, 
      path: '/historial',
      color: '#C2185B' // Rosa oscuro elegante
    }
  ];

  return (
    <Container maxWidth="lg">
      
      {/* --- SECCIÓN DE BIENVENIDA --- */}
      <Box sx={{ mb: 6, mt: 2, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, color: '#1E3A5F', mb: 1 }}>
          Hola, Administrador
        </Typography>
        <Typography variant="h6" sx={{ color: '#546E7A', fontWeight: 400 }}>
          Bienvenido al panel de control de <strong>VetSys</strong>. ¿Qué deseas hacer hoy?
        </Typography>
        <Divider sx={{ width: '100px', margin: '20px auto', borderColor: '#D4A373', borderWidth: 2, borderRadius: 1 }} />
      </Box>

      {/* --- GRID DE TARJETAS (DASHBOARD) --- */}
      <Grid container spacing={4} justifyContent="center">
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              onClick={() => navigate(item.path)}
              sx={{
                p: 3,
                height: '100%',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(0,0,0,0.05)',
                background: 'white',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(30, 58, 95, 0.15)',
                  borderColor: item.color,
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2
              }}
            >
              {/* Decoración circular detrás del icono */}
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: `${item.color}15`, // Color con 15% opacidad
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: item.color,
                  mb: 1
                }}
              >
                {item.icon}
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>

              {/* Flecha discreta al final */}
              <Box sx={{ mt: 'auto', pt: 2, opacity: 0.6 }}>
                 <ArrowForwardIcon sx={{ color: item.color }} />
              </Box>

            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* --- WIDGET INFORMATIVO RÁPIDO (Opcional) --- */}
      <Box sx={{ mt: 8, p: 4, bgcolor: '#1E3A5F', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          {/* Círculos decorativos de fondo */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: 50, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                  <Typography variant="h5" fontWeight="bold">Sistema Integral VetSys</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Gestión eficiente para el cuidado animal.</Typography>
              </Box>
              <Button 
                variant="contained" 
                sx={{ 
                    bgcolor: '#D4A373', 
                    color: 'white', 
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#b88b5e' }
                }}
                onClick={() => navigate('/citas')}
              >
                Ver Agenda de Hoy
              </Button>
          </Stack>
      </Box>

    </Container>
  );
};

export default Home;