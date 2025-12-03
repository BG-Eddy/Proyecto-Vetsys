import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline, Typography, ThemeProvider, createTheme } from '@mui/material';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './Components/Login.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './pages/Home';
import PropietariosList from './pages/PropietariosList';
import MascotasList from './pages/MascotasList';
import VeterinariosList from './pages/VeterinariosList';
import CitasList from './pages/CitasList';
import HistorialClinico from './pages/HistorialClinico';
import FacturasList from './pages/FacturasList';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A5F', 
      light: '#4b638d',
      dark: '#001634',
    },
    secondary: {
      main: '#D4A373', 
      contrastText: '#fff'
    },
    background: {
      default: '#FAF9F6', 
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#607D8B',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif', // Poppins es muy moderna y limpia
    h4: { fontWeight: 700, color: '#1E3A5F', letterSpacing: '-0.5px' },
    h5: { fontWeight: 600, color: '#1E3A5F' },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '1rem' }
  },
  shape: {
    borderRadius: 16, // Bordes muy redondeados (amigables, estilo mascota)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px', // Botones estilo píldora
          padding: '8px 24px',
          boxShadow: '0 4px 6px rgba(30, 58, 95, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(30, 58, 95, 0.25)',
          }
        },
        containedSecondary: {
            color: 'white' // Texto blanco en botones dorados
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Quitamos elevación por defecto
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', // Sombra suave "flotante"
        }
      }
    },
    MuiDialogTitle: {
        styleOverrides: {
            root: {
                backgroundColor: '#1E3A5F',
                color: 'white',
                textAlign: 'center',
                fontSize: '1.2rem'
            }
        }
    }
  }
});

const AppContent = () => {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
      <CssBaseline />
      <Navbar />
      
      {/* Contenedor Principal con z-index para estar sobre las texturas del fondo */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/propietarios" element={<PropietariosList />} />
          <Route path="/mascotas" element={<MascotasList />} />
          <Route path="/veterinarios" element={<VeterinariosList />} />
          <Route path="/citas" element={<CitasList />} />
          <Route path="/historial" element={<HistorialClinico />} />
          <Route path="/facturas" element={<FacturasList />} />
        </Routes>
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', color: '#1E3A5F' }}>
            © 2025 VetSys. Cuidamos lo que amas.
          </Typography>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;